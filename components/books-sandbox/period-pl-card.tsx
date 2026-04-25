"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  HEADLINE,
  formatUsdShort,
  type Period,
} from "@/content/books-demo-data";

const PERIODS: { key: Period; label: string }[] = [
  { key: "MTD", label: "MTD" },
  { key: "QTD", label: "QTD" },
  { key: "YTD", label: "YTD 2026" },
];

export function PeriodPlCard() {
  const [period, setPeriod] = useState<Period>("YTD");

  return (
    <section
      id="overview"
      aria-labelledby="overview-heading"
      className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne-bright">
            Profit & Loss
          </span>
          <h2
            id="overview-heading"
            className="mt-2 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone md:text-3xl"
          >
            Real-time P&amp;L · live to the minute
          </h2>
        </div>

        {/* Period pill row */}
        <div
          role="tablist"
          aria-label="Period"
          className="inline-flex items-center gap-1 rounded-full border border-bone/15 bg-pitch/60 p-1"
        >
          {PERIODS.map((p) => {
            const active = p.key === period;
            return (
              <button
                key={p.key}
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-champagne/15 text-champagne-bright"
                    : "text-bone/55 hover:text-bone"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big numbers */}
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <Stat
          label="Revenue"
          value={formatUsdShort(HEADLINE.revenue)}
          colorClass="text-bone"
        />
        <Stat
          label="Cost"
          value={formatUsdShort(HEADLINE.cost)}
          colorClass="text-bone/55"
        />
        <Stat
          label="Net"
          value={formatUsdShort(HEADLINE.net)}
          colorClass="text-champagne-bright"
        />
        <Stat
          label="Margin"
          value={`${HEADLINE.marginPct}%`}
          colorClass="text-moss-bright"
        />
      </div>

      {/* YoY sub-line */}
      <div className="mt-6 flex items-center gap-2 border-t border-bone/10 pt-5 text-[13px] text-bone/65">
        <span className="inline-flex items-center justify-center rounded-full bg-moss/15 p-1 text-moss-bright">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        <span>
          vs prior year:{" "}
          <span className="text-moss-bright">+{HEADLINE.yoyRevenuePct}%</span>{" "}
          revenue,{" "}
          <span className="text-moss-bright">+{HEADLINE.yoyNetPct}%</span> net
        </span>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40">
          As of 2026-04-24 · 14:32 EDT
        </span>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/45">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-3xl font-semibold tracking-[-0.02em] md:text-4xl",
          colorClass
        )}
      >
        {value}
      </div>
    </div>
  );
}
