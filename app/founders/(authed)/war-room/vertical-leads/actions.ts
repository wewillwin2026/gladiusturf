"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true } | { error: string };

const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "converted",
  "disqualified",
] as const;
type LeadStatus = (typeof ALLOWED_STATUSES)[number];

async function requireFounderEmail(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(FOUNDER_COOKIE_NAME)?.value;
  const verified = verifyFounderSessionCookieValue(raw);
  return verified?.email ?? null;
}

/**
 * Cycle a vertical_leads row's status. Founders-only — anyone without the
 * gladius_founder_session cookie is rejected. Audit-logged with actor email.
 */
export async function updateLeadStatusAction(
  formData: FormData,
): Promise<Result> {
  const founderEmail = await requireFounderEmail();
  if (!founderEmail) return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  const next = String(formData.get("status") ?? "").trim();
  if (!id) return { error: "missing_id" };
  if (!ALLOWED_STATUSES.includes(next as LeadStatus)) {
    return { error: "invalid_status" };
  }

  const sb = supabaseAdmin();
  const { data: existing, error: lookupErr } = await sb
    .from("vertical_leads")
    .select("id, status, vertical, email, company")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !existing) return { error: "not_found" };

  const prev = (existing as { status: string }).status;

  const { error: updateErr } = await sb
    .from("vertical_leads")
    .update({ status: next })
    .eq("id", id);
  if (updateErr) {
    console.warn("updateLeadStatus update error", updateErr);
    return { error: "update_failed" };
  }

  // Audit-log: tenant_id is null for vertical_leads (they're not yet a tenant
  // — that's the whole point of a waitlist row). Log the actor explicitly so
  // we have a paper trail of which founder marked a lead what.
  try {
    await sb.from("audit_log").insert({
      tenant_id: null,
      user_id: null,
      action: "vertical_lead_status_changed",
      entity_type: "vertical_lead",
      entity_id: id,
      metadata: {
        actor_email: founderEmail,
        from: prev,
        to: next,
        vertical: (existing as { vertical: string }).vertical,
        email: (existing as { email: string | null }).email,
        company: (existing as { company: string | null }).company,
      },
    });
  } catch (err) {
    console.warn("vertical_lead audit insert failed (non-fatal)", err);
  }

  revalidatePath("/founders/war-room/vertical-leads");
  return { ok: true };
}
