"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true } | { error: string };

function normalizeE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  // Accept "(941) 205-1000" and friends — strip everything but digits +
  // a leading +. If no leading + and 10 digits, assume US (+1).
  const stripped = trimmed.replace(/[^\d+]/g, "");
  if (/^\+[1-9][0-9]{6,14}$/.test(stripped)) return stripped;
  if (/^[0-9]{10}$/.test(stripped)) return `+1${stripped}`;
  if (/^1[0-9]{10}$/.test(stripped)) return `+${stripped}`;
  return null;
}

/**
 * Tenant settings mutations. v1 ships review_url editing only — the
 * full edit UI for messaging guardrails, language, etc. comes later.
 *
 * Auth: tenant session required.
 * Tenant scoping: every update filters by session.tenant.id.
 * Audit-logged on success.
 */

export async function updateReviewUrl(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const raw = String(formData.get("review_url") ?? "").trim();
  // Empty input clears the column (back to placeholder fallback).
  const next: string | null = raw.length === 0 ? null : raw;

  if (next !== null) {
    // Mirrors the DB CHECK constraint so we surface a friendly error
    // instead of letting Postgres reject the update.
    if (!/^https:\/\//i.test(next)) return { error: "must_be_https" };
    if (next.length > 1024) return { error: "too_long" };
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenants")
    .update({ review_url: next })
    .eq("id", session.tenant.id);
  if (error) {
    // Most likely cause is the migration hasn't been applied yet.
    // Surface a specific error so the UI can suggest contacting support.
    if ((error.message ?? "").toLowerCase().includes("review_url")) {
      return { error: "column_not_ready" };
    }
    return { error: "update_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "tenant_review_url_updated",
      entity_type: "tenant",
      entity_id: session.tenant.id,
      metadata: { has_value: next !== null, length: next?.length ?? 0 },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/settings");
  return { ok: true };
}

/**
 * Update the owner phone + daily-briefing opt-in. Both fields ship in
 * 20260509_b_owner_daily_briefing.sql. Empty phone clears the column;
 * the toggle is only honored when a phone is set.
 */
export async function updateOwnerSmsPrefs(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const phoneRaw = String(formData.get("owner_phone") ?? "");
  const wantsBriefing = formData.get("daily_briefing_sms_enabled") === "on";

  const phone = phoneRaw.trim().length === 0 ? null : normalizeE164(phoneRaw);
  if (phoneRaw.trim().length > 0 && phone === null) {
    return { error: "invalid_phone_format" };
  }

  // Don't accept opt-in without a phone — the cron would skip anyway,
  // and surfacing the inconsistency is friendlier than letting it ship
  // half-set.
  const enabled = wantsBriefing && phone !== null;

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenants")
    .update({
      owner_phone: phone,
      daily_briefing_sms_enabled: enabled,
    })
    .eq("id", session.tenant.id);
  if (error) {
    if ((error.message ?? "").toLowerCase().includes("owner_phone")) {
      return { error: "column_not_ready" };
    }
    return { error: "update_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "tenant_owner_sms_prefs_updated",
      entity_type: "tenant",
      entity_id: session.tenant.id,
      metadata: {
        has_phone: phone !== null,
        daily_briefing_enabled: enabled,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/settings");
  return { ok: true };
}
