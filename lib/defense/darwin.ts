// ---------------------------------------------------------------------------
// GladiusDefense — Darwin Defense (mechanism #28)
// ---------------------------------------------------------------------------
// NSGA-II multi-objective genetic optimization on defense-rule parameters.
//
// A "genome" here is the tunable parameter vector for a rule family:
//   [ rateLimitThreshold, windowSeconds, scoreWeight, confidenceFloor ]
// (4-dim, all bounded). We co-optimize two objectives:
//   1. minimize false-positive ratio    (estimated from past matches)
//   2. maximize true-positive coverage  (events caught / total bad events)
//
// Algorithm:
//   1. Sample a population of POP (=50) random genomes.
//   2. Evaluate fitness on the supplied event corpus.
//   3. Tournament-select parents (size = 2).
//   4. SBX crossover (eta_c = 20). Single arithmetic point + bounded swap.
//   5. Polynomial mutation (eta_m = 20, p_m = 1/dim).
//   6. Combine parents + children, do non-dominated sort + crowding-
//      distance to keep the Pareto front. POP survivors form next gen.
//   7. Output: top-N Pareto-optimal genomes.
//
// Pure function. No DB. Caller persists top genomes (e.g. to
// defense_rule_genomes) so next cron-cycle can seed a warm-start.
//
// Example:
//   const out = runDarwin({ events, windowMs, seedGenomes:[...], generations:8 });
//   out.findings[0].payload → { rank:0, genome:[120,60,0.4,0.3],
//     fitness:{ falsePos:0.04, truePos:0.81 }, dominatedBy:[] }
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import type { DefenseEvent } from "./types";

export interface Genome {
  /** [rateLimitThreshold, windowSeconds, scoreWeight, confidenceFloor] */
  params: [number, number, number, number];
}

export interface GenomeFitness {
  falsePositiveRatio: number;
  truePositiveRatio: number;
}

export interface DarwinInput {
  events: DefenseEvent[];
  windowMs: number;
  /** Population size. Default 50. */
  populationSize?: number;
  /** Number of generations. Default 8 (~30ms on small populations). */
  generations?: number;
  /** Optional warm-start genomes from previous run. */
  seedGenomes?: Genome[];
  /** Bounded parameter ranges [low, high]. */
  bounds?: Array<[number, number]>;
  /** Deterministic seed for reproducibility. */
  rngSeed?: number;
}

export interface DarwinFinding {
  kind: "genome";
  severity: number;
  payload: {
    rank: number; // 0 = Pareto front
    genome: [number, number, number, number];
    fitness: GenomeFitness;
    generations: number;
    populationSize: number;
    dominated: number; // count of population this genome dominates
    crowdingDistance: number;
  };
}

export interface DarwinOutput {
  findings: DarwinFinding[];
  meta: { processedCount: number; durationMs: number };
}

const DEFAULT_BOUNDS: Array<[number, number]> = [
  [10, 500], // rateLimitThreshold
  [10, 600], // windowSeconds
  [0.0, 1.0], // scoreWeight
  [0.0, 1.0], // confidenceFloor
];

// ─── Deterministic RNG (mulberry32) ────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function (): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromEvents(events: DefenseEvent[]): number {
  if (events.length === 0) return 42;
  const h = createHash("sha1")
    .update(events.length.toString())
    .update(events[0]?.timestamp ?? "")
    .update(events[events.length - 1]?.timestamp ?? "")
    .digest();
  return h.readUInt32BE(0);
}

// ─── Fitness ───────────────────────────────────────────────────────────────
// We estimate "bad events" as those with threatScore > 0.5 and "good" otherwise.
// A genome's predicted block decision is:
//   blocked = (rate_in_window > rateLimitThreshold) ||
//             (threatScore * scoreWeight > confidenceFloor)
// We then compute TP = (blocked & bad) / bad, FP = (blocked & good) / good.

interface BinnedEvent {
  ts: number;
  score: number;
  ip: string;
  isBad: boolean;
}

