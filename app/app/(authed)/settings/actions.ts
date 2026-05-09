"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSmsToOwner } from "@/lib/messaging/dispatch";
import { buildBriefingForTenant } from "@/lib/briefing/build";
import { pickNextMove } from "@/components/app/OwnersDailyOneLiner";
import { normalizeE164 } from "@/lib/messaging/phone";

type Result = { ok: true } | { error: string };
type PreviewResult =
  | { ok: true; mode: "sent" | "dry_run"; body: string; preview?: string }
  | { error: string };

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
 * Build the same SMS body the daily-briefing cron would send today
 * and dispatch one immediately to the tenant's `owner_phone`. Used
 * from the "Send a test briefing now" button on /app/settings so the
 * owner can confirm the message looks right without waiting for the
 * 7 AM ET cron.
 *
 * Behavior matches the cron exactly: same buildBriefingForTenant,
 * same pickNextMove, same SMS body shape, same sendSmsToOwner path
 * (which dry-runs when TWILIO_* env unset). Audit-logged with
 * source='owner_test_briefing' so test sends are distinguishable
 * from the daily-cron sends in the audit feed.
 */
export async function sendTestBriefingNow(): Promise<PreviewResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const sb = supabaseAdmin();
  let phone: string | null = null;
  try {
    const { data: row } = await sb
      .from("tenants")
      .select("owner_phone")
      .eq("id", session.tenant.id)
      .maybeSingle();
    phone = (row as { owner_phone?: string | null } | null)?.owner_phone ?? null;
  } catch {
    return { error: "column_not_ready" };
  }
  if (!phone) return { error: "no_phone_set" };

  const briefing = await buildBriefingForTenant({
    tenantId: session.tenant.id,
    tenantName: session.tenant.display_name,
  });
  if (!briefing) return { error: "no_briefing_pre_onboarding" };

  const move = pickNextMove(briefing);
  const stats: string[] = [`${briefing.customerCount} cust`];
  if ((briefing.scheduledTodayCount ?? 0) > 0) {
    stats.push(`${briefing.scheduledTodayCount} on route`);
  }
  if (briefing.draftQuotesCount > 0) {
    stats.push(
      `${briefing.draftQuotesCount} draft${briefing.draftQuotesCount === 1 ? "" : "s"}`,
    );
  }
  const trimmedMove =
    move.text.length > 110 ? `${move.text.slice(0, 107)}…` : move.text;
  const body = `Good morning, ${briefing.tenantName}. ${stats.join(" · ")}.\n\nYour one move: ${trimmedMove}\n\nReply STOP to disable.`;

  const result = await sendSmsToOwner({
    tenantId: session.tenant.id,
    toPhone: phone,
    body,
    source: "owner_test_briefing",
    auditAction: "owner_briefing",
  });

  if (!result.ok) {
    return { error: result.reason };
  }
  return result.mode === "sent"
    ? { ok: true, mode: "sent", body }
    : { ok: true, mode: "dry_run", body, preview: result.preview };
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
