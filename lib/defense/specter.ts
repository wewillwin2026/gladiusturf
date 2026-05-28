// ---------------------------------------------------------------------------
// GladiusDefense — Specter Identity Graph (mechanism #31)
// ---------------------------------------------------------------------------
// Locality-Sensitive Hashing (LSH) with SimHash projections on per-IP
// behavioral fingerprint vectors. Detects when "different" IPs are actually
// the same operator (rotating-proxy reality).
//
// Pipeline:
//   1. For each IP, build a fingerprint vector from event observables:
//      [ unique_path_count, mean_score, post_ratio, unique_method_count,
//        path_entropy, ua_entropy, error4xx_ratio, hour_of_day_peak,
//        path_token_a, path_token_b, ... ]  (16-dim)
//   2. Generate K=12 random hyperplane families (each with B=8 bits).
//   3. For each family, hash all IP vectors into 2^8 = 256 buckets.
//   4. Within a bucket, compute cosine similarity between every pair.
//   5. Pairs with cosine ≥ 0.82 are emitted as identity-cluster edges.
//   6. Union-find collapses transitive edges into clusters.
//
// Output: clusters of {IPs, mean similarity, fingerprint centroid}.
//
// Example:
//   const out = runSpecter({ events, windowMs: 24*3600*1000 });
//   out.findings[0].payload → {
//     clusterId: "abc123", ips: ["1.1.1.1","2.2.2.2"],
//     meanSimilarity: 0.87, size: 2, fingerprint: [0.31,...,0.8]
//   }
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import type { DefenseEvent } from "./types";

export interface SpecterInput {
  events: DefenseEvent[];
  windowMs: number;
  /** SimHash families. Default 12. */
  numTables?: number;
  /** Bits per family. Default 8 → 256 buckets/family. */
  bitsPerTable?: number;
  /** Cosine threshold for "same identity". Default 0.82. */
  threshold?: number;
  /** Deterministic seed for the LSH hyperplanes. */
  rngSeed?: number;
}

export interface SpecterFinding {
  kind: "specter_cluster";
  severity: number;
  payload: {
    clusterId: string;
    ips: string[];
    size: number;
    meanSimilarity: number;
    fingerprintCentroid: number[];
  };
}

export interface SpecterOutput {
  findings: SpecterFinding[];
  meta: { processedCount: number; durationMs: number; ipCount: number };
}

const DIM = 16;
const DEFAULT_NUM_TABLES = 12;
const DEFAULT_BITS = 8;
const DEFAULT_THRESHOLD = 0.82;

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shannon(values: string[]): number {
  if (values.length === 0) return 0;
  const c = new Map<string, number>();
  for (const v of values) c.set(v, (c.get(v) ?? 0) + 1);
  let h = 0;
  for (const v of c.values()) {
    const p = v / values.length;
    h -= p * Math.log2(p);
  }
  return h;
}

function fingerprintVec(events: DefenseEvent[]): number[] {
  const paths = events.map((e) => e.path);
  const uniquePaths = new Set(paths);
  const meanScore =
    events.reduce((a, b) => a + b.threatScore, 0) / Math.max(1, events.length);
  const postRatio =
    events.filter((e) => e.method === "POST").length / Math.max(1, events.length);
  const uniqueMethods = new Set(events.map((e) => e.method)).size;
  const pathEntropy = shannon(paths);
  const uaEntropy = shannon(events.map((e) => e.userAgent));
  const err4xx =
    events.filter((e) => e.statusCode >= 400 && e.statusCode < 500).length /
    Math.max(1, events.length);

  // Hour-of-day peak — index of busiest hour normalized to [0,1]
  const hours = new Array(24).fill(0);
  for (const e of events) {
    const d = new Date(e.timestamp);
    if (!Number.isNaN(d.getTime())) hours[d.getUTCHours()]++;
  }
  let peak = 0;
  for (let i = 1; i < 24; i++) if (hours[i] > hours[peak]) peak = i;
  const peakNorm = peak / 23;

  // 8 path-token presence signals: presence of common attack tokens
  const tokens = [
    "admin",
    "wp-",
    ".env",
    ".git",
    "api",
    "login",
    "config",
    "shell",
  ];
  const tokenSignals = tokens.map((t) => {
    let hits = 0;
    for (const p of paths) if (p.includes(t)) hits++;
    return hits / Math.max(1, paths.length);
  });

  const vec = [
    Math.min(1, uniquePaths.size / 50),
    Math.min(1, meanScore),
    postRatio,
    Math.min(1, uniqueMethods / 5),
    Math.min(1, pathEntropy / 6),
    Math.min(1, uaEntropy / 6),
    err4xx,
    peakNorm,
    ...tokenSignals,
  ];
  // pad/truncate to DIM
  while (vec.length < DIM) vec.push(0);
  return vec.slice(0, DIM);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// ─── Union-Find ────────────────────────────────────────────────────────────

class UF {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
  }
}

