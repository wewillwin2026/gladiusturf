import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe/server";
import { createBdcAddonPrice, createDealPrice } from "@/lib/stripe/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/close/[token]/payment-intent — kicks off the Stripe flow.
 *
 * Idempotent on the deal row: if a Subscription + PaymentIntent are
 * already attached to the deal, we return the existing client_secret
 * instead of creating a second Subscription. Lets the prospect refresh
 * mid-flow without spawning duplicates.
 *
 * Returns:
 *   { clientSecret, publishableKey }
 *
 * The client component on /close/[token] mounts <PaymentElement> with
 * this client_secret and confirms via Elements. Card data never touches
 * our server — Stripe Elements posts directly to Stripe's domain.
 */

type Tier = "starter" | "growth" | "enterprise";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length !== 16) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 500 },
    );
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("deals")
    .select(
      "id, status, prospect_email, prospect_company, tier, custom_price_cents, addon_bdc, stripe_customer_id, stripe_subscription_id, stripe_payment_intent_id, expires_at",
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "deal_not_found" }, { status: 404 });
  }

  type Deal = {
    id: string;
    status: string;
    prospect_email: string;
    prospect_company: string;
    tier: Tier;
    custom_price_cents: number;
    addon_bdc: boolean;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    stripe_payment_intent_id: string | null;
    expires_at: string;
  };
  const deal = data as Deal;

  if (new Date(deal.expires_at) < new Date()) {
    return NextResponse.json({ error: "deal_expired" }, { status: 410 });
  }

  // Don't allow re-payment after the deal already paid/signed/active.
  if (
    deal.status === "paid" ||
    deal.status === "signed" ||
    deal.status === "active" ||
    deal.status === "voided" ||
    deal.status === "refunded"
  ) {
    return NextResponse.json(
      { error: `deal_${deal.status}` },
      { status: 409 },
    );
  }

  // Idempotent path — Subscription + latest invoice's PI exist already.
  if (
    deal.stripe_subscription_id &&
    deal.stripe_payment_intent_id
  ) {
    try {
      const pi = await stripe.paymentIntents.retrieve(
        deal.stripe_payment_intent_id,
      );
      if (pi.client_secret && pi.status !== "succeeded" && pi.status !== "canceled") {
        return NextResponse.json({
          clientSecret: pi.client_secret,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
      }
    } catch {
      // PI was canceled or removed — fall through and create a fresh
      // Subscription below.
    }
  }

  // 1. Find or create a Stripe Customer for this prospect email.
  let customerId = deal.stripe_customer_id;
  if (!customerId) {
    try {
      const found = await stripe.customers.list({
        email: deal.prospect_email,
        limit: 1,
      });
      if (found.data.length > 0) {
        customerId = found.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: deal.prospect_email,
          name: deal.prospect_company,
          metadata: { deal_id: deal.id, tier: deal.tier },
        });
        customerId = created.id;
      }
    } catch (err) {
      console.error("[close/payment-intent] customer create error", err);
      return NextResponse.json(
        { error: "customer_create_failed" },
        { status: 500 },
      );
    }
  }

  // 2. Create per-deal ad-hoc Prices (custom + optional BDC addon).
  let mainPriceId: string;
  let bdcPriceId: string | null = null;
  try {
    mainPriceId = await createDealPrice({
      unitAmountCents: deal.custom_price_cents,
      tier: deal.tier,
      dealId: deal.id,
    });
    if (deal.addon_bdc) {
      bdcPriceId = await createBdcAddonPrice(deal.id);
    }
  } catch (err) {
    console.error("[close/payment-intent] price create error", err);
    return NextResponse.json(
      { error: "price_create_failed" },
      { status: 500 },
    );
  }

  // 3. Create Subscription with default_incomplete payment behavior.
  // The latest invoice's PaymentIntent gives us the client_secret for
  // Elements to confirm in-page.
  const items: { price: string }[] = [{ price: mainPriceId }];
  if (bdcPriceId) items.push({ price: bdcPriceId });

  let subscription;
  try {
    subscription = await stripe.subscriptions.create({
      customer: customerId,
      items,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: { deal_id: deal.id },
    });
  } catch (err) {
    console.error("[close/payment-intent] subscription create error", err);
    return NextResponse.json(
      { error: "subscription_create_failed" },
      { status: 500 },
    );
  }

  // Pull the PaymentIntent off the latest invoice.
  // Stripe types: latest_invoice can be string|Invoice|null after expansion
  // it's an Invoice. payment_intent on the invoice can be similarly typed.
  const invoice =
    typeof subscription.latest_invoice === "string"
      ? null
      : subscription.latest_invoice;
  const pi =
    invoice && typeof invoice.payment_intent !== "string"
      ? invoice.payment_intent
      : null;

  if (!pi || !pi.client_secret) {
    return NextResponse.json(
      { error: "payment_intent_missing" },
      { status: 500 },
    );
  }

  // 4. Persist Stripe linkage on the deal + flip to paying.
  try {
    await sb
      .from("deals")
      .update({
        status: deal.status === "draft" ? "paying" : "paying",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_payment_intent_id: pi.id,
        sent_at: deal.status === "draft" ? new Date().toISOString() : undefined,
      })
      .eq("id", deal.id);

    await sb.from("deal_events").insert({
      deal_id: deal.id,
      from_state: deal.status,
      to_state: "paying",
      actor: "prospect",
      actor_email: deal.prospect_email,
      metadata: {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
      },
    });
  } catch (err) {
    console.warn("[close/payment-intent] db update warn", err);
  }

  return NextResponse.json({
    clientSecret: pi.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
}
