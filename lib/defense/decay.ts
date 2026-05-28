// ---------------------------------------------------------------------------
// GladiusDefense -- Temporal Decay + Cleanup
// ---------------------------------------------------------------------------
// Exponential decay for IP reputation scores stored as learned patterns
// keyed `ip-mem:*` (see memory.ts), and deactivation of patterns that
// haven't been seen in a long time.
//
// Default rates:
//   IP decay:      0.95 per day  (score *= 0.95 each day of inactivity)
//   Pattern decay: deactivate if not seen in 30+ days

import { supabaseAdmin } from "@/lib/supabase";
import { decayScore } from "./defense-compat";

/** Default decay constants. */
const DEFAULT_IP_DECAY_RATE = 0.95;
const PATTERN_DEACTIVATE_DAYS = 30;

interface PatternRow {
  pattern_key: string;
  signature: {
    short?: number;
    medium?: number;
    long?: number;
    composite?: number;
  };
  hit_count: number;
  last_seen_at: string;
}

/**
 * Apply exponential decay to all ip-mem learned-pattern rows. For each IP,
 * computes elapsed days since last activity and applies score *= rate^days.
 * Scores below 0.001 are floored to zero. Never throws.
 */
export async function decayIPScores(
  rate: number = DEFAULT_IP_DECAY_RATE,
): Promise<number> {
  let rows: PatternRow[] = [];
  let sb;
  try {
    sb = supabaseAdmin();
    const { data } = await sb
      .from("sentinel_learned_patterns")
      .select("pattern_key, signature, hit_count, last_seen_at")
      .eq("active", true)
      .like("pattern_key", "ip-mem:%");
    rows = ((data ?? []) as unknown) as PatternRow[];
  } catch {
    return 0;
  }
  if (rows.length === 0) return 0;

  const now = Date.now();
  const DAY_MS = 86_400_000;
  let totalUpdated = 0;

  for (const row of rows) {
    const lastSeen = new Date(row.last_seen_at).getTime();
    const elapsedDays = Math.max(0, (now - lastSeen) / DAY_MS);
    if (elapsedDays < 0.5) continue;

    const newShort = decayScore(Number(row.signature.short ?? 0), rate, elapsedDays);
    const newMedium = decayScore(
      Number(row.signature.medium ?? 0),
      rate,
      elapsedDays,
    );
    const newLong = decayScore(Number(row.signature.long ?? 0), rate, elapsedDays);
    const newComposite = 0.5 * newShort + 0.3 * newMedium + 0.2 * newLong;

    const floored = newComposite < 0.001;
    const finalComposite = floored ? 0 : newComposite;
    const finalShort = floored ? 0 : newShort;
    const finalMedium = floored ? 0 : newMedium;
    const finalLong = floored ? 0 : newLong;

    try {
      await sb
        .from("sentinel_learned_patterns")
        .update({
          signature: {
            short: finalShort,
            medium: finalMedium,
            long: finalLong,
            composite: finalComposite,
          },
          active: finalComposite > 0,
        })
        .eq("pattern_key", row.pattern_key);
      totalUpdated++;
    } catch {
      /* skip on row-level error */
    }
  }
  return totalUpdated;
}

/**
 * Deactivate learned patterns that haven't been seen in N days. Stops the
 * founders page from drowning in stale rows.
 */
export async function deactivateStalePatterns(
  daysOld: number = PATTERN_DEACTIVATE_DAYS,
): Promise<number> {
  try {
    const sb = supabaseAdmin();
    const cutoff = new Date(
      Date.now() - daysOld * 86_400_000,
    ).toISOString();
    const { count } = await sb
      .from("sentinel_learned_patterns")
      .update({ active: false }, { count: "exact" })
      .eq("active", true)
      .lt("last_seen_at", cutoff);
    return Number(count ?? 0);
  } catch (e) {
    console.error(
      "[defense:decay] deactivation error:",
      e instanceof Error ? e.message : String(e),
    );
    return 0;
  }
}

/** Run all decay operations in sequence. */
export async function runFullDecayCycle(
  ipRate: number = DEFAULT_IP_DECAY_RATE,
): Promise<{ ipsDecayed: number; patternsDeactivated: number }> {
  const [ipsDecayed, patternsDeactivated] = await Promise.all([
    decayIPScores(ipRate),
    deactivateStalePatterns(),
  ]);
  return { ipsDecayed, patternsDeactivated };
}
