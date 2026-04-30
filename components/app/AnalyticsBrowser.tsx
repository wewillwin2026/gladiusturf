import * as React from "react";
import { ArrowDown, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { Sparkline } from "./ui/Sparkline";
import { type ProductKind } from "./engines";
import { num, pct, money } from "@/lib/shared/format";

const FUNNEL = [
  { label: "Quotes sent", value: 412, delta: "+22%" },
  { label: "Quotes viewed", value: 298, delta: "+19%" },
  { label: "Quotes replied", value: 184, delta: "+17%" },
  { label: "Quotes won", value: 153, delta: "+24%" },
];

const METRICS = [
  { metric: "Avg. quote size", value: "$1,840", delta: "+$130", trend: "up" as const },
  { metric: "Quote → won (median days)", value: "3.4", delta: "−0.8", trend: "down" as const },
  { metric: "Cancellation rate", value: "5.8%", delta: "−1.2 pts", trend: "down" as const },
  { metric: "Upsell rate (per customer)", value: "1.6×", delta: "+0.2×", trend: "up" as const },
  { metric: "Referral conversion", value: "44%", delta: "+6 pts", trend: "up" as const },
  { metric: "BDC reply rate", value: "11.4%", delta: "+1.6 pts", trend: "up" as const },
  { metric: "AI-drafted quote win rate", value: "62%", delta: "+18 pts", trend: "up" as const },
  { metric: "First-call-resolution", value: "84%", delta: "+4 pts", trend: "up" as const },
];

const COHORT_LTV = [320, 580, 820, 1080, 1380, 1640, 1860, 2100, 2310, 2540, 2740, 2960];

const CHURN_HISTORY = [9.2, 8.8, 8.4, 8.0, 7.6, 7.4, 7.0, 6.8, 6.4, 6.2, 6.0, 5.8];

export function AnalyticsBrowser({ product }: { product: ProductKind }) {
  const max = Math.max(...FUNNEL.map((f) => f.value));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Analytics"
        subtitle="Funnel · cohort · LTV. Where the dollars enter and where they fall through."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Quote → Won" value={pct((153 / 412) * 100, 0)} delta="+4 pts" trend="up" />
        <KPICard label="Avg. LTV" value="$3,860" delta="+$320" trend="up" />
        <KPICard label="Payback" value="4.1 mo" delta="−0.6" trend="down" />
        <KPICard label="Active retention · 12mo" value="89%" delta="+3 pts" trend="up" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <section className="g-card p-5">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Quote-to-cash funnel · 30 days
          </h3>
          <div className="mt-4 flex flex-col gap-2">
            {FUNNEL.map((f, idx) => {
              const widthPct = (f.value / max) * 100;
              const dropoff = idx > 0 ? FUNNEL[idx - 1]!.value - f.value : 0;
              return (
                <div key={f.label}>
                  <div className="flex items-baseline justify-between text-[12px] mb-1">
                    <span className="text-g-text-muted">{f.label}</span>
                    <span className="font-mono text-g-text">
                      {num(f.value)}
                      <span className="text-g-text-faint ml-2">{f.delta}</span>
                    </span>
                  </div>
                  <div
                    className="h-7 rounded-md bg-g-accent flex items-center justify-end pr-3 text-[11px] font-mono text-obsidian/80"
                    style={{
                      width: `${widthPct}%`,
                      opacity: 1 - idx * 0.18,
                    }}
                  >
                    {num(f.value)}
                  </div>
                  {dropoff > 0 && (
                    <div className="mt-0.5 text-[10px] text-g-text-faint inline-flex items-center gap-1 ml-1">
                      <ArrowDown className="h-2.5 w-2.5" />
                      −{num(dropoff)} dropped
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="g-card p-5">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Cohort LTV · monthly accumulation
          </h3>
          <div className="mt-3 text-g-accent">
            <Sparkline data={COHORT_LTV} width={400} height={120} className="w-full" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-g-text-faint uppercase tracking-[0.14em]">Mo 1</div>
              <div className="font-mono text-g-text mt-0.5">{money(COHORT_LTV[0]! * 100)}</div>
            </div>
            <div>
              <div className="text-g-text-faint uppercase tracking-[0.14em]">Mo 6</div>
              <div className="font-mono text-g-text mt-0.5">{money(COHORT_LTV[5]! * 100)}</div>
            </div>
            <div>
              <div className="text-g-text-faint uppercase tracking-[0.14em]">Mo 12</div>
              <div className="font-mono text-g-accent mt-0.5">{money(COHORT_LTV[11]! * 100)}</div>
            </div>
          </div>
        </section>
      </div>

      <section className="g-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Churn · 12 months
          </h3>
          <span className="font-mono text-[12px] text-g-success">−3.4 pts</span>
        </div>
        <div className="text-g-success">
          <Sparkline data={CHURN_HISTORY.map((v) => -v)} width={1200} height={80} className="w-full" />
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="px-5 py-3 border-b border-g-border-subtle">
          <h3 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Metric snapshot
          </h3>
        </header>
        <div className="px-5 py-2">
          {METRICS.map((m, i) => (
            <div
              key={m.metric}
              className="flex items-center justify-between py-3 border-b border-g-border-subtle/60 last:border-b-0"
            >
              <span className="text-[13px] text-g-text-muted">{m.metric}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[14px] text-g-text">{m.value}</span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                    m.trend === "up" ? "text-g-success" : "text-g-success"
                  }`}
                >
                  {m.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {m.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
