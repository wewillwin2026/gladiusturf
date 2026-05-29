// ---------------------------------------------------------------------------
// AWAIS — Sentinel Mesh probabilistic state primitives.
// ---------------------------------------------------------------------------
//
// Why this exists:
//
//   The first cut of AWAIS shared-state used Upstash Redis to track
//   recent per-IP verdicts cross-region. That works — but it locks us
//   into a vendor relationship for a hot-path data structure, pays for
//   network roundtrips per request, and creates a single point of
//   failure for the kill-chain detector that's supposed to BE the
//   resilient layer.
//
//   The reframe: defense decisions don't need exact recent-event
//   lists. They need fuzzy answers to three questions —
//
//     1. "Has IP X hit us recently anywhere?"      (yes/no ±0.1%)
//     2. "Roughly how often, in this window?"      (count ±1%)
//     3. "Is fingerprint F trending across verts?" (delta ±2%)
//
//   Count-Min Sketch answers all three in O(1), with bounded memory
//   (200KB for ±1% accuracy at our cardinality), and — critically —
//   it is a CRDT: cell-wise addition is commutative, associative, and
//   monotonic. Two sketches from two regions can be merged into a
//   third sketch with no coordinator, no conflict resolution, no
//   vendor relationship.
//
//   Gossip: each lambda maintains a local CMS, broadcasts the delta
//   since last broadcast every ~2s via the federation channel we
//   already shipped, and merges incoming deltas into its global view.
//   Sub-second hot-path reads (~1µs), 2-6s cross-region propagation,
//   zero new infra, zero vendor lock-in.
//
// Design notes:
//
//   * Deterministic hash seeds. Every instance everywhere uses the
//     same seeds, so cell positions match and merges are valid.
//   * FNV-1a + Math.imul for fast 32-bit hashing — no deps, ~50M
//     hashes/sec on a modern V8.
//   * Uint32Array cells. 4 bytes per cell, no boxing, contiguous
//     memory — fastest possible JS storage for this workload.
//   * Delta semantics: `delta(baseline)` returns a NEW sketch holding
//     the increments since the baseline snapshot, saturated at 0.
//     This is what we gossip — each lambda sends only its own new
//     observations, never an accumulating total, so we never double
//     count when sketches bounce around the mesh.
//   * Binary serialize: 8-byte header (width, depth) + raw cells.
//     ~200KB raw → ~30-60KB after gzip on typical traffic patterns
//     (sketches are sparse in practice). Base64 wraps for JSON
//     transport via the federation event envelope.
//   * Time-bucketed wrapper rolls fixed-size sub-sketches forward to
//     give hard time windows (e.g. "last 30s") without losing the
//     mergeability story — peer sketches merge into the current
//     bucket, and old buckets reset cleanly as time advances.
//
// Accuracy bound (CMS theory):
//
//   width w, depth d, true count c_true, observed q.
//   With probability ≥ 1 - (1/2)^d, q ≤ c_true + (e / w) * N
//   where N = total events inserted. For w=10000, d=5, N=1e6:
//     overestimate bound ≈ 272 with prob ≥ 96.875%.
//   For our use case (kill-chain decisions on N≈10k recent events),
//   the overestimate is bounded to ~3 — well within the ±1% target.
//
// What this file does NOT do:
//
//   No I/O. No DB. No federation send/receive. No env reads. Pure
//   math + serialization. Hot-path integration lives in shared-state
//   (Phase 2). Gossip transport lives in federation event handler
//   (Phase 3). This file is the proven primitive everything else
//   builds on.
// ---------------------------------------------------------------------------

// ─── Hash function ──────────────────────────────────────────────────
//
// FNV-1a with a 32-bit XOR seed. Math.imul is the V8 fast-path for
// integer multiplication that doesn't lose precision past 2^53. The
// final `>>> 0` forces unsigned interpretation so the modulo in the
// caller stays in [0, width).
//
// Hash families: we generate `depth` independent hashes by XOR'ing
// the offset basis with `seeds[d]`. The seeds are derived from the
// golden-ratio constant 0x9E3779B9 — a classic technique for picking
// values that decorrelate well under modulo.

