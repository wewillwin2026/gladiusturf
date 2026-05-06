"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export type DraftQuoteInput = {
  customerId: string;
  title: string;
  totalDollars: number;
  language: "en" | "es";
  notes: string | null;
};

export type DraftQuoteResult =
  | { ok: true; proposalId: string }
  | { error: string };

/**
 * Create a draft quote (proposal) attached to a customer. Tenant-scoped,
 * lands in the proposals table with status='draft'.
 *
 * Per board's pricing-justification framing (no AI drafting yet for
 * tenant sessions — that ships behind the real Resend send pipeline +
 * citation guardrail), this is the minimum viable manual path so a
 * tenant can quote real customers Day 1 without waiting on the AI
 * pipeline.
 */
export async function createDraftQuote(
  input: DraftQuoteInput,
): Promise<DraftQuoteResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  const title = input.title?.trim() ?? "";
  if (!title) return { error: "missing_title" };
  if (!input.customerId) return { error: "missing_customer" };

  const total =
    Number.isFinite(input.totalDollars) && input.totalDollars > 0
      ? Math.round(input.totalDollars * 100)
      : null;

  const sb = supabaseAdmin();

  const { data: customer } = await sb
    .from("customers")
    .select("id")
    .eq("id", input.customerId)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (!customer) return { error: "not_found_in_tenant" };

  const { data, error } = await sb
    .from("proposals")
    .insert({
      tenant_id: session.tenant.id,
      customer_id: input.customerId,
      vertical: session.tenant.vertical,
      status: "draft",
      total_cents: total,
      language: input.language,
      ai_drafted: false,
      bom: { title, notes: input.notes?.trim() || null },
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("createDraftQuote error", error);
    return { error: "insert_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "proposal_drafted",
      entity_type: "proposal",
      entity_id: data.id as string,
      metadata: {
        customer_id: input.customerId,
        title,
        total_cents: total,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/quotes");
  revalidatePath(`/app/customers/${input.customerId}`);
  return { ok: true, proposalId: data.id as string };
}
