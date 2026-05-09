import { supabaseAdmin } from "@/lib/supabase";
import { canSend, type Channel } from "./consent";

/**
 * Outbound-SMS dispatcher.
 *
 * Every SMS the platform sends to a customer goes through this single
 * choke-point. The dispatcher is intentionally one-call-per-message so
 * the canSend() gate is impossible to skip:
 *
 *   sendSmsToCustomer({ tenantId, customerId, body, ... })
 *     -> canSend() (consent + quiet-hours + blocked-day)
 *     -> phone lookup
 *     -> Twilio (if env set) OR dry-run (preview only)
 *     -> audit_log entry on every path (sent / blocked / dry_run / failed)
 *
 * Twilio creds expected at runtime:
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_FROM_NUMBER  (E.164, e.g. +19412050000)
 *
 * If any of those are absent, the dispatcher operates in dry-run mode:
 * the message is *not* sent, but it is fully logged to audit_log with
 * action="message.dry_run" so the operator can see exactly what *would*
 * have gone out. This is what lets the Storm Mode "preview activate"
 * button graduate to a real send the moment Twilio creds land — no
 * code change required.
 */

export type SmsRequest = {
  tenantId: string;
  customerId: string;
  body: string;
  /** Operator who triggered the send. Optional — null = system / cron. */
  userId?: string | null;
  /** Override the From number (otherwise TWILIO_FROM_NUMBER). */
  fromNumber?: string;
  /** Free-form context for the audit log (e.g. "storm-mode", "review-ask"). */
  source?: string;
  /** Skip the canSend gate. Reserved for STOP/HELP confirmations. */
  skipConsentGate?: boolean;
};

export type SmsResult =
  | { ok: true; mode: "sent"; sid: string }
  | { ok: true; mode: "dry_run"; preview: string }
  | { ok: false; reason: string; detail?: string };

const TWILIO_BASE = "https://api.twilio.com/2010-04-01";

function twilioCreds() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return null;
  return { sid, token, from };
}

function bodyExcerpt(body: string): string {
  return body.length > 160 ? `${body.slice(0, 157)}…` : body;
}

async function logAudit(args: {
  tenantId: string;
  userId: string | null;
  action: string;
  customerId: string;
  metadata: Record<string, unknown>;
}): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from("audit_log").insert({
    tenant_id: args.tenantId,
    user_id: args.userId,
    action: args.action,
    entity_type: "customer",
    entity_id: args.customerId,
    metadata: args.metadata,
  });
}

export async function sendSmsToCustomer(req: SmsRequest): Promise<SmsResult> {
  const channel: Channel = "sms";
  const userId = req.userId ?? null;
  const source = req.source ?? "manual";

  // 1. Consent gate (skippable for STOP/HELP confirmations only).
  if (!req.skipConsentGate) {
    const decision = await canSend(req.tenantId, req.customerId, channel);
    if (!decision.ok) {
      await logAudit({
        tenantId: req.tenantId,
        userId,
        action: "message.blocked",
        customerId: req.customerId,
        metadata: {
          channel,
          source,
          reason: decision.reason,
          body_excerpt: bodyExcerpt(req.body),
        },
      });
      return { ok: false, reason: decision.reason };
    }
  }

  // 2. Phone lookup. customers.primary_phone is canonical; verify presence.
  const sb = supabaseAdmin();
  const { data: customer, error: customerErr } = await sb
    .from("customers")
    .select("primary_phone, display_name")
    .eq("tenant_id", req.tenantId)
    .eq("id", req.customerId)
    .maybeSingle();
  if (customerErr || !customer) {
    await logAudit({
      tenantId: req.tenantId,
      userId,
      action: "message.failed",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        reason: "customer_lookup_failed",
        detail: customerErr?.message,
      },
    });
    return { ok: false, reason: "customer_lookup_failed" };
  }
  const phone = customer.primary_phone as string | null;
  if (!phone) {
    await logAudit({
      tenantId: req.tenantId,
      userId,
      action: "message.failed",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        reason: "no_phone_on_file",
      },
    });
    return { ok: false, reason: "no_phone_on_file" };
  }

  // 3. Twilio creds OR dry-run.
  const creds = twilioCreds();
  const fromNumber = req.fromNumber ?? creds?.from ?? null;

  if (!creds) {
    await logAudit({
      tenantId: req.tenantId,
      userId,
      action: "message.dry_run",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        to: phone,
        from: fromNumber,
        body_excerpt: bodyExcerpt(req.body),
        note:
          "TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER not set — preview only.",
      },
    });
    return { ok: true, mode: "dry_run", preview: bodyExcerpt(req.body) };
  }

  // 4. Twilio REST send. We use fetch + Basic auth so there's no SDK to
  // pin, and so the dispatcher works in any runtime (Node + Edge).
  try {
    const url = `${TWILIO_BASE}/Accounts/${creds.sid}/Messages.json`;
    const auth = Buffer.from(`${creds.sid}:${creds.token}`).toString("base64");
    const params = new URLSearchParams({
      From: req.fromNumber ?? creds.from,
      To: phone,
      Body: req.body,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const detail = await res.text();
      await logAudit({
        tenantId: req.tenantId,
        userId,
        action: "message.failed",
        customerId: req.customerId,
        metadata: {
          channel,
          source,
          reason: "twilio_http_error",
          status: res.status,
          detail: detail.slice(0, 500),
        },
      });
      return {
        ok: false,
        reason: "twilio_http_error",
        detail: `${res.status}: ${detail.slice(0, 200)}`,
      };
    }
    const json = (await res.json()) as { sid?: string };
    const sid = json.sid ?? "";
    await logAudit({
      tenantId: req.tenantId,
      userId,
      action: "message.sent",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        to: phone,
        from: req.fromNumber ?? creds.from,
        twilio_sid: sid,
        body_excerpt: bodyExcerpt(req.body),
      },
    });
    return { ok: true, mode: "sent", sid };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    await logAudit({
      tenantId: req.tenantId,
      userId,
      action: "message.failed",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        reason: "twilio_exception",
        detail,
      },
    });
    return { ok: false, reason: "twilio_exception", detail };
  }
}

