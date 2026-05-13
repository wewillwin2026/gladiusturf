"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true } | { error: string };

/**
 * Mark a proposal/invoice as paid. v1: flips `status` to 'sold' and stamps
 * `sold_at = now` if it wasn't already. The Stripe webhook does the same
 * thing on payment_succeeded; this action is the manual ("they paid by
 * check") fallback.
 *
 * Tenant-scoped; the where-clause double-checks tenant_id even though RLS
 * already enforces it.
 */
export async function markProposalPaid(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();

  // Idempotent: if already sold/installed we don't reset the timestamp.
  const { data: existing } = await sb
    .from("proposals")
    .select("status, sold_at")
    .eq("tenant_id", session.tenant.id)
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "not_found" };

  type Existing = { status: string; sold_at: string | null };
  const row = existing as Existing;

  if (row.status === "sold" || row.status === "installed") {
    return { ok: true };
  }

  const nowIso = new Date().toISOString();
  const { error } = await sb
    .from("proposals")
    .update({
      status: "sold",
      sold_at: row.sold_at ?? nowIso,
    })
    .eq("tenant_id", session.tenant.id)
    .eq("id", id);
  if (error) {
    console.warn("markProposalPaid failed", error);
    return { error: "update_failed" };
  }

  await sb.from("audit_log").insert({
    tenant_id: session.tenant.id,
    user_id: null,
    action: "invoice_marked_paid_manual",
    entity_type: "proposals",
    entity_id: id,
    metadata: { source: "invoices_page" },
  });

  revalidatePath("/app/invoices");
  revalidatePath("/app/quotes");
  return { ok: true };
}
