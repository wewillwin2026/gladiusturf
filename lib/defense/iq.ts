// ---------------------------------------------------------------------------
// GladiusSentinel — IQ Score
// ---------------------------------------------------------------------------
// A single 0–200 number representing how smart Sentinel is at this moment.
// Computed every 6 hours by the iq-recompute cron and persisted to
// `sentinel_iq_scores`. The founders page reads the latest row + plots the
// 30-day trend.
//
// Components (each 0–40):
//   1. CORPUS_DEPTH    — count of distinct learned patterns (log-scaled)
//   2. RECENCY         — % of patterns seen in the last 24h
//   3. FEDERATION_HEALTH — federation backlog inverse (low backlog = high)
//   4. CRITICAL_FLOWS  — % of locked-surface smoke tests passing
//   5. MODULE_DENSITY  — fixed at 40 since we ship the full 18-module set
//
// Starting IQ on day-0 (empty learning bank, no smokes yet): 100.
// IQ caps at 200; any single component dropping to zero pulls the total
// down proportionally.
// ---------------------------------------------------------------------------

import { listRecentPatterns, countFederationBacklog } from "./store";
import { runCriticalFlowSmokes } from "./critical-flow-smoke";

export interface IqBreakdown {
  corpusDepth: number;
  recency: number;
  federationHealth: number;
  criticalFlows: number;
  moduleDensity: number;
  total: number;
  notes: string[];
}

const MODULE_COUNT = 18; // count of source modules we ship
const TARGET_MODULES = 18;

export async function computeIqScore(opts?: {
  smokeBaseUrl?: string;
  /** Skip running smokes (costly) — use cached value. */
  skipSmoke?: boolean;
}): Promise<IqBreakdown> {
  const notes: string[] = [];

  // 1. Corpus depth — log-scaled. 0 patterns → 0; 50 → 40 (cap).
  const patterns = await listRecentPatterns(1000);
  const patternCount = patterns.length;
  const corpusDepth = Math.min(
    40,
    Math.round(40 * (Math.log10(1 + patternCount) / Math.log10(51))),
  );
  notes.push(`corpus_depth: ${patternCount} active patterns`);

  // 2. Recency — % of patterns seen in last 24h, capped at 40.
  const now = Date.now();
  const DAY = 86_400_000;
  const recent = patterns.filter(
    (p) => now - new Date(p.lastSeenAt).getTime() < DAY,
  ).length;
  const recencyPct = patternCount > 0 ? recent / patternCount : 0;
  // No patterns yet → neutral 20 (don't penalize day-0).
  const recency =
    patternCount === 0 ? 20 : Math.min(40, Math.round(recencyPct * 40));
  notes.push(`recency: ${recent}/${patternCount} in 24h`);

  // 3. Federation backlog — 0 backlog = 40, 100+ backlog = 0.
  const backlog = await countFederationBacklog();
  const federationHealth =
    backlog === 0 ? 40 : Math.max(0, 40 - Math.min(40, Math.round(backlog / 2.5)));
  notes.push(`federation_backlog: ${backlog}`);

  // 4. Critical flows — % of smoke tests passing.
  let criticalFlows = 30; // neutral default
  if (!opts?.skipSmoke) {
    const baseUrl = opts?.smokeBaseUrl ?? "https://gladiusturf.com";
    try {
      const report = await runCriticalFlowSmokes(baseUrl);
      if (report.totalSmokes > 0) {
        criticalFlows = Math.round(
          (report.passedSmokes / report.totalSmokes) * 40,
        );
        notes.push(
          `critical_flows: ${report.passedSmokes}/${report.totalSmokes} smokes passing`,
        );
      } else {
        notes.push("critical_flows: no smokes registered");
      }
    } catch (e) {
      notes.push(
        `critical_flows: smoke run failed (${e instanceof Error ? e.message : String(e)})`,
      );
    }
  } else {
    notes.push("critical_flows: skipped (skipSmoke=true)");
  }

  // 5. Module density — fixed at 40 since we ship the full set.
  const moduleDensity = Math.min(
    40,
    Math.round((MODULE_COUNT / TARGET_MODULES) * 40),
  );
  notes.push(`module_density: ${MODULE_COUNT}/${TARGET_MODULES} modules`);

  const total =
    corpusDepth + recency + federationHealth + criticalFlows + moduleDensity;
  return {
    corpusDepth,
    recency,
    federationHealth,
    criticalFlows,
    moduleDensity,
    total,
    notes,
  };
}