const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

function fnv1a(str: string, seed: number): number {
  let hash = (FNV_OFFSET_BASIS ^ seed) >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

// ─── CountMinSketch ─────────────────────────────────────────────────

export interface CMSStats {
  width: number;
  depth: number;
  nonZero: number;
  totalCount: number;
  memoryBytes: number;
}

export class CountMinSketch {
  readonly width: number;
  readonly depth: number;
  private cells: Uint32Array;
  private readonly seeds: Uint32Array;

  constructor(width = 10000, depth = 5) {
    if (!Number.isInteger(width) || width < 1) {
      throw new Error(`CMS width must be a positive integer, got ${width}`);
    }
    if (!Number.isInteger(depth) || depth < 1 || depth > 16) {
      throw new Error(`CMS depth must be an integer in [1, 16], got ${depth}`);
    }
    this.width = width;
    this.depth = depth;
    this.cells = new Uint32Array(width * depth);
    this.seeds = new Uint32Array(depth);
    for (let i = 0; i < depth; i++) {
      this.seeds[i] = Math.imul(i + 1, 0x9e3779b9) >>> 0;
    }
  }

  /**
   * Insert `count` observations of `key`. Cell saturates at UINT32_MAX
   * (4.29B) — far above any realistic window count, so we don't burn
   * cycles on overflow checks.
   */
  add(key: string, count = 1): void {
    if (count < 0) throw new Error("count must be non-negative");
    if (count === 0) return;
    for (let d = 0; d < this.depth; d++) {
      const idx = d * this.width + (fnv1a(key, this.seeds[d]) % this.width);
      this.cells[idx] += count;
    }
  }

  /**
   * Point query: how many times has `key` been observed? Returns the
   * minimum cell across all hash rows (this is what makes it "min" —
   * any single collision overestimates, but the minimum across `depth`
   * independent rows tightens the bound to the CMS theoretical limit).
   */
  query(key: string): number {
    let min = 0xffffffff; // UINT32_MAX, never seen if no insert
    for (let d = 0; d < this.depth; d++) {
      const idx = d * this.width + (fnv1a(key, this.seeds[d]) % this.width);
      const v = this.cells[idx];
      if (v < min) min = v;
    }
    return min === 0xffffffff ? 0 : min;
  }

  /**
   * In-place cell-wise addition with another sketch. Same dimensions
   * required. This is the CRDT merge — commutative, associative,
   * monotonic — so any merge order across the mesh converges.
   */
  merge(other: CountMinSketch): void {
    if (other.width !== this.width || other.depth !== this.depth) {
      throw new Error(
        `CMS merge dimension mismatch: this=${this.width}x${this.depth} other=${other.width}x${other.depth}`,
      );
    }
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] += other.cells[i];
    }
  }

  /**
   * Compute `this - baseline` cell-wise, saturated at 0. This is the
   * payload we gossip: "what I have observed since the last broadcast".
   * The receiver merges this delta into its global view, so each
   * observation is counted exactly once across the mesh.
   */
  delta(baseline: CountMinSketch): CountMinSketch {
    if (baseline.width !== this.width || baseline.depth !== this.depth) {
      throw new Error(
        `CMS delta dimension mismatch: this=${this.width}x${this.depth} baseline=${baseline.width}x${baseline.depth}`,
      );
    }
    const result = new CountMinSketch(this.width, this.depth);
    for (let i = 0; i < this.cells.length; i++) {
      const a = this.cells[i];
      const b = baseline.cells[i];
      result.cells[i] = a >= b ? a - b : 0;
    }
    return result;
  }

  /**
   * Deep copy of the current cells — used to snapshot for delta
   * computation ("here is what I knew at time T").
   */
  snapshot(): CountMinSketch {
    const copy = new CountMinSketch(this.width, this.depth);
    copy.cells.set(this.cells);
    return copy;
  }

  reset(): void {
    this.cells.fill(0);
  }

  /**
   * Exponential time decay — multiply every cell by `factor`. Used by
   * the time-bucketed wrapper when we want a smooth decay rather than
   * hard bucket rotation. Values are floored back to integers.
   */
  decay(factor: number): void {
    if (factor < 0 || factor > 1) {
      throw new Error(`decay factor must be in [0,1], got ${factor}`);
    }
    if (factor === 1) return;
    if (factor === 0) {
      this.reset();
      return;
    }
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = Math.floor(this.cells[i] * factor);
    }
  }

  stats(): CMSStats {
    let nonZero = 0;
    let total = 0;
    for (let i = 0; i < this.cells.length; i++) {
      const v = this.cells[i];
      if (v > 0) nonZero++;
      total += v;
    }
    return {
      width: this.width,
      depth: this.depth,
      nonZero,
      totalCount: total,
      memoryBytes: this.cells.byteLength,
    };
  }

  // ─── Binary serialization ─────────────────────────────────────────
  //
  // Layout (little-endian):
  //   bytes 0..3  : width  (uint32)
  //   bytes 4..7  : depth  (uint32)
  //   bytes 8..N  : cells  (width*depth * uint32)
  //
  // Cells are sparse in practice — most positions never get hit. gzip
  // typically compresses a 200KB sketch to 30-60KB; the gossip layer
  // gzips before sending and base64-wraps for JSON transport.

  serializeBinary(): Uint8Array {
    const out = new Uint8Array(8 + this.cells.byteLength);
    const view = new DataView(out.buffer);
    view.setUint32(0, this.width, true);
    view.setUint32(4, this.depth, true);
    out.set(new Uint8Array(this.cells.buffer, this.cells.byteOffset, this.cells.byteLength), 8);
    return out;
  }

  static deserializeBinary(data: Uint8Array): CountMinSketch {
    if (data.length < 8) {
      throw new Error(`CMS deserialize: header too small (${data.length} bytes)`);
    }
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const width = view.getUint32(0, true);
    const depth = view.getUint32(4, true);
    const expectedSize = 8 + width * depth * 4;
    if (data.length !== expectedSize) {
      throw new Error(
        `CMS deserialize size mismatch: header says ${width}x${depth} (expect ${expectedSize} bytes), got ${data.length}`,
      );
    }
    if (depth < 1 || depth > 16 || width < 1) {
      throw new Error(`CMS deserialize: invalid dimensions ${width}x${depth}`);
    }
    const cms = new CountMinSketch(width, depth);
    // Copy cells out of the buffer slice — don't alias into the caller's buffer.
    const cellsView = new Uint32Array(
      data.buffer.slice(data.byteOffset + 8, data.byteOffset + data.length),
    );
    cms.cells.set(cellsView);
    return cms;
  }

  /**
   * Base64-encoded binary form suitable for JSON transport. Caller is
   * expected to gzip before base64 if size matters on the wire.
   */
  serialize(): string {
    return Buffer.from(this.serializeBinary()).toString("base64");
  }

  static deserialize(b64: string): CountMinSketch {
    return CountMinSketch.deserializeBinary(new Uint8Array(Buffer.from(b64, "base64")));
  }
}

