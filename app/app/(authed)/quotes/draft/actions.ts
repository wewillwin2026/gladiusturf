"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  emailDispatcherMode,
  sendEmailToCustomer,
} from "@/lib/messaging/email";
import { quoteShareTemplate } from "@/lib/messaging/templates";
import { validateBomWrite } from "@/lib/schema/bom";

export type DraftQuoteInput = {
  customerId: string;
  title: string;
  totalDollars: number;
  language: "en" | "es";
  notes: string | null;
  items?:
    | { description: string; qty: number; unitPriceCents: number }[]
    | null;
  /** When true, the proposal is marked as a test (bom.is_test=true) and
   * excluded from /app/quotes KPIs. Used by tenants to test the flow
   * with their own phone/email without polluting analytics. */
  isTest?: boolean;
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

  const cleanedItems = (input.items ?? [])
    .map((it) => ({
      description: (it.description ?? "").toString().slice(0, 200).trim(),
      qty: Number.isFinite(it.qty) ? Number(it.qty) : 0,
      unit_price_cents: Number.isFinite(it.unitPriceCents)
        ? Math.max(0, Math.round(Number(it.unitPriceCents)))
        : 0,
    }))
    .filter((it) => it.description.length > 0 && it.qty > 0);

  // When items are present, derive total_cents from them so customer-
  // facing math stays self-consistent. Manual total still wins when no
  // items.
  const totalFromItems = cleanedItems.reduce(
    (s, it) => s + Math.round(it.qty * it.unit_price_cents),
    0,
  );
  const finalTotal =
    cleanedItems.length > 0
      ? totalFromItems
      : total;

  // Validate the bom shape at the boundary so a typo / column rename /
  // bad upstream input crashes here instead of on the public page.
  let bom: Record<string, unknown>;
  try {
    bom = validateBomWrite({
      title,
      notes: input.notes?.trim() || null,
      ...(cleanedItems.length > 0 ? { items: cleanedItems } : {}),
      ...(input.isTest ? { is_test: true } : {}),
    });
  } catch (err) {
    console.warn("createDraftQuote bom validation failed", err);
    return { error: "invalid_bom" };
  }

  const { data, error } = await sb
    .from("proposals")
    .insert({
      tenant_id: session.tenant.id,
      customer_id: input.customerId,
      vertical: session.tenant.vertical,
      status: "draft",
      total_cents: finalTotal,
      language: input.language,
      ai_drafted: false,
      bom,
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
        total_cents: finalTotal,
        line_items_count: cleanedItems.length,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/quotes");
  revalidatePath(`/app/customers/${input.customerId}`);
  return { ok: true, proposalId: data.id as string };
}

/**
 * Mark a draft quote as 'sent' so the public /quote/[id] view becomes
 * shareable. The tenant has just delivered the link to the customer
 * (SMS / email / in-person walkthrough). v2 wires Resend + Twilio
 * behind canSend() and sends automatically; v1 just flips the status.
 */
export async function markQuoteSent(
  proposalId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };
  if (!proposalId) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("proposals")
    .update({ status: "sent", sent_at: now, updated_at: now })
    .eq("id", proposalId)
    .eq("tenant_id", session.tenant.id)
    .select("id, customer_id")
    .maybeSingle();
  if (error || !data) {
    console.warn("markQuoteSent error", error);
    return { error: "update_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "proposal_sent",
      entity_type: "proposal",
      entity_id: proposalId,
      metadata: { customer_id: (data as { customer_id: string | null }).customer_id },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/quotes");
  return { ok: true };
}

export type EmailQuoteResult =
  | {
      ok: true;
      mode: "live" | "dry_run";
      delivery: "sent" | "dry_run" | "skipped";
      reason?: string;
    }
  | { error: string };

/**
 * Email the public /quote/[id] link to the customer via Resend, behind
 * the canSend() consent gate. Best-effort — when consent is missing, no
 * email is on file, or RESEND_API_KEY is not set, the action returns
 * cleanly so the caller can fall back to clipboard-copy. The audit log
 * always reflects the actual outcome.
 */
export async function emailQuoteToCustomer(
  proposalId: string,
): Promise<EmailQuoteResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };
  if (!proposalId) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { data: proposal, error } = await sb
    .from("proposals")
    .select(
      "id, customer_id, status, total_cents, language, bom, customers!inner(display_name, primary_email)",
    )
    .eq("id", proposalId)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (error || !proposal) return { error: "not_found" };

  const row = proposal as unknown as {
    id: string;
    customer_id: string;
    status: string;
    total_cents: number | null;
    language: string;
    bom: { title?: string; notes?: string | null } | null;
    customers:
      | { display_name: string; primary_email: string | null }
      | { display_name: string; primary_email: string | null }[];
  };
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  if (row.status === "draft" || row.status === "lost") {
    return { error: "not_shareable" };
  }
  if (!row.customer_id || !customer?.primary_email) {
    return {
      ok: true,
      mode: emailDispatcherMode(),
      delivery: "skipped",
      reason: "no_email_on_file",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";
  const link = `${baseUrl}/quote/${row.id}`;
  const tenantName = session.tenant.display_name ?? "GladiusTurf";
  const quoteTitle = row.bom?.title ?? "Your quote";

  // Centralized bilingual template (lib/messaging/templates.ts). Switching
  // a customer's preferred_language from "en" → "es" instantly retargets
  // this and every other transactional send.
  const tpl = quoteShareTemplate({
    locale: row.language,
    customerName: customer.display_name,
    tenantName,
    link,
    quoteTitle,
  });

  // Quote-share is a transactional message: the customer asked for a
  // quote (offline) and the tenant is fulfilling that request. Under
  // CAN-SPAM and standard ESP transactional definitions, an outstanding
  // commercial relationship + a one-shot reply is exempt from the
  // marketing-consent gate. The dispatcher still writes the audit row
  // with source='quote-share' so the funnel shows the bypass explicitly.
  const result = await sendEmailToCustomer({
    tenantId: session.tenant.id,
    customerId: row.customer_id,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    source: "quote-share",
    skipConsentGate: true,
  });

  if (!result.ok) {
    return {
      ok: true,
      mode: emailDispatcherMode(),
      delivery: "skipped",
      reason: result.reason,
    };
  }
  return {
    ok: true,
    mode: emailDispatcherMode(),
    delivery: result.mode,
  };
}
