// ---------------------------------------------------------------------------
// AWAIS — Sentinel Mesh hot-path state (gladiusturf sister port).
// ---------------------------------------------------------------------------
//
// Sister-vertical port of gladius-crm's mesh-state. Same CRDT sketches,
// same dedup, same broadcast/pull semantics — but adapted to gladiusturf's
// storage model (Supabase via the `sentinel_events` table) and federation
// transport (HTTP to https://gladiuscrm.com/api/hq/federation/*).
//
// Architecture (per-Lambda state):
//
//   ┌──────────────────────────────────────────────────────────────┐
//   │  localCMS       TimeBucketedCMS — fast count of "how many   │
//   │                 hits from ipHash X in last 30s?"            │
//   │                 30 × 1s buckets × 200KB = 6MB              │
//   │                                                              │
//   │  syncBaseline   CountMinSketch — snapshot of what we have   │
//   │                 broadcast to peers. broadcast computes the  │
//   │                 outbound delta as localCMS - syncBaseline.  │
//   │                                                              │
//   │  eventLog       Map<ipHash, KillChainEvent[]> — bounded     │
//   │                 ring of recent verdicts per IP. Used by the │
//   │                 HQ "incident drilldown" — sketches can't    │
//   │                 store the actual path/reason/vertical, only │
//   │                 counts.                                       │
//   └──────────────────────────────────────────────────────────────┘
//
// Cold start: fires an async Supabase bootstrap query for the last 30s of
// `sentinel_events` rows that look like defense verdicts (kind ∈ BLOCK /
// FLAG / KILL_CHAIN_DETECTED). Non-blocking — the first request after a
// cold start may see briefly empty state but never blocks.
//
// Intra-vertical poll (5s): re-scans `sentinel_events` for new rows since
// the last poll cursor and adds them to localCMS.
//
// Cross-vertical federation pull (10s): HTTP GET to
// https://gladiuscrm.com/api/hq/federation/sketches?since=<cursor>
// &exclude=gladiusturf&limit=50 with Bearer MESH_FEDERATION_TOKEN. Each
// returned event's payload is gunzipped, base64-decoded, deserialized,
// and merged into localCMS + syncBaseline.
//
// Outbound broadcast (1min cron): HTTP POST to
// https://gladiuscrm.com/api/hq/federation/event with
//   { vertical: "gladiusturf", kind: "SKETCH_DELTA", severity: "INFO",
//     payload: { sketch_b64, width, depth, gzip, cmsTotalCount, ... } }
// Receiver always returns 204.
//
// Failure semantics: every public function is defensive. Bootstrap
// failure (table missing during migration) silently proceeds with
// empty state. The hot path NEVER throws.
// ---------------------------------------------------------------------------

import { gzipSync, gunzipSync } from "node:zlib";
import { CountMinSketch, TimeBucketedCMS } from "./sketches";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Identifier for "this vertical" in cross-vertical federation. Matches
 * the federation event schema used by gladiuscrm — sister verticals
 * MUST NOT re-ingest their own broadcasts (we exclude=gladiusturf on
 * the federation pull).
 */
export const MY_VERTICAL = "gladiusturf" as const;

// The canonical mesh event type — wire.ts can call recordEvent with
// this shape directly (though we don't currently wire it because the
// Edge runtime can't import node:zlib + Supabase).
export interface KillChainEvent {
  ip: string;
  ipHash: string;
  ts: number;
  path: string;
  verdict: "BLOCK" | "FLAG" | "PASS";
  reason: string;
  vertical: string;
}

// ─── Configuration (matches gladius-crm exactly) ─────────────────────
//
// width/depth: 10000 × 5 → ±1% accuracy at our expected cardinality.
// bucketCount × bucketMs: 30 × 1000 → 30s window, 1s granularity.
// Sister verticals MUST agree on (width, depth) — peer sketches with
// different dimensions are silently dropped on merge.