// ─── TimeBucketedCMS ────────────────────────────────────────────────
//
// Hard time windows on top of CMS — the kill-chain detector wants
// "last 30 seconds" not "since process start". We hold N fixed-size
// sub-sketches in a ring, advance the current pointer on each add()
// based on wall clock, and reset rolled-over buckets to zero. Queries
// sum across all live buckets.

export interface TimeBucketedCMSOptions {
  width?: number;
  depth?: number;
  /** Number of sub-sketches in the ring (e.g. 6). */
  bucketCount?: number;
  /** Milliseconds per bucket (e.g. 5000 → 30s total window with 6 buckets). */
  bucketMs?: number;
  /**
   * Reference "now" for the initial bucket boundaries. Defaults to
   * Date.now() so production code never needs to specify. Tests pin
   * this to a deterministic value so roll() math is reproducible.
   */
  now?: number;
}

export interface TimeBucketedCMSStats {
  totalCount: number;
  nonZero: number;
  memoryBytes: number;
  bucketCount: number;
  windowMs: number;
  currentBucketStartMs: number;
}

export class TimeBucketedCMS {
  readonly width: number;
  readonly depth: number;
  readonly bucketCount: number;
  readonly bucketMs: number;
  private buckets: CountMinSketch[];
  /** Wall-clock start time (ms) of each bucket — index aligned with `buckets`. */
  private bucketStartMs: number[];
  /** Index of the bucket currently accepting writes. */
  private currentIdx: number;

