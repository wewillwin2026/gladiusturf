import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import { canSend, type Channel } from "./consent";

/**
 * Outbound-email dispatcher — parallel to lib/messaging/dispatch.ts (SMS).
 *
 * Every email the platform sends to a customer goes through this single
 * choke-point so the canSend() gate is impossible to skip. Behavior
 * mirrors the SMS dispatcher exactly:
 *
 *   sendEmailToCustomer({ tenantId, customerId, subject, html, ... })
 *     -> canSend()    (consent + quiet hours + blocked weekday)
 *     -> email lookup
 *     -> Resend.send  (if RESEND_API_KEY)
 *        OR dry-run preview if env not set
 *     -> audit_log entry on every path
 *
 * Audit actions:
 *   email.sent     — Resend accepted, email_id recorded
 *   email.dry_run  — preview only, no env
 *   email.blocked  — canSend rejected
 *   email.failed   — recipient missing, Resend error, network exception
 *
 * Default From: founders@gladiusturf.com (overridable via fromEmail).
 * Once tenants verify their own sending domain, From flips to their
 * domain at the dispatcher layer — every send path benefits, no
 * caller change.
 */

export type EmailRequest = {
  tenantId: string;
  customerId: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  /** Free-form context for the audit log (e.g. "quote-share", "review-ask"). */
  source?: string;
  /** Skip the canSend gate. Reserved for transactional opt-in confirms only. */
  skipConsentGate?: boolean;
};

export type EmailResult =
  | { ok: true; mode: "sent"; emailId: string }
  | { ok: true; mode: "dry_run"; preview: string }
  | { ok: false; reason: string; detail?: string };

function resendCreds() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "GladiusTurf <founders@gladiusturf.com>";
  if (!apiKey) return null;
  return { apiKey, from };
}

function subjectExcerpt(s: string): string {
  return s.length > 200 ? `${s.slice(0, 197)}…` : s;
}

async function logAudit(args: {
  tenantId: string;
  action: string;
  customerId: string;
  metadata: Record<string, unknown>;
}): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from("audit_log").insert({
    tenant_id: args.tenantId,
    user_id: null,
    action: args.action,
    entity_type: "customer",
    entity_id: args.customerId,
    metadata: args.metadata,
  });
}

export async function sendEmailToCustomer(
  req: EmailRequest,
): Promise<EmailResult> {
  const channel: Channel = "email";
  const source = req.source ?? "manual";

  if (!req.skipConsentGate) {
    const decision = await canSend(req.tenantId, req.customerId, channel);
    if (!decision.ok) {
      await logAudit({
        tenantId: req.tenantId,
        action: "email.blocked",
        customerId: req.customerId,
        metadata: {
          channel,
          source,
          reason: decision.reason,
          subject_excerpt: subjectExcerpt(req.subject),
        },
      });
      return { ok: false, reason: decision.reason };
    }
  }

  const sb = supabaseAdmin();
  const { data: customer, error: customerErr } = await sb
    .from("customers")
    .select("primary_email, display_name")
    .eq("tenant_id", req.tenantId)
    .eq("id", req.customerId)
    .maybeSingle();
  if (customerErr || !customer) {
    await logAudit({
      tenantId: req.tenantId,
      action: "email.failed",
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
  if (!customer.primary_email) {
    await logAudit({
      tenantId: req.tenantId,
      action: "email.failed",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        reason: "no_email_on_file",
      },
    });
    return { ok: false, reason: "no_email_on_file" };
  }

  const creds = resendCreds();
  const fromEmail = req.fromEmail ?? creds?.from ?? null;

  if (!creds) {
    await logAudit({
      tenantId: req.tenantId,
      action: "email.dry_run",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        to: customer.primary_email,
        from: fromEmail,
        subject_excerpt: subjectExcerpt(req.subject),
        note: "RESEND_API_KEY not set — preview only.",
      },
    });
    return {
      ok: true,
      mode: "dry_run",
      preview: subjectExcerpt(req.subject),
    };
  }

  try {
    const resend = new Resend(creds.apiKey);
    const result = await resend.emails.send({
      from: req.fromEmail ?? creds.from,
      to: customer.primary_email,
      subject: req.subject,
      html: req.html,
      text: req.text,
    });
    if (result.error) {
      await logAudit({
        tenantId: req.tenantId,
        action: "email.failed",
        customerId: req.customerId,
        metadata: {
          channel,
          source,
          reason: "resend_error",
          detail: result.error.message,
        },
      });
      return {
        ok: false,
        reason: "resend_error",
        detail: result.error.message,
      };
    }
    const emailId = result.data?.id ?? "";
    await logAudit({
      tenantId: req.tenantId,
      action: "email.sent",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        to: customer.primary_email,
        from: req.fromEmail ?? creds.from,
        resend_id: emailId,
        subject_excerpt: subjectExcerpt(req.subject),
      },
    });
    return { ok: true, mode: "sent", emailId };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    await logAudit({
      tenantId: req.tenantId,
      action: "email.failed",
      customerId: req.customerId,
      metadata: {
        channel,
        source,
        reason: "resend_exception",
        detail,
      },
    });
    return { ok: false, reason: "resend_exception", detail };
  }
}

