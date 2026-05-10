"use client";

import * as React from "react";
import { loadStripe, type Stripe, type StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

type DealSummary = {
  prospectCompany: string;
  prospectEmail: string;
  tier: string;
  monthlyCents: number;
  addonBdc: boolean;
};

export function CloseForm({
  token,
  deal,
}: {
  token: string;
  deal: DealSummary;
}) {
  const [stage, setStage] = React.useState<"review" | "pay" | "done">("review");
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [publishableKey, setPublishableKey] = React.useState<string | null>(null);
  const [stripePromise, setStripePromise] = React.useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function startPayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/close/${token}/payment-intent`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok || !body.clientSecret) {
        throw new Error(body.error || "couldn't_start_payment");
      }
      setClientSecret(body.clientSecret);
      setPublishableKey(body.publishableKey);
      setStripePromise(loadStripe(body.publishableKey));
      setStage("pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "couldn't_start_payment");
    } finally {
      setLoading(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="g-card flex flex-col items-center gap-3 p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-g-accent-faint text-g-accent">
          <svg viewBox="0 0 16 16" className="h-6 w-6" fill="none">
            <path
              d="M3 8 L7 12 L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-g-text">Payment received.</h2>
        <p className="max-w-md text-[14px] leading-[1.6] text-g-text-muted">
          Welcome to GladiusTurf, {deal.prospectCompany}. A founder will email
          your workspace sign-in link to{" "}
          <span className="font-geist-mono text-g-text">{deal.prospectEmail}</span>{" "}
          within 24 hours.
        </p>
        <p className="text-[11px] text-g-text-faint">
          Receipt + invoice will arrive separately from Stripe.
        </p>
      </div>
    );
  }

  const monthly = deal.monthlyCents / 100;
  const addonText = deal.addonBdc ? " + GladiusBDC $499/mo" : "";

  if (stage === "review") {
    return (
      <div className="flex flex-col gap-6">
        <div className="g-card p-6">
          <p className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Order summary
          </p>
          <h2 className="mt-2 font-serif text-2xl text-g-text">
            {deal.prospectCompany}
          </h2>
          <p className="mt-1 text-[12px] text-g-text-muted">
            {deal.prospectEmail}
          </p>

          <ul className="mt-6 flex flex-col gap-2 border-t border-g-border-subtle pt-4 text-[14px]">
            <li className="flex items-baseline justify-between">
              <span className="text-g-text-muted capitalize">
                {deal.tier} tier
              </span>
              <span className="font-geist-mono text-g-text tabular-nums">
                ${monthly.toLocaleString()}/mo
              </span>
            </li>
            {deal.addonBdc && (
              <li className="flex items-baseline justify-between">
                <span className="text-g-text-muted">GladiusBDC addon</span>
                <span className="font-geist-mono text-g-text tabular-nums">
                  $499/mo
                </span>
              </li>
            )}
          </ul>

          <div className="mt-4 flex items-baseline justify-between border-t border-g-border-subtle pt-4">
            <span className="text-[14px] text-g-text">First-month total</span>
            <span className="font-geist-mono text-[20px] text-g-text tabular-nums">
              ${(monthly + (deal.addonBdc ? 499 : 0)).toLocaleString()}
            </span>
          </div>

          <p className="mt-4 text-[11px] leading-[1.55] text-g-text-faint">
            Billed monthly thereafter at the same price{addonText}. Annual
            increase capped at 5%, in writing. Cancel anytime — full data
            export inside 24 hours.
          </p>
        </div>

        {error && (
          <p className="text-[13px] text-g-danger" role="alert">
            {error === "deal_expired"
              ? "This payment link expired. Ask your founder rep for a fresh link."
              : error === "stripe_not_configured"
                ? "Payment is temporarily unavailable. Email founders@gladiusturf.com."
                : "Couldn't start payment. Try again or email founders@gladiusturf.com."}
          </p>
        )}

        <button
          type="button"
          onClick={startPayment}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-g-accent px-6 py-4 text-[15px] font-medium text-black hover:bg-g-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payment…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay ${(monthly + (deal.addonBdc ? 499 : 0)).toLocaleString()} to start
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-g-text-faint">
          Secured by Stripe. Card details never touch our servers.
        </p>
      </div>
    );
  }

  // stage === "pay"
  if (!clientSecret || !stripePromise) return null;

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#22c55e",
        colorBackground: "#0c1014",
        colorText: "#e5e7eb",
        colorDanger: "#ef4444",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        borderRadius: "6px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentInner
        onSuccess={() => setStage("done")}
        publishableKey={publishableKey ?? ""}
      />
    </Elements>
  );
}

function PaymentInner({
  onSuccess,
  publishableKey: _publishableKey,
}: {
  onSuccess: () => void;
  publishableKey: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe needs a return_url for redirect-based payment methods
        // (3DS auth, BNPL, etc.). On success Stripe redirects back here.
        return_url: `${window.location.origin}${window.location.pathname}?stripe=ok`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(
        stripeError.type === "card_error" || stripeError.type === "validation_error"
          ? stripeError.message ?? "Card was declined"
          : "Something went wrong with the payment",
      );
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
      return;
    }
    // Fallback — payment confirmed via redirect path; Stripe will return
    // here with ?stripe=ok and the server will have advanced state via
    // webhook. Show a holding pattern.
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="g-card flex flex-col gap-5 p-6"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
        <Lock className="h-3 w-3" />
        Card details
      </div>

      <PaymentElement
        options={{ layout: "tabs" }}
      />

      {error && (
        <p className="text-[13px] text-g-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-g-accent px-6 py-3.5 text-[14px] font-medium text-black hover:bg-g-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          "Confirm payment"
        )}
      </button>

      <p className="text-center text-[11px] text-g-text-faint">
        Reply STOP at any time to cancel future charges. Receipt emailed on
        success.
      </p>
    </form>
  );
}