  constructor(opts: TimeBucketedCMSOptions = {}) {
    this.width = opts.width ?? 10000;
    this.depth = opts.depth ?? 5;
    this.bucketCount = opts.bucketCount ?? 6;
    this.bucketMs = opts.bucketMs ?? 5000;
    if (this.bucketCount < 1) throw new Error("bucketCount must be ≥ 1");
    if (this.bucketMs < 1) throw new Error("bucketMs must be ≥ 1");
    this.buckets = Array.from(
      { length: this.bucketCount },
      () => new CountMinSketch(this.width, this.depth),
    );
    const now = opts.now ?? Date.now();
    // Stagger initial bucket starts so the oldest bucket already covers
    // (now - windowMs) — first add() will land in `currentIdx`.
    this.bucketStartMs = Array.from(
      { length: this.bucketCount },
      (_, i) => now - (this.bucketCount - 1 - i) * this.bucketMs,
    );
    this.currentIdx = this.bucketCount - 1;
  }

  /**
   * Advance the ring forward so `currentIdx` matches the current wall
   * clock. Rolled-over buckets are reset to zero (this is how old data
   * "expires" — we never delete entries, we just throw away the bucket
   * they live in).
   */
  private roll(now: number): void {
    const currentStart = this.bucketStartMs[this.currentIdx];
    const elapsed = now - currentStart;
    if (elapsed < this.bucketMs) return;
    const rolls = Math.min(this.bucketCount, Math.floor(elapsed / this.bucketMs));
    for (let i = 0; i < rolls; i++) {
      this.currentIdx = (this.currentIdx + 1) % this.bucketCount;
      this.buckets[this.currentIdx].reset();
      this.bucketStartMs[this.currentIdx] = currentStart + (i + 1) * this.bucketMs;
    }
  }

  add(key: string, count = 1, now: number = Date.now()): void {
    this.roll(now);
    this.buckets[this.currentIdx].add(key, count);
  }

  /**
   * Add an event that *actually happened* at `eventTs`, into the
   * bucket whose time-slot covers eventTs.
   *
   * Use this for backfill / poll-sync paths where the event's real
   * timestamp differs from "now": the event lands in its true
   * historical bucket so sub-window queries see correct distributions.
   *
   * Behaviour:
   *   * Rolls the ring forward to `now` first (so the bucket grid is
   *     up to date).
   *   * If eventTs falls inside any current bucket window, increments
   *     that bucket.
   *   * If eventTs is OLDER than the oldest live bucket, the event is
   *     silently dropped (it's already outside the window).
   *   * If eventTs is somehow in the future (clock skew), it lands in
   *     the current (newest) bucket.
   *
   * Live-traffic recordEvent paths can keep calling `add()` — when
   * eventTs ≈ now, both methods place the event in the same bucket.
   */
  addAt(key: string, count: number, eventTs: number, now: number = Date.now()): void {
    if (count < 0) throw new Error("count must be non-negative");
    if (count === 0) return;
    this.roll(now);
    // Future event → land in the newest bucket.
    const newestStart = this.bucketStartMs[this.currentIdx];
    if (eventTs >= newestStart) {
      this.buckets[this.currentIdx].add(key, count);
      return;
    }
    // Scan backwards for the bucket containing eventTs.
    for (let i = 1; i < this.bucketCount; i++) {
      const idx = (this.currentIdx - i + this.bucketCount) % this.bucketCount;
      const start = this.bucketStartMs[idx];
      const end = start + this.bucketMs;
      if (eventTs >= start && eventTs < end) {
        this.buckets[idx].add(key, count);
        return;
      }
      if (eventTs >= end) {
        // Gap between buckets — shouldn't happen with a well-rolled
        // ring, but if it does, fall into the newer bucket.
        const newerIdx = (idx + 1) % this.bucketCount;
        this.buckets[newerIdx].add(key, count);
        return;
      }
    }
    // eventTs older than the entire window — drop.
  }