const SKETCH_WIDTH = 10000;
const SKETCH_DEPTH = 5;
const BUCKET_COUNT = 30;
const BUCKET_MS = 1000;
const WINDOW_MS = BUCKET_COUNT * BUCKET_MS;
const MAX_EVENTS_PER_IP = 100;
const MAX_EVENT_LOG_KEYS = 5000;

// ─── Supabase-poll intra-vertical sync ───────────────────────────────
//
// Every ~5s we query sentinel_events for rows we haven't seen yet and
// add them to localCMS. This is "Supabase-as-gossip-bus" — the same
// table the BLOCK/FLAG event-writers fill becomes the cross-region
// rendezvous point.
//
// Dedup: we hash each event we record locally and skip incoming poll
// rows with matching hashes. Bounded Map with timed expiry keeps the
// dedup table from growing unbounded.

const POLL_INTERVAL_MS = 5000;
const POLL_OVERLAP_MS = 1500; // re-scan a small overlap to ride out clock skew
const POLL_ROW_CAP = 25_000;
const MAX_DEDUP_KEYS = 50_000;
const BOOTSTRAP_AWAIT_MS = 200; // max ms first hot-path call blocks on cold-start bootstrap
const BOOTSTRAP_ROW_CAP = 50_000;

// ─── Cross-vertical federation pull (HTTP to CRM) ────────────────────

const FED_PULL_INTERVAL_MS = 10_000;
const FED_PULL_ROW_CAP = 50;
const FED_PULL_TIMEOUT_MS = 4_000;

const FED_SKETCHES_URL = "https://gladiuscrm.com/api/hq/federation/sketches";
const FED_EVENT_URL = "https://gladiuscrm.com/api/hq/federation/event";

const FED_BROADCAST_TIMEOUT_MS = 4_000;

// ─── Module-level state ──────────────────────────────────────────────
//
// `globalThis` lets us share state across hot reloads in dev. In
// production Vercel keeps each warm lambda isolated, so the module
// state is per-lambda. Cold starts get fresh empty state + a
// bootstrap query.

interface MeshState {
  localCMS: TimeBucketedCMS;
  syncBaseline: CountMinSketch;
  eventLog: Map<string, KillChainEvent[]>;
  bootstrapPromise: Promise<void> | null;
  bootstrapDone: boolean;
  bootstrapError: string | null;
  /** Number of bootstrap rows pulled from Supabase. */
  bootstrapRowsLoaded: number;
  /** Wall-clock ms of last successful peer-delta merge. */
  lastGossipTs: number;
  /** Cumulative count of peer deltas merged since lambda boot. */
  peersMerged: number;
  // ── Supabase-poll mesh sync ─────────────────────────────────────
  /** Last successful poll completion ts (ms). 0 = never polled. */
  lastPollTs: number;
  /** In-flight poll promise so concurrent hot-path calls coalesce. */
  pollPromise: Promise<void> | null;
  /** Cumulative count of rows pulled via incremental poll. */
  pollRowsLoaded: number;
  /** Last poll error message — surfaced via meshHealth for diagnostics. */
  pollError: string | null;
  /** Last successful federation-pull completion ts (ms). 0 = never. */
  lastFedPullTs: number;
  /** Federation cursor (ms epoch) returned by the CRM endpoint. */
  fedPullCursor: number;
  /** In-flight federation-pull promise (concurrent coalesce). */
  fedPullPromise: Promise<void> | null;
  /** Cumulative number of SKETCH_DELTA rows pulled from federation. */
  fedPullSketchesMerged: number;
  /** Last federation-pull error — surfaced via meshHealth. */
  fedPullError: string | null;
  /** Per-vertical count of sketches merged — diagnostics. */
  fedPullByVertical: Map<string, number>;
  /** Dedup table — content-hash → expiry-ms. */
  dedup: Map<string, number>;
}

const globalForMesh = globalThis as unknown as {
  awaisMesh: MeshState | undefined;
};

