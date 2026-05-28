// ---------------------------------------------------------------------------
// GladiusDefense -- 3-Tier IP Memory (Short / Medium / Long EMA)
// ---------------------------------------------------------------------------
// Each tier has a different smoothing factor (alpha) so the defense system
// reacts quickly to spikes (short) while retaining long-term reputation
// history (long). Composite score: 0.50*short + 0.30*medium + 0.20*long.
//
// gladiusturf-com variant: writes to the `sentinel_learned_patterns` table
// via Supabase. Each IP is stored as a learned pattern with patternKey
// `ip-mem:<ip>` and a signature carrying the four EMA values. This piggy-
// backs on the learning bank we already need for archetypes, instead of
// adding a second `defense_ip_reputation` table.

import { supabaseAdmin } from "@/lib/supabase";
import { compositeIPScore, emaScalar } from "./defense-compat";

/** Alpha values for each memory tier. */
const ALPHA_SHORT = 0.3;
const ALPHA_MEDIUM = 0.05;
const ALPHA_LONG = 0.01;

/** Composite weights. */
const W_SHORT = 0.5;
const W_MEDIUM = 0.3;
const W_LONG = 0.2;

export interface MemoryLayers {
  ip: string;
  short: number;
  medium: number;
  long: number;
  composite: number;
  updatedAt: string;
}

interface SignaturePayload {
  short?: number;
  medium?: number;
  long?: number;
  composite?: number;
}

function key(ip: string): string {
  return `ip-mem:${ip}`;
}

/**
 * Compute the composite score from the three tiers.
 */
export function computeComposite(
  short: number,
  medium: number,
  long: number,
): number {
  return compositeIPScore(short, medium, long);
}

/**
 * Update all three memory tiers for a single IP in-memory.
 * Returns the new layer values without persisting.
 */
export function updateLayersLocal(
  current: { short: number; medium: number; long: number },
  newScore: number,
): { short: number; medium: number; long: number; composite: number } {
  const short = emaScalar(current.short, newScore, ALPHA_SHORT);
  const medium = emaScalar(current.medium, newScore, ALPHA_MEDIUM);
  const long = emaScalar(current.long, newScore, ALPHA_LONG);
  const composite = W_SHORT * short + W_MEDIUM * medium + W_LONG * long;
  return { short, medium, long, composite };
}

/**
 * Read the current memory layers for an IP. Returns default zeros if the IP
 * has no record. Never throws.
 */
export async function readMemoryLayers(ip: string): Promise<MemoryLayers> {
  const defaults: MemoryLayers = {
    ip,
    short: 0,
    medium: 0,
    long: 0,
    composite: 0,
    updatedAt: new Date().toISOString(),
  };
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from("sentinel_learned_patterns")
      .select("signature, last_seen_at")
      .eq("pattern_key", key(ip))
      .maybeSingle();
    if (!data) return defaults;
    const sig = (data.signature ?? {}) as SignaturePayload;
    return {
      ip,
      short: Number(sig.short ?? 0),
      medium: Number(sig.medium ?? 0),
      long: Number(sig.long ?? 0),
      composite: Number(sig.composite ?? 0),
      updatedAt: String(data.last_seen_at ?? defaults.updatedAt),
    };
  } catch {
    return defaults;
  }
}

/**
 * Update all three memory tiers for an IP and persist. Never throws.
 */
export async function updateMemoryLayers(
  ip: string,
  newScore: number,
): Promise<void> {
  const current = await readMemoryLayers(ip);
  const updated = updateLayersLocal(
    { short: current.short, medium: current.medium, long: current.long },
    newScore,
  );
  try {
    const sb = supabaseAdmin();
    // Read existing hit_count so we can bump it atomically.
    const { data: existing } = await sb
      .from("sentinel_learned_patterns")
      .select("hit_count")
      .eq("pattern_key", key(ip))
      .maybeSingle();
    const nextHit = ((existing?.hit_count as number | undefined) ?? 0) + 1;
    await sb.from("sentinel_learned_patterns").upsert(
      {
        pattern_key: key(ip),
        signature: {
          short: updated.short,
          medium: updated.medium,
          long: updated.long,
          composite: updated.composite,
        },
        hit_count: nextHit,
        accuracy: 1.0,
        last_seen_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: "pattern_key" },
    );
  } catch (e) {
    console.error(
      "[defense:memory] upsert error:",
      e instanceof Error ? e.message : String(e),
    );
  }
}

/**
 * Batch-update memory layers for multiple IPs. Reads all at once, computes
 * new values, then upserts row by row.
 */
export async function batchUpdateMemoryLayers(
  updates: { ip: string; score: number }[],
): Promise<void> {
  if (updates.length === 0) return;
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return;
  }
  const keys = updates.map((u) => key(u.ip));
  let existing: Array<{
    pattern_key: string;
    signature: SignaturePayload;
    hit_count: number;
  }> = [];
  try {
    const { data } = await sb
      .from("sentinel_learned_patterns")
      .select("pattern_key, signature, hit_count")
      .in("pattern_key", keys);
    existing = (data ?? []) as Array<{
      pattern_key: string;
      signature: SignaturePayload;
      hit_count: number;
    }>;
  } catch {
    /* fall through with empty existing */
  }
  const existingMap = new Map<
    string,
    { short: number; medium: number; long: number; hitCount: number }
  >();
  for (const row of existing) {
    const sig = row.signature ?? {};
    existingMap.set(row.pattern_key, {
      short: Number(sig.short ?? 0),
      medium: Number(sig.medium ?? 0),
      long: Number(sig.long ?? 0),
      hitCount: Number(row.hit_count ?? 0),
    });
  }
  for (const u of updates) {
    const k = key(u.ip);
    const current = existingMap.get(k) ?? {
      short: 0,
      medium: 0,
      long: 0,
      hitCount: 0,
    };
    const updated = updateLayersLocal(
      { short: current.short, medium: current.medium, long: current.long },
      u.score,
    );
    try {
      await sb.from("sentinel_learned_patterns").upsert(
        {
          pattern_key: k,
          signature: {
            short: updated.short,
            medium: updated.medium,
            long: updated.long,
            composite: updated.composite,
          },
          hit_count: current.hitCount + 1,
          accuracy: 1.0,
          last_seen_at: new Date().toISOString(),
          active: true,
        },
        { onConflict: "pattern_key" },
      );
    } catch (e) {
      console.error(
        "[defense:memory] batch upsert error:",
        e instanceof Error ? e.message : String(e),
      );
    }
  }
}
