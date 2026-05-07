"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInternalAlert } from "@/lib/messaging/email";
import { parseUaClass } from "@/lib/messaging/ua";
import { consume, ipKey } from "@/lib/rate-limit/token-bucket";
import { log } from "@/lib/obs/log";
import { suggestRepliesForQuestion } from "@/lib/ai/suggest-reply";

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

async function rateLimitForCustomerAction(
  scope: string,
): Promise<{ allowed: boolean; key: string }> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-vercel-forwarded-for") ?? hdrs.get("x-forwarded-for") ?? null;
  const key = `${scope}:${ipKey(ip)}`;
  // 5 actions per minute per /24. Plenty of headroom for a real
  // customer; tight enough to stop a forwarded-link auto-clicker.
  const decision = consume(key, { capacity: 5, refillPerSec: 1 / 12 });
  return { allowed: decision.allowed, key };
}

export async function acceptQuote(
  proposalId: string,
): Promise<QuoteAcceptResult> {
  if (!proposalId) return { error: "missing_id" };
  const limit = await rateLimitForCustomerAction("accept");
  if (!limit.allowed) return { error: "rate_limited" };
  const sb = supabaseAdmin();

  const { data: existing, error: lookupErr } = await sb
    .from("proposals")
    .select(
      "id, tenant_id, customer_id, status, total_cents, bom, customers!inner(display_name), tenants!inner(display_name, slug)",
    )
    .eq("id", proposalId)
    .maybeSingle();
  if (lookupErr || !existing) return { error: "not_found" };
  type AcceptRow = {
    id: string;
    tenant_id: string;
    customer_id: string;
    status: string;
    total_cents: number | null;
    bom: { title?: string } | null;
    customers: { display_name: string } | { display_name: string }[];
    tenants:
      | { display_name: string; slug: string }
      | { display_name: string; slug: string }[];
  };
  const ex = existing as unknown as AcceptRow;

  // Drafts and lost proposals are not customer-actionable.
  if (ex.status === "draft" || ex.status === "lost") {
    return { error: "not_actionable" };
  }

  // Reconcile-rather-than-short-circuit. If a previous accept failed
  // partway (status flipped but schedule never landed, or audit write
  // dropped), a retry would silently never fix it. So: only skip the
  // status flip + audit + alert when we already have a schedule_item
  // for this proposal. The schedule create is itself idempotent below.
  const isAlreadySold = ex.status === "sold" || ex.status === "installed";

  const nowIso = new Date().toISOString();
  if (!isAlreadySold) {
    const { error: updateErr } = await sb
      .from("proposals")
      .update({ status: "sold", sold_at: nowIso, updated_at: nowIso })
      .eq("id", proposalId);
    if (updateErr) return { error: "update_failed" };
  }

  try {
    const hdrs = await headers();
    const rawUa = hdrs.get("user-agent");
    if (!isAlreadySold) {
      await sb.from("audit_log").insert({
        tenant_id: ex.tenant_id,
        user_id: null,
        action: "quote.accepted",
        entity_type: "proposal",
        entity_id: proposalId,
        metadata: {
          customer_id: ex.customer_id,
          source: "public_link",
          ua_class: parseUaClass(rawUa),
          total_cents: ex.total_cents,
        },
      });
    }
  } catch (err) {
    log.warn("quote.accepted audit failed", {
      surface: "quote.accept",
      kind: "audit_write_failed",
      tenantId: ex.tenant_id,
      customerId: ex.customer_id,
      proposalId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Auto-create an install schedule_item — idempotent. Always run, even
  // on the already-sold path, so a previously partial accept can self-
  // heal on retry.
  try {
    await createInstallSlotForAcceptedQuote({
      tenantId: ex.tenant_id,
      customerId: ex.customer_id,
      proposalId,
      title: ex.bom?.title ?? "Install",
    });
  } catch (err) {
    log.warn("install slot auto-create failed", {
      surface: "quote.accept",
      kind: "schedule_create_failed",
      tenantId: ex.tenant_id,
      proposalId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Already-sold path stops here — no duplicate alert.
  if (isAlreadySold) {
    revalidatePath("/app/quotes");
    revalidatePath(`/quote/${proposalId}`);
    return { ok: true };
  }

  // Notify the tenant's owner(s) via Resend. This is the single
  // most-important alert in the platform — when a customer accepts,
  // the tenant's phone needs to buzz. Best-effort: a Resend failure
  // never breaks the customer's confirmation.
  try {
    await notifyTenantOfAcceptance({
      tenantId: ex.tenant_id,
      proposalId,
      customerName: (Array.isArray(ex.customers) ? ex.customers[0] : ex.customers)
        ?.display_name ?? "Customer",
      tenantName: (Array.isArray(ex.tenants) ? ex.tenants[0] : ex.tenants)
        ?.display_name ?? "your team",
      title: ex.bom?.title ?? "Quote",
      totalCents: ex.total_cents,
    });
  } catch (err) {
    log.warn("owner alert failed", {
      surface: "quote.accept",
      kind: "owner_alert_failed",
      tenantId: ex.tenant_id,
      proposalId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  revalidatePath("/app/quotes");
  revalidatePath(`/quote/${proposalId}`);
  return { ok: true };
}

export type QuoteQuestionResult = { ok: true } | { error: string };

/**
 * Customer-side "ask a question" form. Records the question on the
 * proposal (bom.questions array) + audit_log + notifies the tenant
 * owner(s)/admin(s) via Resend so the tenant can reply directly.
 *
 * Length-capped to 2000 chars to prevent abuse. Empty messages
 * rejected. Like acceptQuote, no auth — UUID is the gate.
 */
export async function askQuestionAboutQuote(
  proposalId: string,
  message: string,
): Promise<QuoteQuestionResult> {
  if (!proposalId) return { error: "missing_id" };
  const trimmed = (message ?? "").trim();
  if (!trimmed) return { error: "empty_message" };
  if (trimmed.length > 2000) return { error: "message_too_long" };
  const limit = await rateLimitForCustomerAction("question");
  if (!limit.allowed) return { error: "rate_limited" };

  const sb = supabaseAdmin();
  const { data: existing, error: lookupErr } = await sb
    .from("proposals")
    .select(
      "id, tenant_id, customer_id, status, bom, customers!inner(display_name, primary_email), tenants!inner(display_name)",
    )
    .eq("id", proposalId)
    .maybeSingle();
  if (lookupErr || !existing) return { error: "not_found" };
  type AskRow = {
    id: string;
    tenant_id: string;
    customer_id: string;
    status: string;
    bom: { title?: string; questions?: Array<{ at: string; text: string }> } | null;
    customers:
      | { display_name: string; primary_email: string | null }
      | { display_name: string; primary_email: string | null }[];
    tenants: { display_name: string } | { display_name: string }[];
  };
  const ex = existing as unknown as AskRow;
  if (ex.status === "draft" || ex.status === "lost") {
    return { error: "not_actionable" };
  }

  // DoS guard: cap bom.questions[] at 50 entries so a leaked UUID can't
  // balloon the JSONB row.
  const existingQuestions = ex.bom?.questions ?? [];
  if (existingQuestions.length >= 50) {
    return { error: "too_many_questions" };
  }

  const customer = Array.isArray(ex.customers) ? ex.customers[0] : ex.customers;
  const tenant = Array.isArray(ex.tenants) ? ex.tenants[0] : ex.tenants;
  const nowIso = new Date().toISOString();
  const updatedQuestions = [
    ...existingQuestions,
    { at: nowIso, text: trimmed },
  ];
  const updatedBom = { ...(ex.bom ?? {}), questions: updatedQuestions };

  const { error: updateErr } = await sb
    .from("proposals")
    .update({ bom: updatedBom, updated_at: nowIso })
    .eq("id", proposalId);
  if (updateErr) return { error: "update_failed" };

  try {
    await sb.from("audit_log").insert({
      tenant_id: ex.tenant_id,
      user_id: null,
      action: "quote.question_asked",
      entity_type: "proposal",
      entity_id: proposalId,
      metadata: {
        customer_id: ex.customer_id,
        message_excerpt: trimmed.slice(0, 200),
        message_length: trimmed.length,
      },
    });
  } catch (err) {
    log.warn("question audit write failed", {
      surface: "quote.question",
      kind: "audit_write_failed",
      tenantId: ex.tenant_id,
      proposalId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Notify tenant owners/admins via the dispatcher.
  try {
    const { data: invites } = await sb
      .from("tenant_invitations")
      .select("email")
      .eq("tenant_id", ex.tenant_id)
      .eq("status", "active")
      .in("role", ["owner", "admin"]);
    const recipients = ((invites ?? []) as { email: string }[])
      .map((r) => r.email)
      .filter((e) => !!e);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";
    const title = ex.bom?.title ?? "Quote";
    const customerName = customer?.display_name ?? "Customer";
    const tenantName = tenant?.display_name ?? "your team";
    const replyTo = customer?.primary_email ?? undefined;
    const customerLanguage: "en" | "es" = "en"; // TODO: derive from customer.language when populated
    const safeCustomerName = escapeHtml(customerName);
    const safeTenantName = escapeHtml(tenantName);
    const safeTitle = escapeHtml(title);
    const safeReplyTo = replyTo ? escapeHtml(replyTo) : null;
    const subject = `[Question] ${customerName} on "${title}"`;

    // AI reply suggestions — best-effort. Tenant reads, not customer-
    // facing, so the blast radius is one human approval away from
    // leaving the platform. ai_run_id is folded into the alert audit
    // row via extraAuditMetadata so the chain proves which run wrote
    // the suggestions.
    const suggestions = await suggestRepliesForQuestion({
      tenantId: ex.tenant_id,
      proposalId,
      proposalTitle: title,
      customerName,
      tenantName,
      customerLanguage,
      questionText: trimmed,
    });
    const suggestionsBlock = suggestions?.variants.length
      ? `
        <div style="margin-top:24px;padding:16px;background:#0f1715;border-left:3px solid #00d26a;border-radius:6px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#00d26a;margin-bottom:10px;">AI suggested replies (you approve before sending)</div>
          ${suggestions.variants
            .map(
              (v, i) => `
            <div style="font-size:13px;line-height:1.55;color:#f5f5f5;padding:8px 0;${
              i < suggestions.variants.length - 1
                ? "border-bottom:1px solid #1a2724;"
                : ""
            }">
              <span style="display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:#888;margin-right:8px;">${i + 1}.</span>
              ${escapeHtml(v)}
            </div>`,
            )
            .join("")}
          <p style="font-size:10px;color:#666;margin:10px 0 0;">Drafted by Claude Sonnet · receipt: <a href="${baseUrl}/receipt/${suggestions.aiRunId ?? ""}" style="color:#00d26a;">/receipt/${(suggestions.aiRunId ?? "").slice(0, 8)}</a></p>
        </div>`
      : "";
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px 24px;max-width:560px;margin:0 auto;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">${safeTenantName}</div>
        <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin:6px 0 24px;">A customer asked a question.</h1>
        <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">From</p>
        <p style="font-size:16px;line-height:1.4;margin:0 0 20px;font-weight:600;">${safeCustomerName}${safeReplyTo ? ` &lt;${safeReplyTo}&gt;` : ""}</p>
        <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">On quote</p>
        <p style="font-size:16px;line-height:1.4;margin:0 0 20px;">${safeTitle}</p>
        <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Message</p>
        <blockquote style="border-left:3px solid #00d26a;padding:8px 0 8px 14px;margin:0 0 24px;font-size:14px;line-height:1.55;color:#f5f5f5;white-space:pre-wrap;">${escapeHtml(trimmed)}</blockquote>
        ${suggestionsBlock}
        <p style="margin:32px 0;">
          <a href="${baseUrl}/app/quotes" style="display:inline-block;padding:12px 20px;background:#00d26a;color:#0a0a0a;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Open the quote</a>
        </p>
        ${replyTo ? `<p style="font-size:12px;line-height:1.55;color:#888;margin:24px 0 0;">Reply to this email — the customer's address is on Reply-To.</p>` : ""}
      </div>
    `;
    const text = `[Question] ${customerName} on "${title}"\n\n${trimmed}\n\nOpen quote: ${baseUrl}/app/quotes`;

    await sendInternalAlert({
      tenantId: ex.tenant_id,
      entityId: proposalId,
      kind: "quote_question",
      recipients,
      subject,
      html,
      text,
      replyTo,
      extraAuditMetadata: suggestions
        ? {
            ai_run_id: suggestions.aiRunId,
            ai_variants_count: suggestions.variants.length,
          }
        : undefined,
    });
  } catch (err) {
    log.warn("question alert failed", {
      surface: "quote.question",
      kind: "owner_alert_failed",
      tenantId: ex.tenant_id,
      proposalId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  revalidatePath("/app/quotes");
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Returns a Date pointing to 09:00 local time in the given IANA timezone,
 * `daysAhead` days from today (relative to that timezone).
 *
 * The trick: read the current y/m/d in the target zone via
 * Intl.DateTimeFormat, add the offset, format an ISO string with the
 * zone's literal offset for that future date, parse back to UTC. This
 * works correctly across DST transitions because each year's
 * transition is captured by the formatter the day we resolve.
 */
function computeNextLocal9am(tz: string, daysAhead: number): Date {
  const now = new Date();
  const partsNow = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (k: string) =>
    Number.parseInt(partsNow.find((p) => p.type === k)?.value ?? "0", 10);
  const y = get("year");
  const m = get("month");
  const d = get("day");

  // Pick a target wall-clock date in the target zone. Add daysAhead days
  // by using Date arithmetic in UTC then re-extracting y/m/d in tz.
  const utcAnchor = Date.UTC(y, m - 1, d, 12, 0, 0); // noon UTC anchor; safe from DST edges
  const futureUtc = new Date(utcAnchor + daysAhead * 24 * 60 * 60 * 1000);
  const futureParts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(futureUtc);
  const fy = Number.parseInt(
    futureParts.find((p) => p.type === "year")?.value ?? "0",
    10,
  );
  const fm = Number.parseInt(
    futureParts.find((p) => p.type === "month")?.value ?? "0",
    10,
  );
  const fd = Number.parseInt(
    futureParts.find((p) => p.type === "day")?.value ?? "0",
    10,
  );

  // We want 09:00 local on (fy-fm-fd). Iterate to find a UTC ts that,
  // formatted in tz, yields fy/fm/fd hour=09. Two passes converge given
  // DST is at most ±1h.
  let candidate = new Date(Date.UTC(fy, fm - 1, fd, 13, 0, 0)); // start at UTC noon-ish
  for (let i = 0; i < 3; i++) {
    const cp = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
    }).formatToParts(candidate);
    const hour = Number.parseInt(
      cp.find((p) => p.type === "hour")?.value ?? "0",
      10,
    );
    const drift = 9 - hour;
    if (drift === 0) break;
    candidate = new Date(candidate.getTime() + drift * 60 * 60 * 1000);
  }
  return candidate;
}

async function createInstallSlotForAcceptedQuote(args: {
  tenantId: string;
  customerId: string;
  proposalId: string;
  title: string;
}) {
  const sb = supabaseAdmin();
  // Idempotency: prefer the dedicated proposal_id column when the
  // 20260507_g migration has landed (O(1) unique-index check). Fall
  // back to the notes ilike scan when the column is missing so the
  // logic survives the deploy-before-migration gap.
  const byColumn = await sb
    .from("schedule_items")
    .select("id")
    .eq("tenant_id", args.tenantId)
    .eq("proposal_id", args.proposalId)
    .limit(1);
  if (byColumn.error) {
    // Column doesn't exist yet — fall back to legacy notes match.
    const { data: legacy } = await sb
      .from("schedule_items")
      .select("id")
      .eq("tenant_id", args.tenantId)
      .ilike("notes", `%proposal:${args.proposalId}%`)
      .limit(1);
    if (legacy && legacy.length > 0) return;
  } else if (byColumn.data && byColumn.data.length > 0) {
    return;
  }

  // Read tenant's local timezone so 9 AM lands as 9 AM regardless of
  // EST/EDT (or any other zone). Hardcoded UTC offsets break twice a
  // year. Falls back to America/New_York if the settings row is absent.
  const { data: settings } = await sb
    .from("tenant_messaging_settings")
    .select("timezone")
    .eq("tenant_id", args.tenantId)
    .maybeSingle();
  const tz = settings?.timezone || "America/New_York";
  const startsAt = computeNextLocal9am(tz, 7);
  const endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1000);

  // Try to insert with proposal_id when the migration has landed.
  // Some Postgres drivers reject inserts containing unknown columns,
  // so catch and retry without it.
  const insertWithLink = await sb.from("schedule_items").insert({
    tenant_id: args.tenantId,
    customer_id: args.customerId,
    proposal_id: args.proposalId,
    type: "install",
    title: `Install · ${args.title}`,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "scheduled",
    notes: `Auto-scheduled from accepted quote. proposal:${args.proposalId}`,
  });
  if (insertWithLink.error) {
    await sb.from("schedule_items").insert({
      tenant_id: args.tenantId,
      customer_id: args.customerId,
      type: "install",
      title: `Install · ${args.title}`,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "scheduled",
      notes: `Auto-scheduled from accepted quote. proposal:${args.proposalId}`,
    });
  }

  await sb.from("audit_log").insert({
    tenant_id: args.tenantId,
    user_id: null,
    action: "schedule_item.auto_created",
    entity_type: "proposal",
    entity_id: args.proposalId,
    metadata: {
      kind: "install_from_accepted_quote",
      starts_at: startsAt.toISOString(),
      placeholder: true,
    },
  });
}

async function notifyTenantOfAcceptance(args: {
  tenantId: string;
  proposalId: string;
  customerName: string;
  tenantName: string;
  title: string;
  totalCents: number | null;
}) {
  const sb = supabaseAdmin();
  const { data: invites } = await sb
    .from("tenant_invitations")
    .select("email")
    .eq("tenant_id", args.tenantId)
    .eq("status", "active")
    .in("role", ["owner", "admin"]);
  const recipients = ((invites ?? []) as { email: string }[])
    .map((r) => r.email)
    .filter((e) => !!e);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";
  const dollar =
    args.totalCents != null
      ? `$${(args.totalCents / 100).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : "—";
  const safeCustomer = escapeHtml(args.customerName);
  const safeTenant = escapeHtml(args.tenantName);
  const safeTitle = escapeHtml(args.title);
  const subject = `[Sold] ${args.customerName} accepted "${args.title}" — ${dollar}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px 24px;max-width:560px;margin:0 auto;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">${safeTenant}</div>
      <h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.15;margin:6px 0 24px;">A quote just sold.</h1>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Customer</p>
      <p style="font-size:18px;line-height:1.4;margin:0 0 20px;font-weight:600;">${safeCustomer}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Quote</p>
      <p style="font-size:18px;line-height:1.4;margin:0 0 20px;">${safeTitle}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Total</p>
      <p style="font-size:24px;line-height:1.3;margin:0 0 28px;font-weight:600;color:#00d26a;">${dollar}</p>
      <p style="margin:32px 0;">
        <a href="${baseUrl}/app/quotes" style="display:inline-block;padding:12px 20px;background:#00d26a;color:#0a0a0a;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Open the deal</a>
      </p>
      <p style="font-size:12px;line-height:1.55;color:#888;margin:24px 0 0;">A tentative install slot was reserved 7 days out at 9 AM local — confirm or move it before contacting the customer.</p>
      <p style="font-size:11px;line-height:1.55;color:#555;margin:36px 0 0;">Sent from GladiusTurf · proposal <code style="font-family:ui-monospace,Menlo,monospace;">${args.proposalId.slice(0, 8)}</code></p>
    </div>
  `;
  const text = `[Sold] ${args.customerName} accepted "${args.title}" — ${dollar}\n\nOpen the deal: ${baseUrl}/app/quotes\n\nA tentative install slot was reserved 7 days out at 9 AM local. Confirm or move it before contacting the customer.\n\nProposal id: ${args.proposalId}`;

  await sendInternalAlert({
    tenantId: args.tenantId,
    entityId: args.proposalId,
    kind: "quote_accepted",
    recipients,
    subject,
    html,
    text,
  });
}
