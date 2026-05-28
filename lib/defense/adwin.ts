// ---------------------------------------------------------------------------
// GladiusDefense — ADWIN Drift Sentinel (mechanism #27)
// ---------------------------------------------------------------------------
// Adaptive Windowing change-point detection. The classic Bifet & Gavaldà
// ADWIN-1 / ADWIN-2 algorithm.
//
// Idea: maintain a window W of recent observations of a metric. For each
// split W = W0 ∘ W1 where |W0|, |W1| > 0, test:
//
//   |mean(W0) − mean(W1)| > ε_cut
//   ε_cut = sqrt( (1 / (2*m)) * ln(4 * |W| / δ) ),   m = harmonic mean of |W0|,|W1|
//
// If the test fires for any split, drop W0 (older half), keep W1 — that's the
// "shrink on drift" rule. We return drift signal + which metric drifted.
//
// We test multiple metrics in parallel (request rate, threat score mean,
// unique-path entropy, 4xx ratio). Each metric maintains its own window.
//
// Example:
//   const out = runAdwin({ events, windowMs: 6*3600*1000, delta: 0.002 });
//   out.findings → [
//     { kind:"drift", payload:{ metric:"threat_score_mean",
//       windowSize: 412, splitAt: 180, leftMean: 0.34, rightMean: 0.71,
//       epsilonCut: 0.18, magnitude: 0.37 } }
//   ]
//
// Pure function. State is rebuilt from events each call (we don't
// persist ADWIN state — that's fine for a 5-minute cron, since the window
// is bounded by the event lookback).
// ---------------------------------------------------------------------------

import type { DefenseEvent } from "./types";

export interface AdwinInput {
  events: DefenseEvent[];
  windowMs: number;
  /** Confidence parameter δ. Smaller = more conservative. Default 0.002. */
  delta?: number;
  /** Coarse bucket size for series-building (default 60s). */
  bucketMs?: number;
}

export type AdwinMetric =
  | "request_rate"
  | "threat_score_mean"
  | "unique_path_entropy"
  | "error_4xx_ratio"
  | "unique_ip_count";

export interface AdwinFinding {
  kind: "drift";
  severity: number;
  payload: {
    metric: AdwinMetric;
    windowSize: number;
    splitAt: number;
    leftMean: number;
    rightMean: number;
    epsilonCut: number;
    magnitude: number;
    delta: number;
    direction: "increase" | "decrease";
  };
}

export interface AdwinOutput {
  findings: AdwinFinding[];
  meta: { processedCount: number; durationMs: number; metricsChecked: number };
}

const DEFAULT_DELTA = 0.002;
const DEFAULT_BUCKET_MS = 60_000;

