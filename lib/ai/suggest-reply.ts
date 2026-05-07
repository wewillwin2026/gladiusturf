import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { checkAiBudget, logAiRun } from "./audit";
import { log } from "@/lib/obs/log";

/**
 * Per-question idempotency cache. Engineering Director P1: a customer
 * who hits "Send" twice within the rate limit (5/min) would otherwise
 * trigger 5 Anthropic calls = 1.5¢ wasted. Cache by SHA-256 of
 * (proposalId + question text) for 60 seconds.
 */
type CacheEntry = { result: SuggestRepliesResult; at: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 500;

function cacheKey(proposalId: string, questionText: string): string {
  return createHash("sha256")
    .update(`${proposalId}|${questionText}`)
    .digest("hex")
    .slice(0, 32);
}

function cacheGet(key: string): SuggestRepliesResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

function cacheSet(key: string, result: SuggestRepliesResult): void {
  if (cache.size > CACHE_MAX) {
    const drop = cache.size - CACHE_MAX;
    let i = 0;
    for (const k of cache.keys()) {
      cache.delete(k);
      i += 1;
      if (i >= drop) break;
    }
  }
  cache.set(key, { result, at: Date.now() });
}

/**
 * AI reply suggestions — AI Director's #1 ranked feature.
 *
 * When a customer asks a question on /quote/[id], the tenant gets an
 * email. This helper prepares 3 short reply variants the tenant can
 * pick from. Read by the *tenant* (not the customer), so the blast
 * radius is one human approval away from leaving the platform.
 *
 * Returns null on any failure — the alert still goes out without
 * suggestions, the tenant just gets the question. Best-effort.
 *
 * Audit:
 *   - ai_run row written via logAiRun, surface = "question-reply-draft"
 *   - The returned aiRunId is meant to be embedded into the parent
 *     audit_log row (tenant_alert.sent metadata.ai_run_id) so the chain
 *     can prove "this email contained AI text written by run X."
 */

const PROMPT_VERSION = "question-reply-draft@v1";

export type SuggestRepliesInput = {
  tenantId: string;
  proposalId: string;
  proposalTitle: string;
  customerName: string;
  tenantName: string;
  customerLanguage: "en" | "es";
  questionText: string;
};

export type SuggestRepliesResult = {
  variants: string[];
  aiRunId: string | null;
};

const SYSTEM_PROMPT = `You draft 3 short reply suggestions for a small-business owner who just got a question from a customer on a quote.

Constraints:
- 3 variants. Each 1-3 sentences max.
- Match the customer's language (English or Spanish).
- Be friendly, factual, and concrete. No marketing fluff.
- Address the specific question if it's actionable; otherwise acknowledge + suggest a next step (call, on-site walk-through, send photos, schedule a visit).
- Sign off with the tenant's first name when natural.
- Output exactly this JSON shape: {"variants": ["...", "...", "..."]}. No prose, no markdown, no code fences.`;

/**
 * Strategy + AI Director P0: feature flag for AI reply suggestions.
 * Disable by setting `AI_REPLY_SUGGESTIONS_DISABLED=1`. The default is
 * ON so existing tenants keep working. Per-tenant tier gating happens
 * here too once a `tenants.tier` column exists; for now the env flag
 * is the kill switch.
 */
function aiReplySuggestionsEnabled(): boolean {
  return process.env.AI_REPLY_SUGGESTIONS_DISABLED !== "1";
}

export async function suggestRepliesForQuestion(
  input: SuggestRepliesInput,
): Promise<SuggestRepliesResult | null> {
  if (!aiReplySuggestionsEnabled()) {
    return null;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  // Idempotency cache — short-window dedupe on identical (proposal,
  // question) pairs so retries within rate-limit don't burn budget.
  const cacheK = cacheKey(input.proposalId, input.questionText);
  const cached = cacheGet(cacheK);
  if (cached) return cached;

  const budget = await checkAiBudget(input.tenantId);
  if (!budget.ok) {
    log.warn("AI reply skipped — daily budget exceeded", {
      surface: "question-reply-draft",
      kind: "budget_exceeded",
      tenantId: input.tenantId,
      proposalId: input.proposalId,
      spentCents: budget.spentCents,
    });
    return null;
  }

  const userMessage = [
    `Tenant business: ${input.tenantName}`,
    `Customer name: ${input.customerName}`,
    `Quote title: ${input.proposalTitle}`,
    `Customer language: ${input.customerLanguage === "es" ? "Spanish" : "English"}`,
    "",
    "Customer's question:",
    input.questionText,
  ].join("\n");

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = result.content.find((c) => c.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

    // Sonnet sometimes wraps JSON in ```json ... ``` despite the
    // explicit instruction. Strip code fences before parsing, and find
    // the outermost {...} as a final fallback.
    const stripped = raw
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");
    const jsonText =
      firstBrace >= 0 && lastBrace > firstBrace
        ? stripped.slice(firstBrace, lastBrace + 1)
        : stripped;

    let variants: string[] = [];
    try {
      const parsed = JSON.parse(jsonText) as { variants?: unknown };
      if (Array.isArray(parsed.variants)) {
        variants = parsed.variants
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .slice(0, 3);
      }
    } catch {
      // Model returned non-JSON; bail silently — no suggestions is fine.
      log.warn("AI reply parse failed", {
        surface: "question-reply-draft",
        kind: "parse_failed",
        tenantId: input.tenantId,
        proposalId: input.proposalId,
        rawPreview: raw.slice(0, 200),
      });
      return null;
    }

    if (variants.length === 0) return null;

    const aiRunId: string | null = await logAiRun({
      tenantId: input.tenantId,
      sessionKind: "tenant",
      surface: "question-reply-draft",
      model: "claude-sonnet-4-6",
      systemPrompt: SYSTEM_PROMPT,
      promptVersion: PROMPT_VERSION,
      inputTokens: result.usage?.input_tokens ?? null,
      cachedInputTokens:
        (result.usage as { cache_read_input_tokens?: number })
          ?.cache_read_input_tokens ?? null,
      outputTokens: result.usage?.output_tokens ?? null,
      output: raw,
      meta: {
        proposal_id: input.proposalId,
        variants_count: variants.length,
      },
    });

    const finalResult: SuggestRepliesResult = { variants, aiRunId };
    cacheSet(cacheK, finalResult);
    return finalResult;
  } catch (err) {
    log.warn("AI reply call failed", {
      surface: "question-reply-draft",
      kind: "anthropic_error",
      tenantId: input.tenantId,
      proposalId: input.proposalId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