function makeFreshState(): MeshState {
  return {
    localCMS: new TimeBucketedCMS({
      width: SKETCH_WIDTH,
      depth: SKETCH_DEPTH,
      bucketCount: BUCKET_COUNT,
      bucketMs: BUCKET_MS,
    }),
    syncBaseline: new CountMinSketch(SKETCH_WIDTH, SKETCH_DEPTH),
    eventLog: new Map(),
    bootstrapPromise: null,
    bootstrapDone: false,
    bootstrapError: null,
    bootstrapRowsLoaded: 0,
    lastGossipTs: 0,
    peersMerged: 0,
    lastPollTs: 0,
    pollPromise: null,
    pollRowsLoaded: 0,
    pollError: null,
    lastFedPullTs: 0,
    fedPullCursor: 0,
    fedPullPromise: null,
    fedPullSketchesMerged: 0,
    fedPullError: null,
    fedPullByVertical: new Map(),
    dedup: new Map(),
  };
}

/**
 * Content-hash key for dedup. Two events with identical (ipHash, ts,
 * path, verdict) are treated as the same observation regardless of
 * which Lambda recorded them.
 */
function dedupKey(ipHash: string, tsMs: number, path: string, verdict: string): string {
  return `${ipHash}|${tsMs}|${path}|${verdict}`;
}

function recordDedup(state: MeshState, key: string): void {
  state.dedup.set(key, Date.now() + WINDOW_MS + POLL_OVERLAP_MS);
  if (state.dedup.size > MAX_DEDUP_KEYS) {
    const now = Date.now();
    for (const [k, exp] of state.dedup.entries()) {
      if (exp < now) state.dedup.delete(k);
    }
    if (state.dedup.size > MAX_DEDUP_KEYS) {
      const excess = state.dedup.size - MAX_DEDUP_KEYS;
      let dropped = 0;
      for (const k of state.dedup.keys()) {
        state.dedup.delete(k);
        if (++dropped >= excess) break;
      }
    }
  }
}

function getState(): MeshState {
  if (!globalForMesh.awaisMesh) {
    globalForMesh.awaisMesh = makeFreshState();
    // Fire bootstrap once per cold start — non-blocking.
    void bootstrap();
  }
  return globalForMesh.awaisMesh;
}

// ─── Row-extraction helpers ──────────────────────────────────────────
//
// sentinel_events.payload is a generic jsonb column. For BLOCK / FLAG /
// KILL_CHAIN_DETECTED rows the request wire (lib/defense/wire.ts) is
// expected to populate { ipHash, path, verdict, reason } — but in
// gladiusturf today wire.ts doesn't yet feed sentinel_events (it
// cross-fires to HQ directly). So this module degrades gracefully when
// payload fields are missing: rows without a recognisable ipHash are
// silently skipped. As wire.ts is extended (or as critical-flow /
// schema-drift / tenant-isolation rows accumulate) the mesh becomes
// non-empty organically.

interface SentinelEventRow {
  id: string;
  ts: string;
  kind: string;
  severity: string;
  payload: Record<string, unknown> | null;
}

function extractIpHash(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  // wire.ts shape: { ipHash, path, verdict, reason, vertical }
  const candidate = payload.ipHash ?? payload.ip_hash ?? payload.ip;
  if (typeof candidate !== "string" || candidate.length === 0) return null;
  return candidate;
}

function extractPath(payload: Record<string, unknown> | null): string {
  if (!payload) return "";
  const p = payload.path;
  return typeof p === "string" ? p : "";
}

function extractVerdict(
  payload: Record<string, unknown> | null,
  kind: string,
): "BLOCK" | "FLAG" | "PASS" {
  if (payload) {
    const v = payload.verdict;
    if (v === "BLOCK" || v === "FLAG" || v === "PASS") return v;
  }
  // Fall back to the row `kind` — Sentinel writes kind=BLOCK/FLAG on the
  // defense path, kind=CRITICAL_FLOW_FAILED etc. on the slow scans.
  if (kind === "BLOCK" || kind === "FLAG" || kind === "PASS") return kind;
  return "FLAG";
}

