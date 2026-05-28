// ---------------------------------------------------------------------------
// GladiusDefense — Predictive Threat Modeling (mechanism #18)
// ---------------------------------------------------------------------------
// Predicts near-term attack windows from two signals:
//
//   1. EMA trend extrapolation on attack frequency per archetype.
//      We bucket events by hour, compute EMA(alpha=0.3) on the per-hour
//      count, then linear-extrapolate the trend slope over the next 6 hours.
//
//   2. Chi-squared goodness-of-fit test on hourly distribution to detect
//      time-of-day peaks. If chi^2 > critical(p=0.05, df=23) ≈ 35.17, the
//      distribution is non-uniform and we flag the peak hour(s).
//
// Output: a list of predicted threat windows with confidence, archetype,
// and expected hour-of-day. Used by ops to pre-position rate limits.
//
// Example:
//   const out = runPredictor({ events, windowMs: 7*86400000 });
//   out.findings → [
//     { kind:"prediction", payload:{ archetype:"recon_operator",
//       horizonHours:6, expectedEventsPerHour: 28, peakHour: 3,
//       chiSquared: 41.2, trendSlope: 1.4, confidence: 0.78 } }
//   ]
// ---------------------------------------------------------------------------

import type { Archetype, DefenseEvent } from "./types";

export interface PredictorInput {
  events: DefenseEvent[];
  windowMs: number;
  /** How many hours of history to use. Default = windowMs / 1h. */
  horizonHours?: number;
}

export interface PredictionFinding {
  kind: "prediction";
  severity: number;
  payload: {
    archetype: Archetype | "all";
    horizonHours: number;
    expectedEventsPerHour: number;
    peakHour: number; // 0-23 (UTC)
    chiSquared: number;
    chiSquaredCritical: number;
    isNonUniform: boolean;
    trendSlope: number; // events/hour change per hour
    emaCurrent: number;
    confidence: number; // 0..1
    hourlyHistogram: number[]; // 24 buckets (UTC)
  };
}

export interface PredictorOutput {
  findings: PredictionFinding[];
  meta: { processedCount: number; durationMs: number };
}

const DEFAULT_HORIZON_HOURS = 6;
const CHI_SQUARED_CRITICAL_DF23_P05 = 35.17;
const EMA_ALPHA = 0.3;

const ARCHETYPES: Archetype[] = [
  "script_kiddie",
  "recon_operator",
  "credential_stuffer",
  "application_attacker",
  "apt_simulator",
];

function bucketByHour(events: DefenseEvent[]): number[] {
  const buckets = new Array(24).fill(0);
  for (const e of events) {
    const d = new Date(e.timestamp);
    if (Number.isNaN(d.getTime())) continue;
    const h = d.getUTCHours();
    buckets[h]++;
  }
  return buckets;
}

function chiSquaredUniform(observed: number[]): number {
  const total = observed.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const expected = total / observed.length;
  if (expected < 5) return 0; // chi-squared assumption fails
  let chi = 0;
  for (const o of observed) {
    chi += (o - expected) ** 2 / expected;
  }
  return chi;
}

function emaSeries(values: number[], alpha: number): number[] {
  if (values.length === 0) return [];
  const out: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    out.push(alpha * values[i] + (1 - alpha) * out[i - 1]);
  }
  return out;
}

/** OLS slope of a series. */
function trendSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - meanX;
    num += dx * (values[i] - meanY);
    den += dx * dx;
  }
  return den === 0 ? 0 : num / den;
}

function bucketByContiguousHour(
  events: DefenseEvent[],
  windowMs: number,
): number[] {
  if (events.length === 0) return [];
  const end = Date.now();
  const start = end - windowMs;
  const hours = Math.max(1, Math.ceil(windowMs / 3_600_000));
  const buckets = new Array(hours).fill(0);
  for (const e of events) {
    const t = new Date(e.timestamp).getTime();
    if (!isFinite(t) || t < start || t > end) continue;
    const idx = Math.min(hours - 1, Math.floor((t - start) / 3_600_000));
    buckets[idx]++;
  }
  return buckets;
}

function buildFinding(
  archetype: Archetype | "all",
  events: DefenseEvent[],
  windowMs: number,
  horizon: number,
): PredictionFinding | null {
  if (events.length < 6) return null;
  const todBuckets = bucketByHour(events);
  const chi = chiSquaredUniform(todBuckets);
  const isNonUniform = chi > CHI_SQUARED_CRITICAL_DF23_P05;

  let peakHour = 0;
  let peakCount = -1;
  for (let h = 0; h < 24; h++) {
    if (todBuckets[h] > peakCount) {
      peakCount = todBuckets[h];
      peakHour = h;
    }
  }

  const series = bucketByContiguousHour(events, windowMs);
  const ema = emaSeries(series, EMA_ALPHA);
  const emaCurrent = ema.length > 0 ? ema[ema.length - 1] : 0;
  const slope = trendSlope(ema);
  const expectedEventsPerHour = Math.max(0, emaCurrent + slope * horizon);

  // Confidence: blend chi-squared significance + trend stability + volume
  const chiConf = Math.min(1, chi / (CHI_SQUARED_CRITICAL_DF23_P05 * 2));
  const volConf = Math.min(1, events.length / 100);
  const stabConf = ema.length > 1
    ? 1 - Math.min(1, Math.abs(slope) / Math.max(1, emaCurrent + 1))
    : 0;
  const confidence = 0.4 * chiConf + 0.4 * volConf + 0.2 * stabConf;

  const severity = Math.min(
    1,
    (isNonUniform ? 0.4 : 0.1) +
      Math.min(0.5, expectedEventsPerHour / 60) +
      Math.max(0, Math.min(0.2, slope / 20)),
  );

  return {
    kind: "prediction",
    severity,
    payload: {
      archetype,
      horizonHours: horizon,
      expectedEventsPerHour,
      peakHour,
      chiSquared: chi,
      chiSquaredCritical: CHI_SQUARED_CRITICAL_DF23_P05,
      isNonUniform,
      trendSlope: slope,
      emaCurrent,
      confidence,
      hourlyHistogram: todBuckets,
    },
  };
}

/**
 * Run predictive analysis on the supplied events.
 *
 * Pure function — no I/O. Caller persists.
 */
export function runPredictor(input: PredictorInput): PredictorOutput {
  const startedAt = Date.now();
  const horizon = input.horizonHours ?? DEFAULT_HORIZON_HOURS;
  const findings: PredictionFinding[] = [];

  // Always emit an aggregate prediction
  const overall = buildFinding("all", input.events, input.windowMs, horizon);
  if (overall) findings.push(overall);

  for (const archetype of ARCHETYPES) {
    const archEvents = input.events.filter((e) => e.archetype === archetype);
    const f = buildFinding(archetype, archEvents, input.windowMs, horizon);
    if (f) findings.push(f);
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
    },
  };
}