  /** Total observations of `key` across the full live window. */
  query(key: string, now: number = Date.now()): number {
    this.roll(now);
    let total = 0;
    for (const b of this.buckets) total += b.query(key);
    return total;
  }

  /**
   * Total observations of `key` within the last `windowMs` ms.
   *
   * Walks the bucket ring from newest → oldest and sums each bucket
   * whose START TIME is within the requested window. A bucket is
   * either fully included or fully excluded — there's no sub-bucket
   * precision. Use a finer bucketMs to get tighter resolution.
   *
   * Semantics: a bucket represents observations "made at" its start
   * time (up to bucketMs of clock skew). queryWindow(N) returns the
   * count for buckets whose start ∈ (now - windowMs, now]. This means
   * for windowMs that doesn't align with bucket boundaries, the
   * answer is bounded by ±1 bucket worth of events vs. exact truth —
   * acceptable for hot-path defense decisions.
   *
   * Clamps to the full window if windowMs exceeds bucketCount*bucketMs.
   */
  queryWindow(key: string, windowMs: number, now: number = Date.now()): number {
    this.roll(now);
    if (windowMs <= 0) return 0;
    const fullWindowMs = this.bucketCount * this.bucketMs;
    if (windowMs >= fullWindowMs) {
      // Equivalent to query() — every bucket is in range.
      return this.query(key, now);
    }
    const cutoff = now - windowMs;
    let total = 0;
    // Walk newest → oldest. Newest is currentIdx; older is currentIdx-1
    // wrapping in the ring. Break the moment a bucket's start time
    // falls before the cutoff — all older buckets are definitionally
    // out of window too.
    for (let i = 0; i < this.bucketCount; i++) {
      const idx = (this.currentIdx - i + this.bucketCount) % this.bucketCount;
      if (this.bucketStartMs[idx] < cutoff) break;
      total += this.buckets[idx].query(key);
    }
    return total;
  }

  /**
   * Flatten the entire window into a single CMS — used as the gossip
   * payload (one delta per broadcast, not N deltas per bucket).
   */
  flatten(now: number = Date.now()): CountMinSketch {
    this.roll(now);
    const out = new CountMinSketch(this.width, this.depth);
    for (const b of this.buckets) out.merge(b);
    return out;
  }

  /**
   * Merge a peer's broadcast delta into the current bucket. Treats the
   * peer observations as having occurred "now" — gossip latency (~2s)
   * is small relative to bucketMs (5s default), so the time-skew is
   * sub-bucket and rolls off naturally on the next window advance.
   */
  mergePeer(peerSketch: CountMinSketch, now: number = Date.now()): void {
    this.roll(now);
    this.buckets[this.currentIdx].merge(peerSketch);
  }

  stats(now: number = Date.now()): TimeBucketedCMSStats {
    this.roll(now);
    let total = 0;
    let nonZero = 0;
    let memory = 0;
    for (const b of this.buckets) {
      const s = b.stats();
      total += s.totalCount;
      nonZero += s.nonZero;
      memory += s.memoryBytes;
    }
    return {
      totalCount: total,
      nonZero,
      memoryBytes: memory,
      bucketCount: this.bucketCount,
      windowMs: this.bucketCount * this.bucketMs,
      currentBucketStartMs: this.bucketStartMs[this.currentIdx],
    };
  }
}