function extractReason(payload: Record<string, unknown> | null, kind: string): string {
  if (payload) {
    const r = payload.reason;
    if (typeof r === "string") return r;
  }
  return kind;
}

function extractVertical(payload: Record<string, unknown> | null): string {
  if (payload) {
    const v = payload.vertical;
    if (typeof v === "string" && v.length > 0) return v;
  }
  return MY_VERTICAL;
}

// ─── Bootstrap ───────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  const s = globalForMesh.awaisMesh;
  if (!s || s.bootstrapPromise) return s?.bootstrapPromise ?? undefined;
  s.bootstrapPromise = (async () => {
    try {
      const cutoffIso = new Date(Date.now() - WINDOW_MS).toISOString();
      const sb = supabaseAdmin();
      const { data, error } = await sb
        .from("sentinel_events")
        .select("id, ts, kind, severity, payload")
        .gte("ts", cutoffIso)
        .order("ts", { ascending: true })
        .limit(BOOTSTRAP_ROW_CAP);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as SentinelEventRow[];
      let added = 0;
      for (const e of rows) {
        const ipHash = extractIpHash(e.payload);
        if (!ipHash) continue;
        const tsMs = new Date(e.ts).getTime();
        if (!Number.isFinite(tsMs)) continue;
        const verdict = extractVerdict(e.payload, e.kind);
        const path = extractPath(e.payload);
        const reason = extractReason(e.payload, e.kind);
        const vertical = extractVertical(e.payload);
        s.localCMS.addAt(`ip:${ipHash}`, 1, tsMs);
        recordDedup(s, dedupKey(ipHash, tsMs, path, verdict));
        const log = s.eventLog.get(ipHash) ?? [];
        log.push({
          ip: "",
          ipHash,
          ts: tsMs,
          path,
          verdict,
          reason,
          vertical,
        });
        if (log.length > MAX_EVENTS_PER_IP) {
          log.splice(0, log.length - MAX_EVENTS_PER_IP);
        }
        s.eventLog.set(ipHash, log);
        added++;
      }
      s.bootstrapRowsLoaded = added;
      s.bootstrapDone = true;
      // Bootstrap completed → start the poll clock from now.
      s.lastPollTs = Date.now();
    } catch (e) {
      s.bootstrapError = e instanceof Error ? e.message : String(e);
      // Proceed with empty state — wire.ts and the scanners will refill
      // the table organically; the next poll cycle will see those rows.
    }
  })();
  return s.bootstrapPromise;
}

/**
 * Block the caller until bootstrap completes OR the timeout fires.
 * First call after cold-start pays at most BOOTSTRAP_AWAIT_MS.
 */
async function ensureBootstrap(state: MeshState): Promise<void> {
  if (state.bootstrapDone || state.bootstrapError) return;
  if (!state.bootstrapPromise) return;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, BOOTSTRAP_AWAIT_MS);
  });
  await Promise.race([state.bootstrapPromise, timeout]);
  if (timer) clearTimeout(timer);
}

/**
 * Supabase-poll mesh sync — query for sentinel_events rows we haven't
 * seen yet, add them to localCMS. Runs at most once per
 * POLL_INTERVAL_MS via the maybePoll() gate.
 */