export function emailDispatcherMode(): "live" | "dry_run" {
  return resendCreds() ? "live" : "dry_run";
}

/**
 * Per-credential status for the Settings page. The dispatcher operates
 * in live mode only when api_key + from are both set; partial config
 * silently falls through to dry-run, which the operator should be told
 * about explicitly.
 */
export function resendCredStatus(): {
  api_key: boolean;
  from: boolean;
  mode: "live" | "dry_run";
} {
  const api_key = !!process.env.RESEND_API_KEY;
  const from = !!process.env.RESEND_FROM_EMAIL || api_key; // safe default
  return {
    api_key,
    from,
    mode: api_key && from ? "live" : "dry_run",
  };
}

export type InternalAlertRequest = {
  tenantId: string;
  /** entity_id for the audit row; usually the proposal id. */
  entityId?: string;
  entityType?: string;
  /** Free-form kind label for the audit metadata (e.g. "quote_accepted"). */
  kind: string;
  /** RFC 5322 recipient list. */
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  /** Optional reply-to address (e.g. the customer who triggered the alert). */
  replyTo?: string;
  /** Optional from override; falls back to RESEND_FROM_EMAIL or platform default. */
  fromEmail?: string;
  /** Free-form metadata folded into the audit_log row (e.g. ai_run_id). */
  extraAuditMetadata?: Record<string, unknown>;
};

export type InternalAlertResult =
  | { ok: true; mode: "sent"; emailId: string }
  | { ok: true; mode: "dry_run" }
  | { ok: false; reason: string; detail?: string };

/**
 * Internal-alert dispatcher — used for tenant-team notifications
 * (owner [Sold] alerts, question-asked alerts, etc.) where the
 * recipients are the tenant team, NOT customers, so canSend() does
 * not apply. This still routes through one chokepoint so kill-switch,
 * From-domain flip, and unified audit shape land in one place.
 *
 * Behavior:
 *   - Subject CRLF-stripped + clamped to 200 chars (header injection).
 *   - Always writes audit_log: tenant_alert.{sent,dry_run,failed}.
 *   - Recipient addresses scrubbed to local-part only in audit metadata.
 */
export async function sendInternalAlert(
  req: InternalAlertRequest,
): Promise<InternalAlertResult> {
  const sb = supabaseAdmin();
  const safeSubject = req.subject.replace(/[\r\n]+/g, " ").slice(0, 200);
  const recipientLocalParts = req.recipients.map((e) => {
    const at = e.indexOf("@");
    return at > 0 ? e.slice(0, at) + "@…" : "(invalid)";
  });

  const writeAudit = async (
    action: string,
    extra: Record<string, unknown>,
  ): Promise<void> => {
    await sb.from("audit_log").insert({
      tenant_id: req.tenantId,
      user_id: null,
      action,
      entity_type: req.entityType ?? "proposal",
      entity_id: req.entityId ?? null,
      metadata: {
        kind: req.kind,
        recipient_count: req.recipients.length,
        recipients_redacted: recipientLocalParts,
        subject: safeSubject,
        ...(req.extraAuditMetadata ?? {}),
        ...extra,
      },
    });
  };

  const creds = resendCreds();
  if (!creds) {
    await writeAudit("tenant_alert.dry_run", {
      note: "RESEND_API_KEY not set — alert not sent.",
    });
    return { ok: true, mode: "dry_run" };
  }
  if (req.recipients.length === 0) {
    await writeAudit("tenant_alert.failed", {
      reason: "no_recipients",
    });
    return { ok: false, reason: "no_recipients" };
  }

  try {
    const resend = new Resend(creds.apiKey);
    const result = await resend.emails.send({
      from: req.fromEmail ?? creds.from,
      to: req.recipients,
      replyTo: req.replyTo,
      subject: safeSubject,
      html: req.html,
      text: req.text,
    });
    if (result.error) {
      await writeAudit("tenant_alert.failed", {
        reason: "resend_error",
        // error.message scrubbed of email-shaped fragments to avoid
        // leaking recipient PII back into the audit log.
        detail: scrubEmails(result.error.message).slice(0, 200),
      });
      return {
        ok: false,
        reason: "resend_error",
        detail: result.error.message,
      };
    }
    const emailId = result.data?.id ?? "";
    await writeAudit("tenant_alert.sent", {
      resend_id: emailId,
    });
    return { ok: true, mode: "sent", emailId };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    await writeAudit("tenant_alert.failed", {
      reason: "resend_exception",
      detail: scrubEmails(detail).slice(0, 200),
    });
    return { ok: false, reason: "resend_exception", detail };
  }
}

function scrubEmails(s: string): string {
  return s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "<email-redacted>");
}
