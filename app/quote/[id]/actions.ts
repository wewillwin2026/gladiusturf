"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Resend } from "resend";
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

  // Drafts and lost proposals are not customer-actionable. Already
  // sold/installed = idempotent no-op (still 200, no extra audit row).
  if (ex.status === "draft" || ex.status === "lost") {
    return { error: "not_actionable" };
  }
  if (ex.status === "sold" || ex.status === "installed") {
    return { ok: true };
  }

  const nowIso = new Date().toISOString();
  const { error: updateErr } = await sb
    .from("proposals")
    .update({ status: "sold", sold_at: nowIso, updated_at: nowIso })
    .eq("id", proposalId);
  if (updateErr) return { error: "update_failed" };

  let userAgent = "";
  try {
    const hdrs = await headers();
    userAgent = (hdrs.get("user-agent") ?? "").slice(0, 200);
    await sb.from("audit_log").insert({
      tenant_id: ex.tenant_id,
      user_id: null,
      action: "quote.accepted",
      entity_type: "proposal",
      entity_id: proposalId,
      metadata: {
        customer_id: ex.customer_id,
        source: "public_link",
        user_agent: userAgent,
        total_cents: ex.total_cents,
      },
    });
  } catch (err) {
    console.warn("quote.accepted audit failed (non-fatal)", err);
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
    console.warn("notifyTenantOfAcceptance failed (non-fatal)", err);
  }

  revalidatePath("/app/quotes");
  revalidatePath(`/quote/${proposalId}`);
  return { ok: true };
}

async function notifyTenantOfAcceptance(args: {
  tenantId: string;
  proposalId: string;
  customerName: string;
  tenantName: string;
  title: string;
  totalCents: number | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dry-run only — log to audit_log so the operator sees the alert
    // would have fired. Once RESEND_API_KEY is set, real email goes out.
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: args.tenantId,
      user_id: null,
      action: "tenant_alert.dry_run",
      entity_type: "proposal",
      entity_id: args.proposalId,
      metadata: {
        kind: "quote_accepted",
        customer_name: args.customerName,
        title: args.title,
        total_cents: args.totalCents,
        note: "RESEND_API_KEY not set — alert not sent.",
      },
    });
    return;
  }

  const sb = supabaseAdmin();
  const { data: invites } = await sb
    .from("tenant_invitations")
    .select("email")
    .eq("tenant_id", args.tenantId)
    .eq("status", "active")
    .in("role", ["owner", "admin"]);
  const emails = ((invites ?? []) as { email: string }[])
    .map((r) => r.email)
    .filter((e) => !!e);
  if (emails.length === 0) return;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "GladiusTurf Alerts <founders@gladiusturf.com>";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";
  const dollar =
    args.totalCents != null
      ? `$${(args.totalCents / 100).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : "—";
  const subject = `[Sold] ${args.customerName} accepted "${args.title}" — ${dollar}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px 24px;max-width:560px;margin:0 auto;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">${args.tenantName}</div>
      <h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.15;margin:6px 0 24px;">A quote just sold.</h1>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Customer</p>
      <p style="font-size:18px;line-height:1.4;margin:0 0 20px;font-weight:600;">${args.customerName}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Quote</p>
      <p style="font-size:18px;line-height:1.4;margin:0 0 20px;">${args.title}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#bbb;">Total</p>
      <p style="font-size:24px;line-height:1.3;margin:0 0 28px;font-weight:600;color:#00d26a;">${dollar}</p>
      <p style="margin:32px 0;">
        <a href="${baseUrl}/app/quotes" style="display:inline-block;padding:12px 20px;background:#00d26a;color:#0a0a0a;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Open the deal</a>
      </p>
      <p style="font-size:11px;line-height:1.55;color:#555;margin:36px 0 0;">Sent from GladiusTurf · proposal <code style="font-family:ui-monospace,Menlo,monospace;">${args.proposalId.slice(0, 8)}</code></p>
    </div>
  `;
  const text = `[Sold] ${args.customerName} accepted "${args.title}" — ${dollar}\n\nOpen the deal: ${baseUrl}/app/quotes\n\nProposal id: ${args.proposalId}`;

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: emails,
      subject,
      html,
      text,
    });
    await sb.from("audit_log").insert({
      tenant_id: args.tenantId,
      user_id: null,
      action: result.error ? "tenant_alert.failed" : "tenant_alert.sent",
      entity_type: "proposal",
      entity_id: args.proposalId,
      metadata: {
        kind: "quote_accepted",
        recipients: emails,
        subject,
        resend_id: result.data?.id ?? null,
        error: result.error?.message ?? null,
      },
    });
  } catch (err) {
    await sb.from("audit_log").insert({
      tenant_id: args.tenantId,
      user_id: null,
      action: "tenant_alert.failed",
      entity_type: "proposal",
      entity_id: args.proposalId,
      metadata: {
        kind: "quote_accepted",
        recipients: emails,
        error: err instanceof Error ? err.message : "unknown",
      },
    });
  }
}