async function pollIncremental(state: MeshState): Promise<void> {
  if (state.pollPromise) return state.pollPromise;
  state.pollPromise = (async () => {
    try {
      const lookbackMs =
        state.lastPollTs > 0
          ? state.lastPollTs - POLL_OVERLAP_MS
          : Date.now() - WINDOW_MS;
      const lookbackIso = new Date(lookbackMs).toISOString();
      const sb = supabaseAdmin();
      const { data, error } = await sb
        .from("sentinel_events")
        .select("id, ts, kind, severity, payload")
        .gte("ts", lookbackIso)
        .order("ts", { ascending: true })
        .limit(POLL_ROW_CAP);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as SentinelEventRow[];
      let added = 0;
      for (const e of rows) {
        const ipHash = extractIpHash(e.payload);
        if (!ipHash) continue;
        const tsMs = new Date(e.ts).getTime();
        if (!Number.isFinite(tsMs)) continue;
        const verdict = extractVerdict(e.payload, e.kind);
        const path = extractPath(e.payload);
        const key = dedupKey(ipHash, tsMs, path, verdict);
        if (state.dedup.has(key)) continue;
        recordDedup(state, key);
        state.localCMS.addAt(`ip:${ipHash}`, 1, tsMs);
        added++;
      }
      state.pollRowsLoaded += added;
      state.lastPollTs = Date.now();
      state.pollError = null;
    } catch (e) {
      state.pollError = e instanceof Error ? e.message : String(e);
    } finally {
      state.pollPromise = null;
    }
  })();
  return state.pollPromise;
}

function maybePoll(state: MeshState): void {
  const now = Date.now();
  if (!state.bootstrapDone && !state.bootstrapError) return;
  if (now - state.lastPollTs < POLL_INTERVAL_MS) return;
  if (state.pollPromise) return;
  void pollIncremental(state);
}

// ─── Federation pull (HTTP to CRM) ───────────────────────────────────

interface SketchDeltaPayload {
  sketch_b64?: unknown;
  width?: unknown;
  depth?: unknown;
  gzip?: unknown;
}

function isSketchDeltaPayload(p: unknown): p is SketchDeltaPayload {
  return typeof p === "object" && p !== null;
}

function decodeSketchDelta(payload: unknown): CountMinSketch | null {
  if (!isSketchDeltaPayload(payload)) return null;
  const b64 = payload.sketch_b64;
  if (typeof b64 !== "string" || b64.length === 0) return null;
  const useGzip = payload.gzip === true;
  try {
    let raw = Buffer.from(b64, "base64");
    if (useGzip) raw = gunzipSync(raw);
    return CountMinSketch.deserializeBinary(new Uint8Array(raw));
  } catch {
    return null;
  }
}

interface FederationSketchEvent {
  id: string;
  vertical: string;
  payload: unknown;
  receivedAt: string;
}

interface FederationSketchResponse {
  events: FederationSketchEvent[];
  cursor: number;
  generatedAt: string;
}

function isFederationSketchResponse(x: unknown): x is FederationSketchResponse {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return Array.isArray(o.events) && typeof o.cursor === "number";
}

