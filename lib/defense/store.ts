// ---------------------------------------------------------------------------
// GladiusSentinel — Supabase write/read facade for the learning bank
// ---------------------------------------------------------------------------
// gladius-crm uses Prisma; gladiusturf-com uses Supabase. Rather than port
// every module separately, the three modules that need persistence
// (memory, decay, chains) talk to this tiny adapter. The shape mirrors what
// the gladius-crm modules expect; the implementation is Supabase REST.
//
// All functions are best-effort: a missing env var or DB error is logged
// and swallowed. Sentinel must never crash the host process — that's the
// founder rule from `feedback_legendary_only.md`.
// ---------------------------------------------------------------------------

import { supabaseAdmin } from "@/lib/supabase";

export interface SentinelEventInsert {
  kind: string;
  severity: string;
  payload: Record<string, unknown>;
}

/**
 * Persist a single Sentinel event row. Returns true on success, false on any
 * failure path. Federation cron picks up rows with `federated=false`.
 */
export async function insertSentinelEvent(
  event: SentinelEventInsert,
): Promise<boolean> {
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("sentinel_events").insert({
      kind: event.kind,
      severity: event.severity,
      payload: event.payload as object,
      federated: false,
    });
    if (error) {
      console.error("[sentinel:store] event insert error:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(
      "[sentinel:store] event insert exception:",
      e instanceof Error ? e.message : String(e),
    );
    return false;
  }
}

/**
 * Upsert a learned-pattern row by `pattern_key`. New rows start at
 * `hit_count=1`. Existing rows bump `hit_count` and refresh `last_seen_at`
 * + signature. `accuracy` is not auto-adjusted here — callers (predictor,
 * archetype scan) can pass a new accuracy value if they have one.
 */
export async function upsertLearnedPattern(args: {
  patternKey: string;
  signature: Record<string, unknown>;
  accuracy?: number;
}): Promise<boolean> {
  try {
    const sb = supabaseAdmin();
    // Read current row first to compute hit_count + accuracy.
    const { data: existing } = await sb
      .from("sentinel_learned_patterns")
      .select("hit_count, accuracy")
      .eq("pattern_key", args.patternKey)
      .maybeSingle();

    const nextHit =
      ((existing?.hit_count as number | undefined) ?? 0) + 1;
    const nextAccuracy =
      args.accuracy ??
      ((existing?.accuracy as number | undefined) ?? 1.0);

    const { error } = await sb.from("sentinel_learned_patterns").upsert(
      {
        pattern_key: args.patternKey,
        signature: args.signature as object,
        hit_count: nextHit,
        accuracy: nextAccuracy,
        last_seen_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: "pattern_key" },
    );
    if (error) {
      console.error("[sentinel:store] pattern upsert error:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(
      "[sentinel:store] pattern upsert exception:",
      e instanceof Error ? e.message : String(e),
    );
    return false;
  }
}

/** Snapshot of one learned pattern row for the founders page. */
export interface LearnedPatternRow {
  patternKey: string;
  hitCount: number;
  accuracy: number;
  lastSeenAt: string;
  firstSeenAt: string;
  signature: Record<string, unknown>;
}

export async function listRecentPatterns(
  limit = 50,
): Promise<LearnedPatternRow[]> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("sentinel_learned_patterns")
      .select(
        "pattern_key, hit_count, accuracy, last_seen_at, first_seen_at, signature",
      )
      .eq("active", true)
      .order("last_seen_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((r) => ({
      patternKey: String(r.pattern_key),
      hitCount: Number(r.hit_count ?? 0),
      accuracy: Number(r.accuracy ?? 0),
      lastSeenAt: String(r.last_seen_at),
      firstSeenAt: String(r.first_seen_at),
      signature: (r.signature ?? {}) as Record<string, unknown>,
    }));
  } catch {
    return [];
  }
}

export async function listRecentEvents(
  limit = 100,
): Promise<
  Array<{
    id: string;
    ts: string;
    kind: string;
    severity: string;
    payload: Record<string, unknown>;
    federated: boolean;
  }>
> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("sentinel_events")
      .select("id, ts, kind, severity, payload, federated")
      .order("ts", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((r) => ({
      id: String(r.id),
      ts: String(r.ts),
      kind: String(r.kind),
      severity: String(r.severity),
      payload: (r.payload ?? {}) as Record<string, unknown>,
      federated: Boolean(r.federated),
    }));
  } catch {
    return [];
  }
}

export async function countFederationBacklog(): Promise<number> {
  try {
    const sb = supabaseAdmin();
    const { count, error } = await sb
      .from("sentinel_events")
      .select("id", { count: "exact", head: true })
      .eq("federated", false);
    if (error) return 0;
    return Number(count ?? 0);
  } catch {
    return 0;
  }
}

export async function markEventsFederated(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const sb = supabaseAdmin();
    await sb
      .from("sentinel_events")
      .update({ federated: true })
      .in("id", ids);
  } catch {
    /* swallow */
  }
}

export interface IqScoreRow {
  computedAt: string;
  score: number;
  componentBreakdown: Record<string, unknown>;
}

export async function insertIqScore(args: {
  score: number;
  componentBreakdown: Record<string, unknown>;
}): Promise<void> {
  try {
    const sb = supabaseAdmin();
    await sb.from("sentinel_iq_scores").insert({
      score: args.score,
      component_breakdown: args.componentBreakdown as object,
    });
  } catch (e) {
    console.error(
      "[sentinel:store] iq insert exception:",
      e instanceof Error ? e.message : String(e),
    );
  }
}

export async function latestIqScore(): Promise<IqScoreRow | null> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("sentinel_iq_scores")
      .select("computed_at, score, component_breakdown")
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      computedAt: String(data.computed_at),
      score: Number(data.score),
      componentBreakdown: (data.component_breakdown ?? {}) as Record<
        string,
        unknown
      >,
    };
  } catch {
    return null;
  }
}

export async function recentIqScores(limit = 30): Promise<IqScoreRow[]> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("sentinel_iq_scores")
      .select("computed_at, score, component_breakdown")
      .order("computed_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((r) => ({
      computedAt: String(r.computed_at),
      score: Number(r.score),
      componentBreakdown: (r.component_breakdown ?? {}) as Record<
        string,
        unknown
      >,
    }));
  } catch {
    return [];
  }
}

/**
 * Convenience: emit one Sentinel event AND federate it best-effort.
 * Used by the locked-surface scanner and the schema/tenant crons.
 */
export async function emit(event: SentinelEventInsert): Promise<void> {
  await insertSentinelEvent(event);
}