function bin(events: DefenseEvent[]): BinnedEvent[] {
  return events.map((e) => ({
    ts: new Date(e.timestamp).getTime(),
    score: e.threatScore,
    ip: e.ip,
    isBad: e.threatScore > 0.5,
  }));
}

function evaluate(
  genome: Genome,
  binned: BinnedEvent[],
): GenomeFitness {
  const [rateThr, winSec, scoreW, confFloor] = genome.params;
  const winMs = winSec * 1000;
  let tp = 0;
  let totalBad = 0;
  let fp = 0;
  let totalGood = 0;

  // For each event, count concurrent events from same IP within winMs.
  // O(n log n) by sorting per-IP then sliding.
  const byIp = new Map<string, BinnedEvent[]>();
  for (const e of binned) {
    const list = byIp.get(e.ip);
    if (list) list.push(e);
    else byIp.set(e.ip, [e]);
  }
  for (const list of byIp.values()) {
    list.sort((a, b) => a.ts - b.ts);
    let left = 0;
    for (let right = 0; right < list.length; right++) {
      while (left < right && list[right].ts - list[left].ts > winMs) left++;
      const concurrent = right - left + 1;
      const e = list[right];
      const blocked =
        concurrent > rateThr || e.score * scoreW > confFloor;
      if (e.isBad) {
        totalBad++;
        if (blocked) tp++;
      } else {
        totalGood++;
        if (blocked) fp++;
      }
    }
  }
  return {
    falsePositiveRatio: totalGood > 0 ? fp / totalGood : 0,
    truePositiveRatio: totalBad > 0 ? tp / totalBad : 0,
  };
}

// ─── Genetic operators ─────────────────────────────────────────────────────

function randomGenome(rng: () => number, bounds: Array<[number, number]>): Genome {
  const params: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    params[i] = bounds[i][0] + rng() * (bounds[i][1] - bounds[i][0]);
  }
  return { params };
}

function tournament(
  pop: { g: Genome; fit: GenomeFitness; rank: number; crowd: number }[],
  rng: () => number,
): { g: Genome; fit: GenomeFitness; rank: number; crowd: number } {
  const a = pop[Math.floor(rng() * pop.length)];
  const b = pop[Math.floor(rng() * pop.length)];
  if (a.rank !== b.rank) return a.rank < b.rank ? a : b;
  return a.crowd > b.crowd ? a : b;
}

function sbxCrossover(
  p1: Genome,
  p2: Genome,
  rng: () => number,
  bounds: Array<[number, number]>,
  eta_c = 20,
): [Genome, Genome] {
  const c1: [number, number, number, number] = [0, 0, 0, 0];
  const c2: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const a = p1.params[i];
    const b = p2.params[i];
    if (Math.abs(a - b) < 1e-12) {
      c1[i] = a;
      c2[i] = b;
      continue;
    }
    const u = rng();
    const beta =
      u <= 0.5
        ? Math.pow(2 * u, 1 / (eta_c + 1))
        : Math.pow(1 / (2 * (1 - u)), 1 / (eta_c + 1));
    let x1 = 0.5 * ((a + b) - beta * Math.abs(b - a));
    let x2 = 0.5 * ((a + b) + beta * Math.abs(b - a));
    x1 = Math.max(bounds[i][0], Math.min(bounds[i][1], x1));
    x2 = Math.max(bounds[i][0], Math.min(bounds[i][1], x2));
    c1[i] = x1;
    c2[i] = x2;
  }
  return [{ params: c1 }, { params: c2 }];
}

