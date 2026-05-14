import Link from "next/link";
import { ArrowRight, Globe2, Sparkles } from "lucide-react";

export type MarketingTrafficSummary = {
  visitorsLast7: number;
  visitorsPrior7: number;
  formStartsLast7: number;
  formSubmitsLast7: number;
  topSources: { source: string; count: number }[];
  /** Whether the /app/marketing tab is enabled — affects CTA copy. */
  tabEnabled: boolean;
};

function deltaLabel(thisN: number, priorN: number): string {
  if (priorN === 0) return thisN === 0 ? "no traffic yet" : "new this week";
  const pct = Math.round(((thisN - priorN) / priorN) * 100);
  if (pct === 0) return "flat vs last week";
  return `${pct > 0 ? "+" : ""}${pct}% vs last week`;
}

/**
 * Dashboard summary tile — "Web visitors this week." Always mounted on
 * the tenant Dashboard regardless of marketing_tab_enabled. Shows an
 * empty state with a setup hint until the tenant's site posts events.
 */
export function MarketingTrafficCard({
  summary,
}: {
  summary: MarketingTrafficSummary;
}) {
  const {
    visitorsLast7,
    visitorsPrior7,
    formStartsLast7,
    formSubmitsLast7,
    topSources,
    tabEnabled,
  } = summary;
  const hasData = visitorsLast7 > 0 || visitorsPrior7 > 0;

  return (
    <section className="g-card overflow-hidden">
      <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-3.5 w-3.5 text-g-text-muted" />
          <h2 className="text-[13px] text-g-text">Web visitors · last 7 days</h2>
        </div>
        {tabEnabled ? (
          <Link
            href="/app/marketing"
            className="inline-flex items-center gap-1 text-[11px] text-g-text-muted hover:text-g-text"
          >
            Open Marketing
            <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Setup
          </span>
        )}
      </header>

      {hasData ? (
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                Visitors
              </div>
              <div className="mt-1 font-mono tabular-nums text-[22px] text-g-text">
                {visitorsLast7.toLocaleString()}
              </div>
              <div className="text-[11px] text-g-text-muted">
                {deltaLabel(visitorsLast7, visitorsPrior7)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                Form starts
              </div>
              <div className="mt-1 font-mono tabular-nums text-[22px] text-g-text">
                {formStartsLast7.toLocaleString()}
              </div>
              <div className="text-[11px] text-g-text-muted">
                {visitorsLast7 > 0
                  ? `${Math.round((formStartsLast7 / visitorsLast7) * 100)}% of visitors`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                Form submits
              </div>
              <div className="mt-1 font-mono tabular-nums text-[22px] text-g-text">
                {formSubmitsLast7.toLocaleString()}
              </div>
              <div className="text-[11px] text-g-text-muted">
                {formStartsLast7 > 0
                  ? `${Math.round((formSubmitsLast7 / formStartsLast7) * 100)}% of starts`
                  : "—"}
              </div>
            </div>
          </div>

          {topSources.length > 0 && (
            <div className="mt-4 border-t border-g-border-subtle pt-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                Top sources
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {topSources.slice(0, 4).map((s) => (
                  <li key={s.source} className="text-[12px] text-g-text-muted">
                    <span className="text-g-text">{s.source}</span>{" "}
                    <span className="font-mono tabular-nums">
                      {s.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-g-text-muted" />
            <div className="min-w-0">
              <div className="text-[13px] text-g-text">
                Marketing tracker isn&rsquo;t pointed here yet
              </div>
              <p className="mt-1 text-[11px] text-g-text-muted">
                Drop one line on your website and we&rsquo;ll surface
                visitors → form starts → quote conversions next to your
                customer data.
              </p>
              <Link
                href="/app/marketing/install"
                className="mt-2 inline-flex items-center gap-1 text-[12px] text-g-accent hover:underline"
              >
                Install the tracker
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
