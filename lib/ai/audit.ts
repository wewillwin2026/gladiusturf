import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

export type AiSessionKind = "demo" | "tenant" | "founders" | "unknown";

/**
 * Per-tenant daily AI budget. AI Director called this a "gating bug" —
 * without a cap, a single curious tenant pasting the OSHA manual into
 * Ask Gladius can hit $40 of Sonnet cost in an afternoon. This caps
 * each tenant's `ai_run` cost in the rolling-24h window.
 *
 * 500 cents = $5/day = ~50k Sonnet output tokens or ~10k turns of
 * cached-input chat. Independent tier's AI envelope per AI Director's
 * math is ~$80/mo, so $5/day leaves margin even at the median.
 */
export const AI_DAILY_BUDGET_CENTS = Number(
  process.env.AI_DAILY_BUDGET_CENTS ?? 500,
);

export type BudgetCheck =
  | { ok: true; spentCents: number; remainingCents: number }
  | { ok: false; reason: "exceeded"; spentCents: number };

/**
 * Sums today's `ai_run.cost_cents` for a tenant and decides whether the
 * next AI call is allowed. Best-effort — on lookup error, the call
 * proceeds (we'd rather fall open than block legitimate usage on a
 * transient DB issue; the audit row will still be written).
 *
 * Demo + founders sessions bypass the cap — `tenantId` is null for those.
 */
export async function checkAiBudget(
  tenantId: string | null,
): Promise<BudgetCheck> {
  if (!tenantId) {
    return { ok: true, spentCents: 0, remainingCents: AI_DAILY_BUDGET_CENTS };
  }
  try {
    const sb = supabaseAdmin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb
      .from("ai_run")
      .select("cost_cents")
      .eq("tenant_id", tenantId)
      .gte("created_at", since);
    if (error) {
      console.warn("[ai-audit] budget lookup error — failing open", error);
      return { ok: true, spentCents: 0, remainingCents: AI_DAILY_BUDGET_CENTS };
    }
    const spent = (data ?? []).reduce(
      (s, r) => s + ((r.cost_cents as number) ?? 0),
      0,
    );
    if (spent >= AI_DAILY_BUDGET_CENTS) {
      return { ok: false, reason: "exceeded", spentCents: spent };
    }
    return {
      ok: true,
      spentCents: spent,
      remainingCents: AI_DAILY_BUDGET_CENTS - spent,
    };
  } catch (err) {
    console.warn("[ai-audit] budget check threw — failing open", err);
    return { ok: true, spentCents: 0, remainingCents: AI_DAILY_BUDGET_CENTS };
  }
}

export type AiRunRecord = {
  tenantId: string | null;
  sessionKind: AiSessionKind;
  surface: string;
  model: string;
  systemPrompt: string;
  promptVersion?: string;
  inputTokens?: number | null;
  cachedInputTokens?: number | null;
  outputTokens?: number | null;
  costCents?: number | null;
  output?: string | null;
  meta?: Record<string, unknown> | null;
};

/**
 * Hash the system prompt so we can group runs by version without storing the
 * (possibly large) prompt body on every row.
 */
export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 32);
}

/**
 * Pricing for `claude-sonnet-4-6` (per 1M tokens, USD).
 * Numbers in cents (1¢ = $0.01) so we can store as integer.
 */
const SONNET_PRICING = {
  input: 300, // $3.00 / 1M = 300 cents
  cached: 30, // 90% off
  output: 1500, // $15.00 / 1M = 1500 cents
} as const;

const HAIKU_PRICING = {
  input: 80,
  cached: 8,
  output: 400,
} as const;

function priceFor(model: string) {
  if (/haiku/i.test(model)) return HAIKU_PRICING;
  return SONNET_PRICING;
}

export function estimateCostCents(
  model: string,
  inputTokens: number | null | undefined,
  cachedInputTokens: number | null | undefined,
  outputTokens: number | null | undefined,
): number | null {
  if (inputTokens == null && outputTokens == null) return null;
  const p = priceFor(model);
  const inT = inputTokens ?? 0;
  const cT = cachedInputTokens ?? 0;
  const oT = outputTokens ?? 0;
  // Cost in cents: tokens * cents-per-1M / 1_000_000.
  const cost =
    (inT * p.input + cT * p.cached + oT * p.output) / 1_000_000;
  return Math.max(0, Math.round(cost));
}

/**
 * Best-effort insert into `ai_run`. Returns the inserted row id (so
 * downstream audit_log writes can carry `metadata.ai_run_id` for AI
 * Director's chain-linkage P0), or null on any failure. Never throws —
 * AI surfaces should keep streaming even if logging fails.
 */
export async function logAiRun(rec: AiRunRecord): Promise<string | null> {
  try {
    const sb = supabaseAdmin();
    const promptHash = rec.systemPrompt ? hashPrompt(rec.systemPrompt) : "";
    const cost =
      rec.costCents ??
      estimateCostCents(
        rec.model,
        rec.inputTokens,
        rec.cachedInputTokens,
        rec.outputTokens,
      );
    const excerpt =
      rec.output && rec.output.length > 4000
        ? rec.output.slice(0, 4000)
        : (rec.output ?? null);
    const { data, error } = await sb
      .from("ai_run")
      .insert({
        tenant_id: rec.tenantId,
        session_kind: rec.sessionKind,
        surface: rec.surface,
        model: rec.model,
        prompt_hash: promptHash,
        prompt_version: rec.promptVersion ?? null,
        input_tokens: rec.inputTokens ?? null,
        cached_input_tokens: rec.cachedInputTokens ?? null,
        output_tokens: rec.outputTokens ?? null,
        cost_cents: cost,
        output_excerpt: excerpt,
        meta: rec.meta ?? null,
      })
      .select("id")
      .maybeSingle();
    if (error) {
      console.warn("[ai-audit] log failed", error);
      return null;
    }
    return (data?.id as string) ?? null;
  } catch (err) {
    console.warn("[ai-audit] log threw", err);
    return null;
  }
}