function polyMutate(
  g: Genome,
  rng: () => number,
  bounds: Array<[number, number]>,
  eta_m = 20,
): Genome {
  const out: [number, number, number, number] = [...g.params];
  const pm = 1 / 4;
  for (let i = 0; i < 4; i++) {
    if (rng() > pm) continue;
    const lo = bounds[i][0];
    const hi = bounds[i][1];
    const u = rng();
    const delta1 = (out[i] - lo) / (hi - lo);
    const delta2 = (hi - out[i]) / (hi - lo);
    let deltaq: number;
    const mut_pow = 1 / (eta_m + 1);
    if (u < 0.5) {
      const xy = 1 - delta1;
      const val = 2 * u + (1 - 2 * u) * Math.pow(xy, eta_m + 1);
      deltaq = Math.pow(val, mut_pow) - 1;
    } else {
      const xy = 1 - delta2;
      const val = 2 * (1 - u) + 2 * (u - 0.5) * Math.pow(xy, eta_m + 1);
      deltaq = 1 - Math.pow(val, mut_pow);
    }
    out[i] = Math.max(lo, Math.min(hi, out[i] + deltaq * (hi - lo)));
  }
  return { params: out };
}

// ─── Non-dominated sort + crowding distance ────────────────────────────────

function dominates(a: GenomeFitness, b: GenomeFitness): boolean {
  // We minimize FP and maximize TP. Convert to minimization of (FP, -TP).
  const aFp = a.falsePositiveRatio;
  const aTpNeg = -a.truePositiveRatio;
  const bFp = b.falsePositiveRatio;
  const bTpNeg = -b.truePositiveRatio;
  const better = aFp <= bFp && aTpNeg <= bTpNeg;
  const strict = aFp < bFp || aTpNeg < bTpNeg;
  return better && strict;
}

function nonDominatedSort(
  pop: { g: Genome; fit: GenomeFitness }[],
): number[][] {
  const fronts: number[][] = [];
  const ranks = new Array(pop.length).fill(-1);
  const S: number[][] = pop.map(() => []);
  const n = new Array(pop.length).fill(0);
  for (let p = 0; p < pop.length; p++) {
    for (let q = 0; q < pop.length; q++) {
      if (p === q) continue;
      if (dominates(pop[p].fit, pop[q].fit)) S[p].push(q);
      else if (dominates(pop[q].fit, pop[p].fit)) n[p]++;
    }
    if (n[p] === 0) {
      ranks[p] = 0;
      if (!fronts[0]) fronts[0] = [];
      fronts[0].push(p);
    }
  }
  let i = 0;
  while (fronts[i] && fronts[i].length > 0) {
    const next: number[] = [];
    for (const p of fronts[i]) {
      for (const q of S[p]) {
        n[q]--;
        if (n[q] === 0) {
          ranks[q] = i + 1;
          next.push(q);
        }
      }
    }
    i++;
    fronts[i] = next;
  }
  if (fronts[i] && fronts[i].length === 0) fronts.pop();
  return fronts;
}

function crowdingDistance(
  pop: { g: Genome; fit: GenomeFitness }[],
  indices: number[],
): number[] {
  const d = new Array(pop.length).fill(0);
  if (indices.length === 0) return d;
  // Two objectives
  const objs: Array<(f: GenomeFitness) => number> = [
    (f) => f.falsePositiveRatio,
    (f) => -f.truePositiveRatio,
  ];
  for (const objFn of objs) {
    const sorted = [...indices].sort(
      (a, b) => objFn(pop[a].fit) - objFn(pop[b].fit),
    );
    d[sorted[0]] = Infinity;
    d[sorted[sorted.length - 1]] = Infinity;
    const fMin = objFn(pop[sorted[0]].fit);
    const fMax = objFn(pop[sorted[sorted.length - 1]].fit);
    const range = fMax - fMin || 1;
    for (let i = 1; i < sorted.length - 1; i++) {
      d[sorted[i]] += (objFn(pop[sorted[i + 1]].fit) - objFn(pop[sorted[i - 1]].fit)) / range;
    }
  }
  return d;
}

// ─── Top-level ─────────────────────────────────────────────────────────────

/**
 * Run NSGA-II over rule parameter space.
 *
 * Pure function. Returns the Pareto-front genomes; caller persists.
 */
