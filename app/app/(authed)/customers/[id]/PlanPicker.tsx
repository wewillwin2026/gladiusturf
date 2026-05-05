"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Repeat } from "lucide-react";
import { subscribeCustomerToPlan } from "./actions";

type PlanOption = {
  id: string;
  display_name: string;
  annual_price_cents: number;
  badge: string | null;
  most_popular: boolean;
};

type Props = {
  customerId: string;
  currentPlanId: string | null;
  options: PlanOption[];
};

function dollar(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Inline plan picker on the customer-detail page. Submits via the
 * `subscribeCustomerToPlan` server action. Optimistic-leaning UX:
 * disables the buttons during the transition + shows a check on
 * success.
 */
export function PlanPicker({ customerId, currentPlanId, options }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justSubscribed, setJustSubscribed] = useState<string | null>(null);

  function handleSubscribe(planId: string) {
    setError(null);
    setJustSubscribed(null);
    const fd = new FormData();
    fd.set("customer_id", customerId);
    fd.set("plan_id", planId);
    startTransition(async () => {
      const result = await subscribeCustomerToPlan(fd);
      if ("error" in result && result.error) {
        setError(result.error);
      } else if ("ok" in result && result.ok) {
        setJustSubscribed(planId);
      }
    });
  }

  return (
    <div className="g-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="inline-flex items-center gap-2">
          <Repeat className="h-4 w-4 text-g-accent" />
          Maintenance plan
        </h2>
        {currentPlanId && (
          <span className="text-[11px] uppercase tracking-[0.14em] text-g-accent">
            Subscribed
          </span>
        )}
      </div>

      <p className="mt-3 text-[12px] text-g-text-muted">
        {currentPlanId
          ? "This customer is on a recurring plan. Tap a different tier to upgrade."
          : "No plan yet. Convert this customer in one tap — they get the next visit pre-scheduled."}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {options.length === 0 ? (
          <p className="text-[12px] text-g-text-faint">
            No active plan tiers configured for this workspace yet.
          </p>
        ) : (
          options.map((opt) => {
            const isCurrent = opt.id === currentPlanId;
            const isJust = opt.id === justSubscribed;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={pending || isCurrent}
                onClick={() => handleSubscribe(opt.id)}
                className={[
                  "group flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                  isCurrent
                    ? "border-g-accent/60 bg-g-accent-faint cursor-default"
                    : "border-g-border bg-g-surface hover:border-g-accent/40 hover:bg-g-surface-2",
                  pending && !isJust ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {(isCurrent || isJust) && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-g-accent" />
                  )}
                  {pending && isJust && !isCurrent && (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-g-accent" />
                  )}
                  <span className="text-[13px] text-g-text truncate">
                    {opt.display_name}
                  </span>
                  {opt.most_popular && (
                    <span className="rounded-full border border-g-accent/40 bg-g-accent-faint px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-g-accent">
                      Popular
                    </span>
                  )}
                </div>
                <span className="font-geist-mono text-[12px] text-g-text-muted shrink-0">
                  {dollar(opt.annual_price_cents)}/yr
                </span>
              </button>
            );
          })
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-g-danger/40 bg-g-danger/10 p-2 text-[12px] text-g-danger"
        >
          {error === "missing_field"
            ? "Customer or plan id missing — refresh and try again."
            : error === "not_found_in_tenant"
              ? "That plan or customer doesn't belong to your workspace."
              : error === "unauthenticated"
                ? "You're signed out — refresh to sign back in."
                : "Couldn't subscribe right now. Try again in a moment."}
        </p>
      )}

      {justSubscribed && !error && (
        <p className="mt-3 text-[12px] text-g-accent">
          Subscribed. The plan engine will pre-schedule the first visit
          on the next cron pass.
        </p>
      )}
    </div>
  );
}
