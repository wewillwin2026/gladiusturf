"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendSmsToCustomer,
  dispatcherMode,
} from "@/lib/messaging/dispatch";
import {
  sendEmailToCustomer,
  emailDispatcherMode,
} from "@/lib/messaging/email";

/**
 * Maintenance plan campaign launcher — Bright Lights pilot Day-1
 * (2026-05-08), per signed contract §2.1 + Day-90 success benchmark #1.
 *
 * Auth: tenant session required. Demo + unauthenticated rejected.
 * Tenant scoping: every query filters by session.tenant.id — never
 * trust FormData id alone. Audit-logged via campaign_dispatches +
 * audit_log on every send.
 *
 * Channel safety: every per-customer send routes through
 * sendSmsToCustomer / sendEmailToCustomer, which gate on canSend()
 * (consent + quiet hours + blocked weekday) and degrade to dry_run
 * when Twilio/Resend env is missing. Test mode here additionally
 * short-circuits dispatch entirely so the operator can preview the
 * exact recipient list + body without burning a single dispatcher call.
 */

const ALLOWED_TIERS = ["basics", "care", "guardian"] as const;
const ALLOWED_FILTERS = ["all", "no_plan"] as const;
const ALLOWED_CHANNELS = ["sms", "email"] as const;

type Tier = (typeof ALLOWED_TIERS)[number];
type Filter = (typeof ALLOWED_FILTERS)[number];
type Channel = (typeof ALLOWED_CHANNELS)[number];

export type CampaignFormPayload = {
  id?: string;
  title: string;
  bodyEn: string;
  bodyEs: string;
  channels: Channel[];
  targetTier: Tier | null;
  audienceFilter: Filter;
  scheduledFor: string | null;
};

type Result =
  | { ok: true; campaignId?: string }
  | { error: string; detail?: string };

export type CampaignSendResult =
  | {
      ok: true;
      mode: "test" | "live" | "dry_run" | "mixed";
      campaignId: string;
      audienceCount: number;
      attempted: number;
      sentSms: number;
      sentEmail: number;
      dryRunSms: number;
      dryRunEmail: number;
      blocked: number;
      failed: number;
      reasons: Record<string, number>;
      previews: Array<{
        customerId: string;
        displayName: string | null;
        language: "en" | "es";
        channels: Channel[];
        body: string;
        primaryEmail: string | null;
        primaryPhone: string | null;
      }>;
    }
  | { ok: false; error: string; detail?: string };