export function runDarwin(input: DarwinInput): DarwinOutput {
  const startedAt = Date.now();
  const POP = input.populationSize ?? 50;
  const GENS = input.generations ?? 8;
  const bounds = input.bounds ?? DEFAULT_BOUNDS;
  const rngSeed = input.rngSeed ?? seedFromEvents(input.events);
  const rng = mulberry32(rngSeed);

  // Need event signal to evaluate fitness; if empty, return nothing.
  if (input.events.length < 4) {
    return {
      findings: [],
      meta: {
        processedCount: input.events.length,
        durationMs: Date.now() - startedAt,
      },
    };
  }
  const binned = bin(input.events);

  // Init population
  let population: { g: Genome; fit: GenomeFitness; rank: number; crowd: number }[] = [];
  for (let i = 0; i < POP; i++) {
    const g = input.seedGenomes && i < input.seedGenomes.length
      ? input.seedGenomes[i]
      : randomGenome(rng, bounds);
    population.push({ g, fit: evaluate(g, binned), rank: 0, crowd: 0 });
  }

  // Evolve
  for (let gen = 0; gen < GENS; gen++) {
    // 1. Assign ranks + crowding to current population
    const fronts = nonDominatedSort(population);
    fronts.forEach((front, rank) => {
      const d = crowdingDistance(population, front);
      for (const idx of front) {
        population[idx].rank = rank;
        population[idx].crowd = d[idx];
      }
    });

    // 2. Generate children via tournament + SBX + mutation
    const children: { g: Genome; fit: GenomeFitness; rank: number; crowd: number }[] = [];
    while (children.length < POP) {
      const p1 = tournament(population, rng);
      const p2 = tournament(population, rng);
      const [c1, c2] = sbxCrossover(p1.g, p2.g, rng, bounds);
      const m1 = polyMutate(c1, rng, bounds);
      const m2 = polyMutate(c2, rng, bounds);
      children.push({ g: m1, fit: evaluate(m1, binned), rank: 0, crowd: 0 });
      if (children.length < POP) children.push({ g: m2, fit: evaluate(m2, binned), rank: 0, crowd: 0 });
    }

    // 3. Combine + select survivors via non-dominated sort
    const combined = [...population, ...children];
    const combinedFronts = nonDominatedSort(combined);
    const survivors: typeof combined = [];
    for (const front of combinedFronts) {
      const d = crowdingDistance(combined, front);
      if (survivors.length + front.length <= POP) {
        for (const idx of front) survivors.push({ ...combined[idx], rank: 0, crowd: d[idx] });
      } else {
        // Take highest crowding distance until POP filled
        const sorted = [...front].sort((a, b) => d[b] - d[a]);
        for (const idx of sorted) {
          if (survivors.length >= POP) break;
          survivors.push({ ...combined[idx], rank: 0, crowd: d[idx] });
        }
        break;
      }
    }
    population = survivors;
  }

  // Final ranking
  const finalFronts = nonDominatedSort(population);
  const findings: DarwinFinding[] = [];
  for (let rank = 0; rank < finalFronts.length; rank++) {
    const d = crowdingDistance(population, finalFronts[rank]);
    for (const idx of finalFronts[rank]) {
      const p = population[idx];
      const dominatedCount = population.filter((q, j) =>
        j !== idx && dominates(p.fit, q.fit),
      ).length;
      // Compute severity: top-front winners with high TP - low FP
      const score = p.fit.truePositiveRatio - p.fit.falsePositiveRatio;
      const severity = Math.max(0, Math.min(1, 0.5 + score / 2));
      findings.push({
        kind: "genome",
        severity,
        payload: {
          rank,
          genome: p.g.params,
          fitness: p.fit,
          generations: GENS,
          populationSize: POP,
          dominated: dominatedCount,
          crowdingDistance: isFinite(d[idx]) ? d[idx] : 1e9,
        },
      });
    }
  }
  // Sort findings by rank then crowding distance descending
  findings.sort(
    (a, b) =>
      a.payload.rank - b.payload.rank ||
      b.payload.crowdingDistance - a.payload.crowdingDistance,
  );

  return {
    findings: findings.slice(0, Math.min(20, findings.length)),
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
    },
  };
}