async function pullFederationDeltas(state: MeshState): Promise<void> {
  if (state.fedPullPromise) return state.fedPullPromise;
  state.fedPullPromise = (async () => {
    const token = process.env.MESH_FEDERATION_TOKEN;
    if (!token) {
      // No token set — federation pull is closed. This is the
      // documented founder-action prerequisite; meshHealth surfaces
      // this clearly so the gap is obvious.
      state.fedPullError = "MESH_FEDERATION_TOKEN not set";
      state.fedPullPromise = null;
      return;
    }
    const since =
      state.fedPullCursor > 0
        ? state.fedPullCursor
        : Date.now() - WINDOW_MS;
    const url = `${FED_SKETCHES_URL}?since=${since}&exclude=${MY_VERTICAL}&limit=${FED_PULL_ROW_CAP}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FED_PULL_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!res.ok) {
        state.fedPullError = `HTTP ${res.status}`;
        return;
      }
      const json = (await res.json()) as unknown;
      if (!isFederationSketchResponse(json)) {
        state.fedPullError = "bad response shape";
        return;
      }
      let merged = 0;
      for (const row of json.events) {
        const peer = decodeSketchDelta(row.payload);
        if (!peer) continue;
        try {
          state.localCMS.mergePeer(peer);
          state.syncBaseline.merge(peer);
          state.peersMerged++;
          state.lastGossipTs = Date.now();
          const prev = state.fedPullByVertical.get(row.vertical) ?? 0;
          state.fedPullByVertical.set(row.vertical, prev + 1);
          merged++;
        } catch {
          // Dim mismatch — skip.
        }
      }
      state.fedPullSketchesMerged += merged;
      state.fedPullCursor = json.cursor;
      state.lastFedPullTs = Date.now();
      state.fedPullError = null;
    } catch (e) {
      state.fedPullError = e instanceof Error ? e.message : String(e);
    } finally {
      clearTimeout(timer);
      state.fedPullPromise = null;
    }
  })();
  return state.fedPullPromise;
}

function maybeFedPull(state: MeshState): void {
  const now = Date.now();
  if (!state.bootstrapDone && !state.bootstrapError) return;
  if (now - state.lastFedPullTs < FED_PULL_INTERVAL_MS) return;
  if (state.fedPullPromise) return;
  void pullFederationDeltas(state);
}

// ─── Outbound broadcast (HTTP POST to CRM) ───────────────────────────

/**
 * Encode the local outbound delta for federation broadcast.
 * gzip-then-base64 — sketches are sparse, gzip typically yields 5-10x
 * compression. Returns the wire payload + the in-memory sketch (so
 * tests can verify).
 */
export function buildSketchDeltaPayload(): {
  sketch_b64: string;
  width: number;
  depth: number;
  gzip: true;
  rawBytes: number;
  compressedBytes: number;
  cmsTotalCount: number;
} {
  const { sketch } = getOutboundDelta();
  const binary = sketch.serializeBinary();
  const compressed = gzipSync(binary);
  return {
    sketch_b64: Buffer.from(compressed).toString("base64"),
    width: sketch.width,
    depth: sketch.depth,
    gzip: true,
    rawBytes: binary.byteLength,
    compressedBytes: compressed.byteLength,
    cmsTotalCount: sketch.stats().totalCount,
  };
}

/**
 * Broadcast the local outbound delta to gladius-crm's federation event
 * receiver. Receiver returns 204 on success; we accept 200/204/2xx as
 * success.  Called by the mesh-broadcast cron once per minute.
 *
 * Returns diagnostics for cron logging, or null on transport failure.
 * An empty delta (no observations since last broadcast) skips the HTTP
 * call entirely — no need to spam the CRM federation table with
 * zero-count rows.
 */
export async function broadcastSelfDelta(): Promise<
  | {
      cmsTotalCount: number;
      rawBytes: number;
      compressedBytes: number;
      compressionRatio: number;
      httpStatus: number | null;
      skipped: boolean;
    }
  | null
> {
  const s = getState();
  await ensureBootstrap(s);
  const payload = buildSketchDeltaPayload();
  if (payload.cmsTotalCount === 0) {
    return {
      cmsTotalCount: 0,
      rawBytes: payload.rawBytes,
      compressedBytes: payload.compressedBytes,
      compressionRatio: payload.compressedBytes / payload.rawBytes,
      httpStatus: null,
      skipped: true,
    };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FED_BROADCAST_TIMEOUT_MS);
  try {
    const res = await fetch(FED_EVENT_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vertical: MY_VERTICAL,
        kind: "SKETCH_DELTA",
        severity: "INFO",
        payload: {
          sketch_b64: payload.sketch_b64,
          width: payload.width,
          depth: payload.depth,
          gzip: payload.gzip,
          cmsTotalCount: payload.cmsTotalCount,
          rawBytes: payload.rawBytes,
          compressedBytes: payload.compressedBytes,
        },
      }),
      signal: controller.signal,
      keepalive: true,
    });
    return {
      cmsTotalCount: payload.cmsTotalCount,
      rawBytes: payload.rawBytes,
      compressedBytes: payload.compressedBytes,
      compressionRatio: payload.compressedBytes / payload.rawBytes,
      httpStatus: res.status,
      skipped: false,
    };
  } catch (err) {
    console.warn(
      "[awais-mesh] broadcastSelfDelta POST failed:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Record one verdict in the local sketch and event log.
 *
 * On gladiusturf this is currently called only from Node-runtime
 * paths (cron, scanners) — the request wire (lib/defense/wire.ts)
 * runs on the Edge runtime and cannot import this module. As wire.ts
 * is extended to also persist into sentinel_events, the poll loop
 * will pick those rows up within 5s.
 */
export async function recordEvent(e: KillChainEvent): Promise<void> {
  const s = getState();
  await ensureBootstrap(s);

  s.localCMS.addAt(`ip:${e.ipHash}`, 1, e.ts);
  recordDedup(s, dedupKey(e.ipHash, e.ts, e.path, e.verdict));

  const log = s.eventLog.get(e.ipHash) ?? [];
  log.push(e);
  if (log.length > MAX_EVENTS_PER_IP) {
    log.splice(0, log.length - MAX_EVENTS_PER_IP);
  }
  s.eventLog.set(e.ipHash, log);

  if (s.eventLog.size > MAX_EVENT_LOG_KEYS) {
    const cutoff = Date.now() - WINDOW_MS;
    for (const [k, arr] of s.eventLog.entries()) {
      const fresh = arr.filter((x) => x.ts > cutoff);
      if (fresh.length === 0) s.eventLog.delete(k);
      else s.eventLog.set(k, fresh);
    }
  }

  maybePoll(s);
  maybeFedPull(s);
}

/**
 * Count hits from `ipHash` in the last `windowSec`. Sub-microsecond
 * after warm-up; mesh-wide once the next 5s poll + 10s federation
 * pull have run.
 */
export async function killChainHitCount(
  ipHash: string,
  windowSec: number,
): Promise<number> {
  const s = getState();
  await ensureBootstrap(s);
  maybePoll(s);
  maybeFedPull(s);
  return s.localCMS.queryWindow(`ip:${ipHash}`, windowSec * 1000);
}

/**
 * Pull the most recent N verdicts for this IP. Per-lambda truth only.
 */
export async function recentVerdictsForIp(
  ipHash: string,
  limit: number,
): Promise<KillChainEvent[]> {
  const s = getState();
  await ensureBootstrap(s);
  maybePoll(s);
  maybeFedPull(s);
  const arr = s.eventLog.get(ipHash) ?? [];
  return [...arr].sort((a, b) => b.ts - a.ts).slice(0, limit);
}

/**
 * Convenience entry. Default 30s window with ≥6 hits to flag — same
 * defaults as gladius-crm's shared-state.
 */
export async function checkKillChain(
  ipHash: string,
  _currentPath: string,
  options: { windowSec?: number; threshold?: number } = {},
): Promise<{ flag: boolean; hitCount: number }> {
  const windowSec = options.windowSec ?? 30;
  const threshold = options.threshold ?? 6;
  const count = await killChainHitCount(ipHash, windowSec);
  return { flag: count >= threshold, hitCount: count };
}

// ─── Diagnostics ─────────────────────────────────────────────────────

export interface MeshHealth {
  mode: "mesh";
  vertical: string;
  bootstrapDone: boolean;
  bootstrapError: string | null;
  bootstrapRowsLoaded: number;
  cmsStats: ReturnType<TimeBucketedCMS["stats"]>;
  eventLogKeys: number;
  peersMerged: number;
  lastGossipTs: number;
  lastGossipAgoMs: number | null;
  pollRowsLoaded: number;
  pollError: string | null;
  lastPollTs: number;
  lastPollAgoMs: number | null;
  pollInFlight: boolean;
  dedupSize: number;
  fedPullSketchesMerged: number;
  fedPullError: string | null;
  fedPullCursor: number;
  lastFedPullTs: number;
  lastFedPullAgoMs: number | null;
  fedPullInFlight: boolean;
  fedPullByVertical: Record<string, number>;
}

export async function meshHealth(): Promise<MeshHealth> {
  const s = getState();
  return {
    mode: "mesh",
    vertical: MY_VERTICAL,
    bootstrapDone: s.bootstrapDone,
    bootstrapError: s.bootstrapError,
    bootstrapRowsLoaded: s.bootstrapRowsLoaded,
    cmsStats: s.localCMS.stats(),
    eventLogKeys: s.eventLog.size,
    peersMerged: s.peersMerged,
    lastGossipTs: s.lastGossipTs,
    lastGossipAgoMs: s.lastGossipTs > 0 ? Date.now() - s.lastGossipTs : null,
    pollRowsLoaded: s.pollRowsLoaded,
    pollError: s.pollError,
    lastPollTs: s.lastPollTs,
    lastPollAgoMs: s.lastPollTs > 0 ? Date.now() - s.lastPollTs : null,
    pollInFlight: s.pollPromise !== null,
    dedupSize: s.dedup.size,
    fedPullSketchesMerged: s.fedPullSketchesMerged,
    fedPullError: s.fedPullError,
    fedPullCursor: s.fedPullCursor,
    lastFedPullTs: s.lastFedPullTs,
    lastFedPullAgoMs: s.lastFedPullTs > 0 ? Date.now() - s.lastFedPullTs : null,
    fedPullInFlight: s.fedPullPromise !== null,
    fedPullByVertical: Object.fromEntries(s.fedPullByVertical),
  };
}

// ─── Outbound delta primitive ────────────────────────────────────────

/**
 * Compute and consume the outbound sketch delta — the set of
 * observations made since the last broadcast. After returning, the
 * sync baseline advances so the next call returns only newer
 * observations.
 */
export function getOutboundDelta(): { sketch: CountMinSketch; serialized: string } {
  const s = getState();
  const current = s.localCMS.flatten();
  const delta = current.delta(s.syncBaseline);
  s.syncBaseline.merge(delta);
  return { sketch: delta, serialized: delta.serialize() };
}

/**
 * Merge a peer's broadcast delta into our local view. Updates both
 * the live CMS and the sync baseline (so our own outbound delta
 * excludes peer data — we never re-broadcast something we received).
 */
export function mergeInboundDelta(b64: string): void {
  const s = getState();
  try {
    const peerSketch = CountMinSketch.deserialize(b64);
    s.localCMS.mergePeer(peerSketch);
    s.syncBaseline.merge(peerSketch);
    s.peersMerged++;
    s.lastGossipTs = Date.now();
  } catch (e) {
    console.warn(
      "[awais-mesh] failed to merge inbound delta:",
      e instanceof Error ? e.message : String(e),
    );
  }
}

// ─── Test-only ───────────────────────────────────────────────────────

export function __resetMeshStateForTesting(): void {
  globalForMesh.awaisMesh = undefined;
}

export async function __awaitBootstrapForTesting(): Promise<void> {
  const s = globalForMesh.awaisMesh;
  if (!s || !s.bootstrapPromise) return;
  await s.bootstrapPromise;
}

export async function __forcePollForTesting(): Promise<void> {
  const s = getState();
  await pollIncremental(s);
}

export function __markBootstrapDoneForTesting(): void {
  const s = getState();
  s.bootstrapDone = true;
  s.bootstrapPromise = null;
  const now = Date.now();
  s.lastPollTs = now;
  s.lastFedPullTs = now;
}

export async function __forceFedPullForTesting(): Promise<void> {
  const s = getState();
  await pullFederationDeltas(s);
}

export function __ingestPeerForTesting(peer: CountMinSketch, vertical: string): void {
  const s = getState();
  s.localCMS.mergePeer(peer);
  s.syncBaseline.merge(peer);
  s.peersMerged++;
  s.lastGossipTs = Date.now();
  const prev = s.fedPullByVertical.get(vertical) ?? 0;
  s.fedPullByVertical.set(vertical, prev + 1);
  s.fedPullSketchesMerged++;
}
