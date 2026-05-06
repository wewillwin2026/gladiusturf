import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

export type AiSessionKind = "demo" | "tenant" | "founders" | "unknown";

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
 * Best-effort insert into `ai_run`. Never throws — AI surfaces should
 * keep streaming even if logging fails.
 */
export async function logAiRun(rec: AiRunRecord): Promise<void> {
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
    await sb.from("ai_run").insert({
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
    });
  } catch (err) {
    console.warn("[ai-audit] log failed", err);
  }
}