function nullIfBlank(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function isTier(v: string): v is Tier {
  return (ALLOWED_TIERS as readonly string[]).includes(v);
}
function isFilter(v: string): v is Filter {
  return (ALLOWED_FILTERS as readonly string[]).includes(v);
}
function isChannel(v: string): v is Channel {
  return (ALLOWED_CHANNELS as readonly string[]).includes(v);
}

function readChannels(formData: FormData): Channel[] {
  // Two acceptable encodings: repeated `channel=sms` + `channel=email`
  // entries, OR a single `channels=sms,email` CSV. Normalize to a
  // unique sorted array.
  const set = new Set<Channel>();
  for (const value of formData.getAll("channel")) {
    if (typeof value === "string" && isChannel(value)) set.add(value);
  }
  const csv = formData.get("channels");
  if (typeof csv === "string") {
    for (const part of csv.split(",").map((s) => s.trim())) {
      if (isChannel(part)) set.add(part);
    }
  }
  return [...set].sort();
}

function parsePayload(formData: FormData): CampaignFormPayload | string {
  const title = nullIfBlank(formData.get("title"));
  if (!title) return "title_required";
  if (title.length > 200) return "title_too_long";

  const bodyEn = (formData.get("body_en") ?? "").toString();
  const bodyEs = (formData.get("body_es") ?? "").toString();
  if (!bodyEn.trim() && !bodyEs.trim()) {
    return "body_required";
  }

  const channels = readChannels(formData);
  if (channels.length === 0) return "channel_required";

  const targetTierRaw = nullIfBlank(formData.get("target_tier"));
  let targetTier: Tier | null = null;
  if (targetTierRaw) {
    if (!isTier(targetTierRaw)) return "invalid_tier";
    targetTier = targetTierRaw;
  }

  const audienceFilterRaw = (
    nullIfBlank(formData.get("audience_filter")) ?? "all"
  ).toLowerCase();
  if (!isFilter(audienceFilterRaw)) return "invalid_filter";

  const scheduledForRaw = nullIfBlank(formData.get("scheduled_for"));
  let scheduledFor: string | null = null;
  if (scheduledForRaw) {
    // Accept the ISO-ish value emitted by <input type="datetime-local">,
    // which is YYYY-MM-DDTHH:mm with no timezone. Treat as the operator's
    // local clock and let Postgres reify on insert.
    const parsed = Date.parse(scheduledForRaw);
    if (!Number.isFinite(parsed)) return "invalid_scheduled_for";
    scheduledFor = new Date(parsed).toISOString();
  }

  return {
    id: nullIfBlank(formData.get("id")) ?? undefined,
    title,
    bodyEn,
    bodyEs,
    channels,
    targetTier,
    audienceFilter: audienceFilterRaw,
    scheduledFor,
  };
}

/**
 * Create a draft campaign. Status starts at 'draft' unless a future
 * scheduled_for is provided, in which case it lands at 'scheduled' so
 * the recent-campaigns list shows the right pill. Either way, sending
 * is gated by an explicit operator click on the launcher page.
 */
export async function createCampaign(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const parsed = parsePayload(formData);
  if (typeof parsed === "string") return { error: parsed };

  const sb = supabaseAdmin();
  const status = parsed.scheduledFor ? "scheduled" : "draft";

  const { data, error } = await sb
    .from("campaigns")
    .insert({
      tenant_id: session.tenant.id,
      title: parsed.title,
      body_en: parsed.bodyEn,
      body_es: parsed.bodyEs,
      channel: parsed.channels,
      target_tier: parsed.targetTier,
      audience_filter: parsed.audienceFilter,
      status,
      scheduled_for: parsed.scheduledFor,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("createCampaign insert error", error);
    return { error: "insert_failed", detail: error?.message };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "campaign.created",
      entity_type: "campaign",
      entity_id: data.id as string,
      metadata: {
        title: parsed.title,
        channels: parsed.channels,
        target_tier: parsed.targetTier,
        audience_filter: parsed.audienceFilter,
        scheduled_for: parsed.scheduledFor,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/campaigns");
  return { ok: true, campaignId: data.id as string };
}

/**
 * Update a campaign that hasn't been sent. Tenant-scoped by id +
 * tenant_id. Sent / sending campaigns are immutable to keep the
 * audit trail honest.
 */
export async function updateCampaign(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = nullIfBlank(formData.get("id"));
  if (!id) return { error: "missing_id" };

  const parsed = parsePayload(formData);
  if (typeof parsed === "string") return { error: parsed };

  const sb = supabaseAdmin();
  const { data: existing, error: readErr } = await sb
    .from("campaigns")
    .select("id, status")
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (readErr) {
    console.warn("updateCampaign read error", readErr);
    return { error: "lookup_failed", detail: readErr.message };
  }
  if (!existing) return { error: "not_found_in_tenant" };
  const lockedStatus = (existing as { status: string }).status;
  if (lockedStatus === "sent" || lockedStatus === "sending") {
    return { error: "campaign_locked" };
  }

  const status = parsed.scheduledFor ? "scheduled" : "draft";
  const { error } = await sb
    .from("campaigns")
    .update({
      title: parsed.title,
      body_en: parsed.bodyEn,
      body_es: parsed.bodyEs,
      channel: parsed.channels,
      target_tier: parsed.targetTier,
      audience_filter: parsed.audienceFilter,
      scheduled_for: parsed.scheduledFor,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("updateCampaign update error", error);
    return { error: "update_failed", detail: error.message };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "campaign.updated",
      entity_type: "campaign",
      entity_id: id,
      metadata: {
        title: parsed.title,
        channels: parsed.channels,
        target_tier: parsed.targetTier,
        audience_filter: parsed.audienceFilter,
        scheduled_for: parsed.scheduledFor,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/campaigns");
  return { ok: true, campaignId: id };
}

/**
 * Delete a campaign. Tenant-scoped. Refuses to delete sent / sending
 * campaigns — they're part of the customer-message audit trail and
 * shouldn't disappear from the recent list.
 */
export async function deleteCampaign(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = nullIfBlank(formData.get("id"));
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { data: existing, error: readErr } = await sb
    .from("campaigns")
    .select("status")
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (readErr) {
    return { error: "lookup_failed", detail: readErr.message };
  }
  if (!existing) return { error: "not_found_in_tenant" };
  if (
    (existing as { status: string }).status === "sent" ||
    (existing as { status: string }).status === "sending"
  ) {
    return { error: "campaign_locked" };
  }

  const { error } = await sb
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    return { error: "delete_failed", detail: error.message };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "campaign.deleted",
      entity_type: "campaign",
      entity_id: id,
      metadata: {},
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/campaigns");
  return { ok: true };
}

type CustomerRow = {
  id: string;
  display_name: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  preferred_language: "en" | "es" | null;
};

function firstNameOf(name: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts[0] ?? "";
}

function templateBody(template: string, customer: CustomerRow): string {
  const first = firstNameOf(customer.display_name) || "there";
  return template
    .replace(/\{\{\s*first_name\s*\}\}/g, first)
    .replace(/\{\{\s*display_name\s*\}\}/g, customer.display_name ?? first)
    // install_age is unknown at the universal-customers layer; leave a
    // soft fallback so the template still reads naturally rather than
    // exposing the placeholder.
    .replace(/\{\{\s*install_age\s*\}\}/g, "several");
}

/**
 * Resolve the audience for a campaign — applies the audience filter
 * (all customers vs. customers without an active plan subscription)
 * + the optional target_tier (when set, narrows further to customers
 * who do NOT have an active subscription on that tier slot, so a
 * "Bright Care" upsell campaign skips people already on Care).
 */
async function resolveAudience(
  tenantId: string,
  filter: Filter,
  targetTier: Tier | null,
): Promise<CustomerRow[]> {
  const sb = supabaseAdmin();
  const { data: customers, error } = await sb
    .from("customers")
    .select("id, display_name, primary_email, primary_phone, preferred_language")
    .eq("tenant_id", tenantId)
    .order("display_name", { ascending: true });
  if (error) {
    console.warn("resolveAudience customers error", error);
    return [];
  }
  const all = (customers ?? []) as CustomerRow[];
  if (filter === "all" && !targetTier) return all;

  // Pull active subscriptions once, then filter in memory. Bright
  // Lights starts with ~250 customers — the round-trip cost beats a
  // SQL not-exists for our scale and keeps this server action linear.
  const { data: subs, error: subsErr } = await sb
    .from("plan_subscriptions")
    .select("customer_id, plan_id")
    .eq("tenant_id", tenantId)
    .eq("status", "active");
  if (subsErr) {
    console.warn("resolveAudience subs error", subsErr);
    return all;
  }

  let tierPlanIds = new Set<string>();
  if (targetTier) {
    const { data: tierPlans, error: tierErr } = await sb
      .from("plans")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("tier", targetTier);
    if (!tierErr && tierPlans) {
      tierPlanIds = new Set(tierPlans.map((p) => p.id as string));
    }
  }

  const customersWithAnyPlan = new Set<string>();
  const customersOnTargetTier = new Set<string>();
  for (const s of subs ?? []) {
    customersWithAnyPlan.add(s.customer_id as string);
    if (tierPlanIds.has(s.plan_id as string)) {
      customersOnTargetTier.add(s.customer_id as string);
    }
  }

  return all.filter((c) => {
    if (filter === "no_plan" && customersWithAnyPlan.has(c.id)) return false;
    // When a tier is targeted, we always exclude folks already on that
    // tier — promoting Bright Care to a Care subscriber is wasted touch.
    if (targetTier && customersOnTargetTier.has(c.id)) return false;
    return true;
  });
}

/**
 * Compute the audience preview without sending. Used by the launcher
 * page right rail to show the live recipient count + sample list as
 * the operator twiddles the filters.
 */
export async function previewAudience(
  filter: Filter,
  targetTier: Tier | null,
): Promise<{
  count: number;
  sample: Array<{ id: string; displayName: string; language: "en" | "es" }>;
}> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { count: 0, sample: [] };
  const audience = await resolveAudience(session.tenant.id, filter, targetTier);
  return {
    count: audience.length,
    sample: audience.slice(0, 5).map((c) => ({
      id: c.id,
      displayName: c.display_name ?? "(unnamed)",
      language: c.preferred_language === "es" ? "es" : "en",
    })),
  };
}

/**
 * Send (or test-preview) a campaign. Tenant-scoped. The big one.
 *
 * Behavior:
 *   - test_mode=on → no Twilio/Resend calls. Returns a preview of the
 *     first 25 audience rows + their resolved bodies. Status stays
 *     'draft'. Nothing is recorded in campaign_dispatches.
 *   - test_mode=off → status flips to 'sending' immediately, then
 *     we iterate the audience, dispatching per-channel via the
 *     existing sendSmsToCustomer / sendEmailToCustomer chokepoints
 *     (which gate on canSend() + log audit). One campaign_dispatches
 *     row per (customer, channel). Failures don't reverse already-
 *     dispatched customers — best-effort.
 *   - status becomes 'sent' on completion (even with partial failures —
 *     'failed' is reserved for catastrophic resolve errors).
 */
export async function sendCampaign(
  formData: FormData,
): Promise<CampaignSendResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { ok: false, error: "unauthenticated" };
  }

  const id = nullIfBlank(formData.get("id"));
  if (!id) return { ok: false, error: "missing_id" };
  const testMode = formData.get("test_mode") === "on";

  const sb = supabaseAdmin();
  const { data: campaign, error: readErr } = await sb
    .from("campaigns")
    .select(
      "id, title, body_en, body_es, channel, target_tier, audience_filter, status",
    )
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (readErr) {
    return { ok: false, error: "lookup_failed", detail: readErr.message };
  }
  if (!campaign) return { ok: false, error: "not_found_in_tenant" };
  const c = campaign as {
    id: string;
    title: string;
    body_en: string;
    body_es: string;
    channel: string[] | null;
    target_tier: Tier | null;
    audience_filter: Filter;
    status: string;
  };
  if (c.status === "sending" || c.status === "sent") {
    return { ok: false, error: "campaign_already_sent" };
  }

  const channels = (c.channel ?? []).filter(isChannel);
  if (channels.length === 0) {
    return { ok: false, error: "channel_required" };
  }
  if (!c.body_en.trim() && !c.body_es.trim()) {
    return { ok: false, error: "body_required" };
  }

  const audience = await resolveAudience(
    session.tenant.id,
    c.audience_filter,
    c.target_tier,
  );

  // Test mode — return previews, persist nothing.
  if (testMode) {
    const previews = audience.slice(0, 25).map((cust) => {
      const lang = cust.preferred_language === "es" ? "es" : "en";
      const tmpl =
        lang === "es" && c.body_es.trim()
          ? c.body_es
          : c.body_en.trim()
            ? c.body_en
            : c.body_es;
      return {
        customerId: cust.id,
        displayName: cust.display_name,
        language: lang as "en" | "es",
        channels,
        body: templateBody(tmpl, cust),
        primaryEmail: cust.primary_email,
        primaryPhone: cust.primary_phone,
      };
    });
    try {
      await sb.from("audit_log").insert({
        tenant_id: session.tenant.id,
        user_id: null,
        action: "campaign.test_previewed",
        entity_type: "campaign",
        entity_id: c.id,
        metadata: {
          audience_count: audience.length,
          channels,
          target_tier: c.target_tier,
          audience_filter: c.audience_filter,
        },
      });
    } catch (err) {
      console.warn("audit insert failed (non-fatal)", err);
    }
    return {
      ok: true,
      mode: "test",
      campaignId: c.id,
      audienceCount: audience.length,
      attempted: 0,
      sentSms: 0,
      sentEmail: 0,
      dryRunSms: 0,
      dryRunEmail: 0,
      blocked: 0,
      failed: 0,
      reasons: {},
      previews,
    };
  }

  // Live mode — flip to 'sending' so the UI shows progress + a parallel
  // operator can't accidentally re-trigger.
  const sendingAt = new Date().toISOString();
  await sb
    .from("campaigns")
    .update({ status: "sending", updated_at: sendingAt })
    .eq("id", c.id)
    .eq("tenant_id", session.tenant.id);

  let sentSms = 0;
  let sentEmail = 0;
  let dryRunSms = 0;
  let dryRunEmail = 0;
  let blocked = 0;
  let failed = 0;
  const reasons: Record<string, number> = {};
  const dispatchRows: Array<{
    campaign_id: string;
    tenant_id: string;
    customer_id: string;
    channel: Channel;
    status: "sent" | "dry_run" | "blocked" | "failed";
    error_detail: string | null;
    body_excerpt: string;
  }> = [];

  // Subject for email — we lift the campaign title.
  const subject = c.title;

  for (const cust of audience) {
    const lang = cust.preferred_language === "es" ? "es" : "en";
    const tmpl =
      lang === "es" && c.body_es.trim()
        ? c.body_es
        : c.body_en.trim()
          ? c.body_en
          : c.body_es;
    const body = templateBody(tmpl, cust);
    const bodyExcerpt = body.length > 160 ? `${body.slice(0, 157)}…` : body;

    if (channels.includes("sms")) {
      const res = await sendSmsToCustomer({
        tenantId: session.tenant.id,
        customerId: cust.id,
        body,
        source: "campaign",
      });
      const row = {
        campaign_id: c.id,
        tenant_id: session.tenant.id,
        customer_id: cust.id,
        channel: "sms" as const,
        status: res.ok
          ? res.mode === "sent"
            ? ("sent" as const)
            : ("dry_run" as const)
          : (() => {
              if (
                res.reason === "no_consent" ||
                res.reason === "opted_out" ||
                res.reason === "quiet_hours" ||
                res.reason === "blocked_day"
              ) {
                return "blocked" as const;
              }
              return "failed" as const;
            })(),
        error_detail: res.ok
          ? null
          : `${res.reason}${"detail" in res && res.detail ? `: ${res.detail}` : ""}`,
        body_excerpt: bodyExcerpt,
      };
      dispatchRows.push(row);
      if (res.ok) {
        if (res.mode === "sent") sentSms += 1;
        else dryRunSms += 1;
      } else if (row.status === "blocked") {
        blocked += 1;
        reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
      } else {
        failed += 1;
        reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
      }
    }

    if (channels.includes("email")) {
      const res = await sendEmailToCustomer({
        tenantId: session.tenant.id,
        customerId: cust.id,
        subject,
        html: bodyToHtml(body),
        text: body,
        source: "campaign",
      });
      const row = {
        campaign_id: c.id,
        tenant_id: session.tenant.id,
        customer_id: cust.id,
        channel: "email" as const,
        status: res.ok
          ? res.mode === "sent"
            ? ("sent" as const)
            : ("dry_run" as const)
          : (() => {
              if (
                res.reason === "no_consent" ||
                res.reason === "opted_out" ||
                res.reason === "quiet_hours" ||
                res.reason === "blocked_day"
              ) {
                return "blocked" as const;
              }
              return "failed" as const;
            })(),
        error_detail: res.ok
          ? null
          : `${res.reason}${"detail" in res && res.detail ? `: ${res.detail}` : ""}`,
        body_excerpt: bodyExcerpt,
      };
      dispatchRows.push(row);
      if (res.ok) {
        if (res.mode === "sent") sentEmail += 1;
        else dryRunEmail += 1;
      } else if (row.status === "blocked") {
        blocked += 1;
        reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
      } else {
        failed += 1;
        reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
      }
    }
  }

  // Persist dispatch audit rows in chunks. Insert errors are non-fatal —
  // the per-customer message itself already sent (or didn't); losing the
  // audit row would be worse than soft-logging the failure.
  if (dispatchRows.length > 0) {
    const chunkSize = 200;
    for (let i = 0; i < dispatchRows.length; i += chunkSize) {
      const chunk = dispatchRows.slice(i, i + chunkSize);
      const { error: insertErr } = await sb
        .from("campaign_dispatches")
        .insert(chunk);
      if (insertErr) {
        console.warn("campaign_dispatches insert chunk failed", insertErr);
      }
    }
  }

  const totalSent = sentSms + sentEmail;
  const totalDry = dryRunSms + dryRunEmail;
  const completedAt = new Date().toISOString();
  await sb
    .from("campaigns")
    .update({
      status: "sent",
      sent_at: completedAt,
      sent_count: totalSent + totalDry,
      updated_at: completedAt,
    })
    .eq("id", c.id)
    .eq("tenant_id", session.tenant.id);

  const smsMode = dispatcherMode();
  const emailMode = emailDispatcherMode();
  let mode: "live" | "dry_run" | "mixed" = "live";
  if (smsMode === "dry_run" && emailMode === "dry_run") mode = "dry_run";
  else if (smsMode === "dry_run" || emailMode === "dry_run") mode = "mixed";

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "campaign.sent",
      entity_type: "campaign",
      entity_id: c.id,
      metadata: {
        operator_email: session.email,
        sms_mode: smsMode,
        email_mode: emailMode,
        audience_count: audience.length,
        attempted: dispatchRows.length,
        sent_sms: sentSms,
        sent_email: sentEmail,
        dry_run_sms: dryRunSms,
        dry_run_email: dryRunEmail,
        blocked,
        failed,
        reasons,
        channels,
        target_tier: c.target_tier,
        audience_filter: c.audience_filter,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/campaigns");

  return {
    ok: true,
    mode,
    campaignId: c.id,
    audienceCount: audience.length,
    attempted: dispatchRows.length,
    sentSms,
    sentEmail,
    dryRunSms,
    dryRunEmail,
    blocked,
    failed,
    reasons,
    previews: [],
  };
}

/**
 * Convert plain-text body to a minimal HTML body for the email
 * dispatcher. Wraps in a <p> per double-newline block, escapes the
 * obvious HTML metacharacters, and leaves single-newlines as <br>.
 * Intentionally tiny — we don't want a rich-text dependency on a
 * Day-1 launcher path. Tenants who want fancy HTML can paste it in
 * directly later (the body_en/body_es fields permit it).
 */
function bodyToHtml(body: string): string {
  // If the body already smells like HTML, pass through. This lets a
  // future inline editor stuff <a href> links without us double-encoding.
  if (/<\/?[a-z][^>]*>/i.test(body)) return body;
  const escape = (s: string): string =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const blocks = body.split(/\n{2,}/);
  return blocks
    .map(
      (b) =>
        `<p style="margin:0 0 12px 0; line-height:1.55;">${escape(b).replace(
          /\n/g,
          "<br>",
        )}</p>`,
    )
    .join("");
}