// ─── LSH ───────────────────────────────────────────────────────────────────

function buildHyperplanes(
  numTables: number,
  bitsPerTable: number,
  rng: () => number,
): number[][][] {
  const tables: number[][][] = [];
  for (let t = 0; t < numTables; t++) {
    const planes: number[][] = [];
    for (let b = 0; b < bitsPerTable; b++) {
      const p: number[] = [];
      for (let i = 0; i < DIM; i++) {
        // Box-Muller for unit normal sample
        const u1 = Math.max(1e-12, rng());
        const u2 = rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        p.push(z);
      }
      planes.push(p);
    }
    tables.push(planes);
  }
  return tables;
}

function lshKey(vec: number[], planes: number[][]): number {
  let key = 0;
  for (let b = 0; b < planes.length; b++) {
    let dot = 0;
    for (let i = 0; i < vec.length; i++) dot += vec[i] * planes[b][i];
    key = (key << 1) | (dot >= 0 ? 1 : 0);
  }
  return key >>> 0;
}

/**
 * Detect identity clusters via SimHash LSH on per-IP fingerprint vectors.
 *
 * Pure function. Returns one finding per non-trivial cluster (size ≥ 2).
 */
export function runSpecter(input: SpecterInput): SpecterOutput {
  const startedAt = Date.now();
  const numTables = input.numTables ?? DEFAULT_NUM_TABLES;
  const bitsPerTable = input.bitsPerTable ?? DEFAULT_BITS;
  const threshold = input.threshold ?? DEFAULT_THRESHOLD;
  const rng = mulberry32(input.rngSeed ?? 1337);

  // Group by IP
  const byIp = new Map<string, DefenseEvent[]>();
  for (const ev of input.events) {
    if (!ev.ip) continue;
    const l = byIp.get(ev.ip);
    if (l) l.push(ev);
    else byIp.set(ev.ip, [ev]);
  }
  const ips = Array.from(byIp.keys());
  if (ips.length < 2) {
    return {
      findings: [],
      meta: {
        processedCount: input.events.length,
        durationMs: Date.now() - startedAt,
        ipCount: ips.length,
      },
    };
  }

  const vecs = ips.map((ip) => fingerprintVec(byIp.get(ip)!));
  const planes = buildHyperplanes(numTables, bitsPerTable, rng);
  const uf = new UF(ips.length);
  const pairSim = new Map<string, number>(); // dedupe pairwise cosine compute

  for (const tablePlanes of planes) {
    const buckets = new Map<number, number[]>();
    for (let i = 0; i < ips.length; i++) {
      const key = lshKey(vecs[i], tablePlanes);
      const arr = buckets.get(key);
      if (arr) arr.push(i);
      else buckets.set(key, [i]);
    }
    for (const arr of buckets.values()) {
      if (arr.length < 2) continue;
      // Pair-test inside bucket
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          const key = a < b ? `${a}|${b}` : `${b}|${a}`;
          if (pairSim.has(key)) continue;
          const sim = cosine(vecs[a], vecs[b]);
          pairSim.set(key, sim);
          if (sim >= threshold) uf.union(a, b);
        }
      }
    }
  }

  // Build clusters from UF
  const clusters = new Map<number, number[]>();
  for (let i = 0; i < ips.length; i++) {
    const r = uf.find(i);
    const arr = clusters.get(r);
    if (arr) arr.push(i);
    else clusters.set(r, [i]);
  }

  const findings: SpecterFinding[] = [];
  for (const [, members] of clusters) {
    if (members.length < 2) continue;
    // Centroid
    const centroid = new Array(DIM).fill(0);
    for (const idx of members) {
      for (let d = 0; d < DIM; d++) centroid[d] += vecs[idx][d];
    }
    for (let d = 0; d < DIM; d++) centroid[d] /= members.length;

    // Mean pairwise similarity
    let simSum = 0;
    let simCount = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        simSum += cosine(vecs[members[i]], vecs[members[j]]);
        simCount++;
      }
    }
    const meanSim = simCount > 0 ? simSum / simCount : 1;
    const memberIps = members.map((i) => ips[i]).sort();
    const clusterId = createHash("sha1")
      .update(memberIps.join("|"))
      .digest("hex")
      .slice(0, 12);

    findings.push({
      kind: "specter_cluster",
      severity: Math.min(1, 0.3 + meanSim * 0.6 + Math.min(0.1, members.length / 20)),
      payload: {
        clusterId,
        ips: memberIps,
        size: members.length,
        meanSimilarity: meanSim,
        fingerprintCentroid: centroid,
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
      ipCount: ips.length,
    },
  };
}
