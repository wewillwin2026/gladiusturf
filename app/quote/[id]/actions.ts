"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Customer-facing actions on the public /quote/[id] page. No auth — the
 * unguessable UUID is the gate. Both actions are idempotent: a duplicate
 * click after a successful accept is a no-op (re-applies the same status
 * and timestamp), so a forgiving customer experience can't double-fire
 * audit events to the tenant.
 *
 * Privacy guardrail: we read tenant_id + customer_id off the proposal
 * row to write the audit log, but we never echo them back to the public
 * page. The action returns only ok/error so a malicious caller learns
 * nothing about who owns this quote.
 */

export type QuoteAcceptResult = { ok: true } | { error: string };

export async function acceptQuote(
  proposalId: string,
): Promise<QuoteAcceptResult> {
  if (!proposalId) return { error: "missing_id" };
  const sb = supabaseAdmin();

  const { data: existing, error: lookupErr } = await sb
    .from("proposals")
    .select("id, tenant_id, customer_id, status")
    .eq("id", proposalId)
    .maybeSingle();
  if (lookupErr || !existing) return { error: "not_found" };

  // Drafts and lost proposals are not customer-actionable. Already
  // sold/installed = idempotent no-op (still 200, no extra audit row).
  if (existing.status === "draft" || existing.status === "lost") {
    return { error: "not_actionable" };
  }
  if (existing.status === "sold" || existing.status === "installed") {
    return { ok: true };
  }

  const nowIso = new Date().toISOString();
  const { error: updateErr } = await sb
    .from("proposals")
    .update({ status: "sold", sold_at: nowIso, updated_at: nowIso })
    .eq("id", proposalId);
  if (updateErr) return { error: "update_failed" };

  try {
    const hdrs = await headers();
    const ua = (hdrs.get("user-agent") ?? "").slice(0, 200);
    await sb.from("audit_log").insert({
      tenant_id: existing.tenant_id,
      user_id: null,
      action: "quote.accepted",
      entity_type: "proposal",
      entity_id: proposalId,
      metadata: {
        customer_id: existing.customer_id,
        source: "public_link",
        user_agent: ua,
      },
    });
  } catch (err) {
    console.warn("quote.accepted audit failed (non-fatal)", err);
  }

  revalidatePath("/app/quotes");
  revalidatePath(`/quote/${proposalId}`);
  return { ok: true };
}
