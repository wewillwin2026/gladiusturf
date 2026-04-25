import { ScrollReveal } from "@/components/scroll-reveal";
import { AtRiskTable } from "@/components/retention-sandbox/at-risk-table";
import { CohortTable } from "@/components/retention-sandbox/cohort-table";
import { KeepingTrendChart } from "@/components/retention-sandbox/keeping-trend-chart";
import { SignalGrid } from "@/components/retention-sandbox/signal-grid";
import { HEADLINE_STATS } from "@/content/retention-demo-data";

export default function RetentionDemoPage() {
  const dollars = new Intl.NumberFormat("en-US");

  return (
    <div className="space-y-12 pb-16 md:space-y-16">
      {/* 1. Headline strip */}
      <ScrollReveal>
        <section>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne-bright">
            <span className="mr-1.5 inline-flex h-1.5 w-1.5 animate-pulse-dot rounded-full bg-moss-bright" />
            Save Play · live
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-bone md:text-5xl">
            We catch them sixty days before they walk.{" "}
            <span className="text-bone/55">
              The 23 below are walking unless something changes by next Tuesday.
            </span>
          </h1>

          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat
              eyebrow="At risk now"
              value={`${HEADLINE_STATS.atRisk}`}
              suffix="customers"
              tone="champagne"
            />
            <Stat
              eyebrow="Revenue at risk"
              value={`$${dollars.format(HEADLINE_STATS.monthlyRevenueAtRisk)}`}
              suffix="/ month"
              tone="moss"
            />
            <Stat
              eyebrow="Keeping customers"
              value={`${HEADLINE_STATS.keepingRatePct}%`}
              suffix="last 90 days"
              tone="moss"
              winner
            />
            <Stat
              eyebrow="Saved this month"
              value={`${HEADLINE_STATS.savedThisMonth}`}
              suffix="customers rescued"
              tone="bone"
            />
          </div>
        </section>
      </ScrollReveal>

      {/* 2. At-risk customer table */}
      <ScrollReveal delay={0.05}>
        <section>
          <SectionHead
            eyebrow="At-risk queue"
            title="Who's about to walk"
            sub="Sorted by risk score. Click any row to open the save play — drafted message, signals, and a 7-day follow-up timeline."
          />
          <div className="mt-7">
            <AtRiskTable />
          </div>
        </section>
      </ScrollReveal>

      {/* 3. Six-signal grid */}
      <ScrollReveal delay={0.05}>
        <section>
          <SectionHead
            eyebrow="The six signals"
            title="What we're watching"
            sub="Six leading indicators that predict a walk before the cancel email. Each customer above tripped 2-4 of these. Counts are across your whole book."
          />
          <div className="mt-7">
            <SignalGrid />
          </div>
        </section>
      </ScrollReveal>

      {/* 5. Keeping-customers trend chart */}
      <ScrollReveal delay={0.05}>
        <section>
          <SectionHead
            eyebrow="Keeping customers · trend"
            title="The customers you already have"
            sub="Trailing 12-month percentage of revenue you held onto, expansion included. Save Play went live in August. The line tells the rest of the story."
          />
          <div className="mt-7">
            <KeepingTrendChart />
          </div>
        </section>
      </ScrollReveal>

      {/* 6. Cohort table */}
      <ScrollReveal delay={0.05}>
        <section>
          <SectionHead
            eyebrow="Customer Worth · feed"
            title="Five quarters of cohorts"
            sub="The customers you started with each quarter, and what's left of them. Average Customer Worth is updated nightly from Books and Job Costing."
          />
          <div className="mt-7">
            <CohortTable />
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne-bright">
        {eyebrow}
      </div>
      <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone md:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-[14px] leading-[1.65] text-bone/60 md:text-[15px]">
        {sub}
      </p>
    </div>
  );
}

type StatTone = "champagne" | "moss" | "bone";

function Stat({
  eyebrow,
  value,
  suffix,
  tone,
  winner,
}: {
  eyebrow: string;
  value: string;
  suffix: string;
  tone: StatTone;
  winner?: boolean;
}) {
  const valueCls =
    tone === "moss"
      ? "text-moss-bright"
      : tone === "bone"
        ? "text-bone"
        : "text-champagne-bright";
  const borderCls = winner
    ? "border-moss/35 bg-moss/[0.04] shadow-pop"
    : "border-bone/10 bg-bone/[0.02]";

  return (
    <div
      className={`rounded-2xl border ${borderCls} p-5`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">
        {eyebrow}
      </div>
      <div className={`mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl ${valueCls}`}>
        {value}
      </div>
      <div className="mt-1 text-[11px] text-bone/55">{suffix}</div>
    </div>
  );
}
