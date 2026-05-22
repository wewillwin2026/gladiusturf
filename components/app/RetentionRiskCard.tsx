import * as React from "react";
import Link from "next/link";
import { ArrowRight, Repeat } from "lucide-react";

export type RetentionRiskProps = {
  /** Number of customers whose last visit is older than `daysThreshold`. */
  atRiskCount: number;
  /** Sum of estimated re-engagement opportunity ($ from prior LTV). */
  potentialCents: number;
  /** Total customers (denominator — context). */
  totalCustomers: number;
  daysThreshold?: number;
};

/**
 * Retention risk — proactive AI insight Felipe didn't ask for but
 * needs. Counts customers with no visit in `daysThreshold` days
 * (default 90) and surfaces the winback opportunity. Jobber shows
 * nothing like this on the home; this is a category-leader move.
 */
export function RetentionRiskCard({
  atRiskCount,
  potentialCents,
  totalCustomers,
  daysThreshold = 90,
}: RetentionRiskProps) {
  const dollars = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(potentialCents / 100);

  // Visual severity: <2% atRisk of total = green, 2-10% = warning, >10% = danger.
  const pct =
    totalCustomers > 0 ? (atRiskCount / totalCustomers) * 100 : 0;
  const tone =
    pct < 2
      ? "text-g-success"
      : pct < 10
        ? "text-g-warning"
        : "text-g-danger";

  return (
    <section className="g-card flex flex-col gap-3 p-5">
      <header className="flex items-center gap-2">
        <Repeat className="h-4 w-4 text-g-accent" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
          Retention risk
        </span>
      </header>
      <div>
        <div className="flex items-baseline gap-2">
          <span className={`font-geist-mono text-[28px] font-medium ${tone}`}>
            {atRiskCount}
          </span>
          <span className="text-[13px] text-g-text-muted">
            customer{atRiskCount === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-g-text-muted leading-snug">
          No visit in {daysThreshold}+ days. Potential winback{" "}
          <span className="text-g-text">{dollars}</span>.
        </p>
      </div>
      <div className="mt-auto">
        {atRiskCount > 0 ? (
          <Link
            href="/app/campaigns"
            prefetch
            className="inline-flex items-center gap-1 rounded-md bg-g-accent px-3 py-1.5 text-[12px] font-medium text-white hover:bg-g-accent-hover"
          >
            Re-engage campaign
            <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-[11px] text-g-text-faint">
            All customers visited recently — no winback needed yet.
          </span>
        )}
      </div>
    </section>
  );
}