/**
 * Returns whether the dispatcher is in live-send mode (TWILIO_* env set)
 * or dry-run mode. Used by the UI to set expectations on activate buttons.
 */
export function dispatcherMode(): "live" | "dry_run" {
  return twilioCreds() ? "live" : "dry_run";
}

export type OwnerSmsRequest = {
  tenantId: string;
  /** E.164 phone number for the tenant owner. */
  toPhone: string;
  body: string;
  /** Free-form context for the audit log. */
  source?: string;
  /** When set, used as the audit_log.action key (defaults to message.sent). */
  auditAction?: string;
};

/**
 * Tenant-internal SMS — owner sends to their own number (e.g. the
 * Owner's Daily One-Liner cron). Skips canSend() because the consent
 * regime is for consumer-facing messages; the owner is the sender,
 * not a third party. Audit-logged with entity_type='tenant'.
 */
export async function sendSmsToOwner(req: OwnerSmsRequest): Promise<SmsResult> {
  const source = req.source ?? "owner_sms";
  const action = req.auditAction ?? "owner_briefing";
  const sb = supabaseAdmin();

  const baseAudit = {
    tenant_id: req.tenantId,
    user_id: null as string | null,
    entity_type: "tenant" as const,
    entity_id: req.tenantId,
  };

  // E.164 sanity check — block obviously-wrong inputs before paying
  // a Twilio round-trip.
  if (!/^\+[1-9][0-9]{6,14}$/.test(req.toPhone)) {
    await sb.from("audit_log").insert({
      ...baseAudit,
      action: `${action}.failed`,
      metadata: {
        channel: "sms",
        source,
        reason: "invalid_phone_format",
      },
    });
    return { ok: false, reason: "invalid_phone_format" };
  }

  const creds = twilioCreds();
  if (!creds) {
    await sb.from("audit_log").insert({
      ...baseAudit,
      action: `${action}.dry_run`,
      metadata: {
        channel: "sms",
        source,
        to: req.toPhone,
        body_excerpt: bodyExcerpt(req.body),
        note: "TWILIO creds not set — preview only.",
      },
    });
    return { ok: true, mode: "dry_run", preview: bodyExcerpt(req.body) };
  }

  try {
    const url = `${TWILIO_BASE}/Accounts/${creds.sid}/Messages.json`;
    const auth = Buffer.from(`${creds.sid}:${creds.token}`).toString("base64");
    const params = new URLSearchParams({
      From: creds.from,
      To: req.toPhone,
      Body: req.body,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const detail = await res.text();
      await sb.from("audit_log").insert({
        ...baseAudit,
        action: `${action}.failed`,
        metadata: {
          channel: "sms",
          source,
          reason: "twilio_http_error",
          status: res.status,
          detail: detail.slice(0, 500),
        },
      });
      return {
        ok: false,
        reason: "twilio_http_error",
        detail: `${res.status}: ${detail.slice(0, 200)}`,
      };
    }
    const json = (await res.json()) as { sid?: string };
    const sid = json.sid ?? "";
    await sb.from("audit_log").insert({
      ...baseAudit,
      action: `${action}.sent`,
      metadata: {
        channel: "sms",
        source,
        to: req.toPhone,
        from: creds.from,
        twilio_sid: sid,
        body_excerpt: bodyExcerpt(req.body),
      },
    });
    return { ok: true, mode: "sent", sid };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    await sb.from("audit_log").insert({
      ...baseAudit,
      action: `${action}.failed`,
      metadata: {
        channel: "sms",
        source,
        reason: "twilio_exception",
        detail,
      },
    });
    return { ok: false, reason: "twilio_exception", detail };
  }
}

/**
 * Per-credential SMS dispatcher status for the Settings page. Three
 * env vars are required for live mode; partial config silently falls
 * to dry-run. Surface the per-cred booleans so the operator knows
 * exactly what's missing.
 */
export function twilioCredStatus(): {
  sid: boolean;
  token: boolean;
  from: boolean;
  mode: "live" | "dry_run";
} {
  const sid = !!process.env.TWILIO_ACCOUNT_SID;
  const token = !!process.env.TWILIO_AUTH_TOKEN;
  const from = !!process.env.TWILIO_FROM_NUMBER;
  return { sid, token, from, mode: sid && token && from ? "live" : "dry_run" };
}