function shannon(values: string[]): number {
  if (values.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let h = 0;
  for (const c of counts.values()) {
    const p = c / values.length;
    h -= p * Math.log2(p);
  }
  return h;
}

function bucketize(
  events: DefenseEvent[],
  windowMs: number,
  bucketMs: number,
): {
  requestRate: number[];
  threatScoreMean: number[];
  uniquePathEntropy: number[];
  error4xxRatio: number[];
  uniqueIpCount: number[];
} {
  if (events.length === 0) {
    return {
      requestRate: [],
      threatScoreMean: [],
      uniquePathEntropy: [],
      error4xxRatio: [],
      uniqueIpCount: [],
    };
  }
  const end = Date.now();
  const start = end - windowMs;
  const buckets = Math.max(1, Math.ceil(windowMs / bucketMs));
  const counts = new Array(buckets).fill(0);
  const scoreSums = new Array(buckets).fill(0);
  const pathsByBucket: string[][] = Array.from({ length: buckets }, () => []);
  const ipsByBucket: Set<string>[] = Array.from({ length: buckets }, () => new Set());
  const err4xx = new Array(buckets).fill(0);

  for (const e of events) {
    const t = new Date(e.timestamp).getTime();
    if (!isFinite(t) || t < start || t > end) continue;
    const idx = Math.min(buckets - 1, Math.floor((t - start) / bucketMs));
    counts[idx]++;
    scoreSums[idx] += e.threatScore;
    pathsByBucket[idx].push(e.path);
    if (e.ip) ipsByBucket[idx].add(e.ip);
    if (e.statusCode >= 400 && e.statusCode < 500) err4xx[idx]++;
  }

  const requestRate = counts;
  const threatScoreMean = counts.map((c, i) => (c > 0 ? scoreSums[i] / c : 0));
  const uniquePathEntropy = pathsByBucket.map((paths) => shannon(paths));
  const error4xxRatio = counts.map((c, i) => (c > 0 ? err4xx[i] / c : 0));
  const uniqueIpCount = ipsByBucket.map((s) => s.size);

  return {
    requestRate,
    threatScoreMean,
    uniquePathEntropy,
    error4xxRatio,
    uniqueIpCount,
  };
}

interface DriftResult {
  drift: boolean;
  splitAt: number;
  leftMean: number;
  rightMean: number;
  epsilonCut: number;
  magnitude: number;
}

/**
 * The ADWIN cut test on a single series. Returns the strongest split (largest
 * |leftMean − rightMean|) where the test fires; null otherwise.
 */
function adwinCut(
  series: number[],
  delta: number,
): DriftResult | null {
  const n = series.length;
  if (n < 8) return null;

  // Prefix sums for O(1) mean lookups.
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + series[i];

  let best: DriftResult | null = null;
  // Check every split with at least 2 elements on either side.
  for (let split = 2; split < n - 2; split++) {
    const n0 = split;
    const n1 = n - split;
    const mean0 = prefix[split] / n0;
    const mean1 = (prefix[n] - prefix[split]) / n1;
    const harmonicM = 1 / (1 / n0 + 1 / n1);
    // ε_cut = sqrt((1/(2m)) * ln(4*n/delta))
    const epsilon = Math.sqrt((1 / (2 * harmonicM)) * Math.log(4 * n / delta));
    const diff = Math.abs(mean0 - mean1);
    if (diff > epsilon) {
      if (!best || diff > best.magnitude) {
        best = {
          drift: true,
          splitAt: split,
          leftMean: mean0,
          rightMean: mean1,
          epsilonCut: epsilon,
          magnitude: diff,
        };
      }
    }
  }
  return best;
}

/**
 * Run ADWIN drift detection across 5 metrics.
 *
 * Pure function. Returns one finding per metric that drifted.
 */
export function runAdwin(input: AdwinInput): AdwinOutput {
  const startedAt = Date.now();
  const delta = input.delta ?? DEFAULT_DELTA;
  const bucketMs = input.bucketMs ?? DEFAULT_BUCKET_MS;
  const findings: AdwinFinding[] = [];

  const series = bucketize(input.events, input.windowMs, bucketMs);

  const metrics: Array<{ name: AdwinMetric; data: number[] }> = [
    { name: "request_rate", data: series.requestRate },
    { name: "threat_score_mean", data: series.threatScoreMean },
    { name: "unique_path_entropy", data: series.uniquePathEntropy },
    { name: "error_4xx_ratio", data: series.error4xxRatio },
    { name: "unique_ip_count", data: series.uniqueIpCount },
  ];

  for (const m of metrics) {
    const result = adwinCut(m.data, delta);
    if (!result) continue;
    const direction = result.rightMean > result.leftMean ? "increase" : "decrease";
    const severity = Math.min(
      1,
      0.3 + Math.min(0.7, result.magnitude / Math.max(1e-6, result.epsilonCut)) / 3,
    );
    findings.push({
      kind: "drift",
      severity,
      payload: {
        metric: m.name,
        windowSize: m.data.length,
        splitAt: result.splitAt,
        leftMean: result.leftMean,
        rightMean: result.rightMean,
        epsilonCut: result.epsilonCut,
        magnitude: result.magnitude,
        delta,
        direction,
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
      metricsChecked: metrics.length,
    },
  };
}
