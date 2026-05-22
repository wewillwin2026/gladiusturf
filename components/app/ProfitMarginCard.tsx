import * as React from "react";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

export type ProfitMarginProps = {
  /** Last-30-day paid revenue in cents (sum of proposals.total_cents for sold). */
  revenueCents: number;
  /** Prior-30-day paid revenue in cents — for the WoW delta. */
  priorRevenueCents: number;
  /** Optional explicit margin (parts + labor cost) if the tenant tracks it.
   *  When omitted we don't claim a margin number — we render only the
   *  revenue line and a "Track costs to see margin" nudge. */
  marginCents?: number;
};

/**
 * Profit pulse — front-of-house view of paid revenue + WoW change +
 * margin (when tracked). Designed to give Felipe the financial pulse
 * without opening Reports. Most CRMs put this only in Reports; we
 * surface it on the dashboard.
 */
export function ProfitMarginCard({
  revenueCents,
  priorRevenueCents,
  marginCents,
}: ProfitMarginProps) {
  const fmt = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  // WoW delta (avoid divide-by-zero noise).
  const change =
    priorRevenueCents > 0
      ? Math.round(((revenueCents - priorRevenueCents) / priorRevenueCents) * 100)
      : revenueCents > 0
        ? 100
        : 0;
  const changeUp = change >= 0;
  const ChangeIcon = changeUp ? TrendingUp : TrendingDown;

  // Margin %, if we have a real cost number.
  const hasMargin = typeof marginCents === "number" && revenueCents > 0;
  const marginPct = hasMargin
    ? Math.round((marginCents! / revenueCents) * 100)
    : null;

  return (
    <section className="g-card flex flex-col gap-3 p-5">
      <header className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-g-accent" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
          Profit · last 30 days
        </span>
      </header>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-geist-mono text-[28px] font-medium text-g-text">
            {hasMargin ? fmt(marginCents!) : fmt(revenueCents)}
          </span>
          <span className="text-[13px] text-g-text-muted">
            {hasMargin ? "margin" : "revenue"}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-g-text-muted leading-snug">
          {hasMargin ? (
            <>
              <span className="text-g-text">{fmt(revenueCents)}</span> paid ·{" "}
              <span className="text-g-text">{marginPct}%</span> margin
            </>
          ) : (
            <>
              <span className="text-g-text">{fmt(revenueCents)}</span> paid ·{" "}
              <span className="text-g-text-faint">
                track parts &amp; labor cost in Quotes to see margin
              </span>
            </>
          )}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-g-border-subtle pt-2 text-[11px]">
        <span className="text-g-text-muted">vs prior 30d</span>
        <span
          className={`inline-flex items-center gap-1 font-geist-mono font-semibold ${
            changeUp ? "text-g-success" : "text-g-danger"
          }`}
        >
          <ChangeIcon className="h-3 w-3" />
          {changeUp ? "+" : ""}
          {change}%
        </span>
      </div>
    </section>
  );
}
