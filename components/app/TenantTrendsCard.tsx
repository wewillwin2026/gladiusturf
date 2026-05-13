import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";

type Trend = {
  label: string;
  /** Count in the most recent 30-day window. */
  thisCount: number;
  /** Count in the prior 30-day window. */
  priorCount: number;
  /** Format hint — affects how the count is displayed. */
  format?: "count" | "money_cents";
  /** Optional one-liner shown beneath the delta. */
  hint?: string;
};

function fmt(value: number, format: Trend["format"]): string {
  if (format === "money_cents") {
    if (value >= 1_000_000) return `$${(value / 100_000_000).toFixed(2)}M`;
    if (value >= 100_000)
      return `$${Math.round(value / 100_000).toLocaleString()}K`;
    return `$${Math.round(value / 100).toLocaleString()}`;
  }
  return value.toLocaleString();
}

function deltaPct(thisN: number, priorN: number): number | null {
  if (priorN === 0) {
    if (thisN === 0) return 0;
    return null; // "new" — can't compute % growth from zero
  }
  return Math.round(((thisN - priorN) / priorN) * 100);
}

/**
 * Dashboard trends card — 30-day vs prior 30-day. Server-rendered, so
 * the deltas reflect actual tenant data without a client round-trip.
 * Empty rows are still rendered so the layout doesn't reflow as data
 * accumulates.
 */
export function TenantTrendsCard({
  trends,
  windowLabel = "Last 30 days",
}: {
  trends: Trend[];
  windowLabel?: string;
}) {
  return (
    <section className="g-card overflow-hidden">
      <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
        <h2 className="text-[13px] text-g-text">Trends</h2>
        <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          {windowLabel} vs prior 30
        </span>
      </header>
      <ul className="divide-y divide-g-border-subtle">
        {trends.map((t) => {
          const pct = deltaPct(t.thisCount, t.priorCount);
          const direction =
            t.thisCount > t.priorCount
              ? "up"
              : t.thisCount < t.priorCount
                ? "down"
                : "flat";
          const Icon =
            direction === "up"
              ? ArrowUp
              : direction === "down"
                ? ArrowDown
                : Minus;
          const tone =
            direction === "up"
              ? "text-g-success"
              : direction === "down"
                ? "text-g-danger"
                : "text-g-text-faint";
          return (
            <li
              key={t.label}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <div className="text-[13px] text-g-text">{t.label}</div>
                {t.hint && (
                  <div className="text-[11px] text-g-text-faint">
                    {t.hint}
                  </div>
                )}
              </div>
              <span className="font-mono tabular-nums text-[15px] text-g-text">
                {fmt(t.thisCount, t.format)}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] ${tone}`}
              >
                <Icon className="h-3 w-3" aria-hidden />
                {pct == null ? (
                  <span className="text-g-text-faint">new</span>
                ) : (
                  <span>{pct === 0 ? "flat" : `${pct > 0 ? "+" : ""}${pct}%`}</span>
                )}
              </span>
            </li>
          );
        })}
        {trends.length === 0 && (
          <li className="px-5 py-6 text-center">
            <ArrowRight className="mx-auto h-5 w-5 text-g-text-faint" />
            <p className="mt-2 text-[12px] text-g-text-muted">
              Trends populate as quotes ship, jobs close, and reviews come in.
            </p>
          </li>
        )}
      </ul>
    </section>
  );
}
