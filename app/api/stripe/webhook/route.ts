import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getStripe,
  getStripeWebhookSecret,
} from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook — Stripe event sink for the deals pipeline.
 *
 * Hardening:
 *   1. Verify signature against STRIPE_WEBHOOK_SECRET. Reject anything
 *      else outright (Stripe spoofing protection).
 *   2. Idempotence dedupe — INSERT into stripe_events keyed by event.id
 *      BEFORE side effects. If row already exists, return 200 immediately.
 *      Stripe replays events on retry; without dedupe we'd advance state
 *      twice.
 *   3. Never log card metadata. Only event.id, event.type, deal.id.
 *
 * Events handled (Phase 1):
 *   invoice.payment_succeeded   → deal.paid (Subscription's first invoice)
 *   payment_intent.succeeded    → deal.paid (fallback if first event misses)
 *   payment_intent.payment_failed → audit-only (deal stays paying for retry)
 *   customer.subscription.deleted → deal.voided (manual Stripe cancellation)
 */

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    console.error("[stripe/webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // Read RAW body for signature verification — do NOT JSON-parse.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.warn(
      "[stripe/webhook] signature verify failed",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Dedupe with retry support: insert with processed=false. On duplicate,
  // check if already processed — if yes, return 200. If no, re-run handler
  // (previous attempt failed). After handler success, mark processed=true.
  {
    const { error: dupErr } = await sb
      .from("stripe_events")
      .insert({ id: event.id, type: event.type, deal_id: null, processed: false });
    if (dupErr) {
      const msg = (dupErr.message ?? "").toLowerCase();
      const isDup =
        msg.includes("duplicate") ||
        msg.includes("unique") ||
        (dupErr as { code?: string }).code === "23505";
      if (isDup) {
        const { data: existing } = await sb
          .from("stripe_events")
          .select("processed")
          .eq("id", event.id)
          .maybeSingle();
        if ((existing as { processed?: boolean })?.processed) {
          return NextResponse.json({ ok: true, deduped: true });
        }
        // Not yet processed — fall through to re-run handler.
      } else {
        console.warn("[stripe/webhook] dedupe insert error", dupErr);
      }
    }
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        await handleInvoicePaymentSucceeded(event, sb);
        break;
      }
      case "payment_intent.succeeded": {
        await handlePaymentIntentSucceeded(event, sb);
        break;
      }
      case "payment_intent.payment_failed": {
        await handlePaymentIntentFailed(event, sb);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event, sb);
        break;
      }
      default: {
        break;
      }
    }
  } catch (err) {
    console.error(
      "[stripe/webhook] handler error",
      event.type,
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  await sb
    .from("stripe_events")
    .update({ processed: true })
    .eq("id", event.id);

  return NextResponse.json({ ok: true });
}

type SbClient = ReturnType<typeof supabaseAdmin>;

async function handleInvoicePaymentSucceeded(
  event: Stripe.Event,
  sb: SbClient,
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  if (!subscriptionId) return;

  // Lookup deal by subscription id.
  const { data: deal } = await sb
    .from("deals")
    .select("id, status, prospect_email")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (!deal) return;

  type Deal = { id: string; status: string; prospect_email: string };
  const d = deal as Deal;

  // Skip if already paid or further. Idempotent guard.
  if (d.status === "paid" || d.status === "signed" || d.status === "active") {
    return;
  }

  await sb
    .from("deals")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", d.id);

  await sb.from("deal_events").insert({
    deal_id: d.id,
    from_state: d.status,
    to_state: "paid",
    actor: "stripe",
    metadata: {
      event_id: event.id,
      event_type: event.type,
      invoice_id: invoice.id,
      amount_paid_cents: invoice.amount_paid,
    },
  });

  await sb
    .from("stripe_events")
    .update({ deal_id: d.id })
    .eq("id", event.id);
}

async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  sb: SbClient,
): Promise<void> {
  const pi = event.data.object as Stripe.PaymentIntent;
  const { data: deal } = await sb
    .from("deals")
    .select("id, status")
    .eq("stripe_payment_intent_id", pi.id)
    .maybeSingle();
  if (!deal) return;
  type Deal = { id: string; status: string };
  const d = deal as Deal;
  if (d.status === "paid" || d.status === "signed" || d.status === "active") {
    return;
  }

  await sb
    .from("deals")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", d.id);
  await sb.from("deal_events").insert({
    deal_id: d.id,
    from_state: d.status,
    to_state: "paid",
    actor: "stripe",
    metadata: {
      event_id: event.id,
      event_type: event.type,
      payment_intent_id: pi.id,
      amount_cents: pi.amount,
    },
  });
  await sb
    .from("stripe_events")
    .update({ deal_id: d.id })
    .eq("id", event.id);
}

async function handlePaymentIntentFailed(
  event: Stripe.Event,
  sb: SbClient,
): Promise<void> {
  const pi = event.data.object as Stripe.PaymentIntent;
  const { data: deal } = await sb
    .from("deals")
    .select("id")
    .eq("stripe_payment_intent_id", pi.id)
    .maybeSingle();
  if (!deal) return;
  // Don't flip state — prospect can retry. Just audit.
  await sb.from("deal_events").insert({
    deal_id: (deal as { id: string }).id,
    from_state: "paying",
    to_state: "paying",
    actor: "stripe",
    metadata: {
      event_id: event.id,
      event_type: event.type,
      payment_intent_id: pi.id,
      last_error: pi.last_payment_error?.message ?? null,
      decline_code: pi.last_payment_error?.decline_code ?? null,
    },
  });
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  sb: SbClient,
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const { data: deal } = await sb
    .from("deals")
    .select("id, status")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (!deal) return;
  type Deal = { id: string; status: string };
  const d = deal as Deal;
  // Only auto-void for not-yet-paid deals. After payment, manual review.
  if (d.status === "paid" || d.status === "signed" || d.status === "active") {
    await sb.from("deal_events").insert({
      deal_id: d.id,
      from_state: d.status,
      to_state: d.status,
      actor: "stripe",
      metadata: {
        event_id: event.id,
        event_type: event.type,
        note: "subscription_deleted_post_payment_manual_review_required",
      },
    });
    return;
  }
  await sb
    .from("deals")
    .update({ status: "voided" })
    .eq("id", d.id);
  await sb.from("deal_events").insert({
    deal_id: d.id,
    from_state: d.status,
    to_state: "voided",
    actor: "stripe",
    metadata: { event_id: event.id, event_type: event.type },
  });
}
