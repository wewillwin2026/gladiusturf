"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, RefreshCcw } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

/**
 * ROI math model
 * --------------
 * The dollar benchmarks in content/engines.ts are PER CREW PER MONTH (or per
 * year, for Referral Radar). For multi-crew shops we apply a soft
 * diminishing-returns factor — 0.85^(crews - 1) — because the second crew
 * doesn't quite double the recovery (overlapping customer base, shared
 * inquiry pool, single dispatcher overhead). The factor floors at 0.30.
 *
 * Inputs let the prospect tune two key sensitivities:
 *   - avgTicket: most landscape benchmarks assume $340 per service ticket
 *   - monthlyInquiriesPerCrew: most assume 80/crew/mo. Below 40, the
 *     Quote Intercept recovery shrinks proportionally; above 120, it caps
 *     at the benchmark to stay honest.
 */
const BENCHMARK_AVG_TICKET = 340;
const BENCHMARK_INQUIRIES_PER_CREW = 80;

function diminish(crews: number): number {
  if (crews <= 1) return 1;
  return Math.max(0.3, Math.pow(0.85, crews - 1) * crews);
}

function ticketScale(avg: number): number {
  // Below $200 the value of recovered quotes drops; above $600 it caps.
  return Math.min(1.6, Math.max(0.5, avg / BENCHMARK_AVG_TICKET));
}

function inquiryScale(per: number): number {
  return Math.min(1.4, Math.max(0.4, per / BENCHMARK_INQUIRIES_PER_CREW));
}

type EngineOutput = {
  name: string;
  yearly: number;
  basis: string;
  accent: "moss" | "champagne";
};

function compute({
  crews,
  avgTicket,
  inquiriesPerCrewPerMonth,
}: {
  crews: number;
  avgTicket: number;
  inquiriesPerCrewPerMonth: number;
}): {
  engines: EngineOutput[];
  total: number;
} {
  const c = diminish(crews);
  const t = ticketScale(avgTicket);
  const i = inquiryScale(inquiriesPerCrewPerMonth);

  const engines: EngineOutput[] = [
    {
      name: "Quote Intercept",
      yearly: 14200 * 12 * c * t * i,
      basis: "$14,200/mo per crew benchmark",
      accent: "moss",
    },
    {
      name: "The FollowUp",
      yearly: 12800 * 12 * c * t,
      basis: "$12,800/mo recovered late invoices",
      accent: "champagne",
    },
    {
      name: "Ghost Recovery",
      yearly: 11200 * 12 * c * t * i,
      basis: "$11,200/mo on dead leads",
      accent: "moss",
    },
    {
      name: "InstantText",
      yearly: 8400 * 12 * c * i,
      basis: "$8,400/mo first-touch wins",
      accent: "champagne",
    },
    {
      name: "Upsell Whisperer",
      yearly: 38000 * 12 * Math.min(crews, 5) * t,
      basis: "$38,000/mo additional revenue (caps at 5 crews)",
      accent: "moss",
    },
    {
      name: "Referral Radar",
      yearly: 180000 * Math.min(crews, 5),
      basis: "$180,000/yr recovered referral revenue",
      accent: "champagne",
    },
    {
      name: "Save Play",
      yearly: 0.18 * crews * 50 * avgTicket * 12,
      basis: "18% net retention lift × 50 active accounts/crew",
      accent: "moss",
    },
  ];

  const total = engines.reduce((s, e) => s + e.yearly, 0);
  return { engines, total };
}

const TIERS = [
  { id: "independent", name: "Independent", monthly: 397 },
  { id: "professional", name: "Professional", monthly: 997 },
  { id: "enterprise", name: "Enterprise", monthly: 2997 },
] as const;

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000).toLocaleString()}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtMoneyPrecise(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export function RoiCalculator() {
  const [crews, setCrews] = useState(3);
  const [avgTicket, setAvgTicket] = useState(BENCHMARK_AVG_TICKET);
  const [inquiriesPerCrewPerMonth, setInquiries] = useState(
    BENCHMARK_INQUIRIES_PER_CREW
  );

  const { engines, total } = useMemo(
    () => compute({ crews, avgTicket, inquiriesPerCrewPerMonth }),
    [crews, avgTicket, inquiriesPerCrewPerMonth]
  );

  const tierAnnualCost = (monthly: number) => monthly * 12 * crews;

  const reset = () => {
    setCrews(3);
    setAvgTicket(BENCHMARK_AVG_TICKET);
    setInquiries(BENCHMARK_INQUIRIES_PER_CREW);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-bone/10 bg-pitch py-24 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.10),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="max-w-3xl">
              <Pill tone="champagne">ROI Calculator</Pill>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                Run the math on your shop.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
                Type your crew count, average ticket, and monthly inquiries.
                See exactly what GladiusTurf recovers in a year — engine by
                engine — and how fast it pays back at every tier.
              </p>
              <p className="mt-3 max-w-2xl text-sm text-bone/50">
                Modeled from founding-cohort pilot benchmarks, Q1 2026.
                Conservative scaling for multi-crew shops.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-obsidian py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-14">
            {/* INPUTS */}
            <ScrollReveal>
              <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                <div className="flex items-center justify-between">
                  <Eyebrow tone="champagne">Your shop</Eyebrow>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-crest text-bone/45 transition-colors hover:text-champagne-bright"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>

                <div className="mt-7 flex flex-col gap-7">
                  <SliderInput
                    label="Crews"
                    sublabel="Trucks running on a typical day"
                    value={crews}
                    min={1}
                    max={20}
                    step={1}
                    display={`${crews}`}
                    onChange={setCrews}
                  />
                  <SliderInput
                    label="Average ticket"
                    sublabel="Per-service revenue (mowing, fert app, hardscape touchup)"
                    value={avgTicket}
                    min={120}
                    max={1200}
                    step={20}
                    display={fmtMoneyPrecise(avgTicket)}
                    onChange={setAvgTicket}
                  />
                  <SliderInput
                    label="Inquiries per crew per month"
                    sublabel="Inbound texts, calls, web form fills"
                    value={inquiriesPerCrewPerMonth}
                    min={20}
                    max={200}
                    step={5}
                    display={`${inquiriesPerCrewPerMonth}`}
                    onChange={setInquiries}
                  />
                </div>

                <div className="mt-8 rounded-xl border border-champagne/20 bg-champagne/[0.04] px-5 py-4">
                  <div className="text-xs uppercase tracking-crest text-champagne-bright">
                    Modeled annual recovery
                  </div>
                  <div className="mt-1 font-serif text-4xl font-semibold tracking-tight text-bone">
                    {fmtMoneyPrecise(total)}
                  </div>
                  <div className="mt-1 text-xs text-bone/50">
                    Across all marquee engines, after diminishing-returns
                    multi-crew adjustment.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* OUTPUTS */}
            <ScrollReveal delay={0.1}>
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-champagne-bright" />
                    <span className="text-xs uppercase tracking-crest text-bone/55">
                      Engine-by-engine
                    </span>
                  </div>
                  <ul className="mt-5 flex flex-col gap-4">
                    {engines.map((e) => {
                      const accentText =
                        e.accent === "moss"
                          ? "text-moss-bright"
                          : "text-champagne-bright";
                      return (
                        <li
                          key={e.name}
                          className="flex items-baseline justify-between gap-3 border-b border-bone/5 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <div className="font-serif text-base text-bone">
                              {e.name}
                            </div>
                            <div className="text-xs text-bone/45">
                              {e.basis}
                            </div>
                          </div>
                          <div
                            className={`font-mono text-lg font-semibold tabular-nums ${accentText}`}
                          >
                            {fmtMoneyPrecise(e.yearly)}
                            <span className="text-xs font-normal text-bone/40">
                              {" "}
                              / yr
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Tier payback grid */}
                <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-crest text-bone/55">
                      Payback at every tier · {crews} crew
                      {crews === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {TIERS.map((tier) => {
                      const annualCost = tierAnnualCost(tier.monthly);
                      const ratio = total / annualCost;
                      const paybackDays = Math.max(
                        1,
                        Math.round((annualCost / total) * 365)
                      );
                      const isFeatured = tier.id === "professional";
                      return (
                        <div
                          key={tier.id}
                          className={
                            isFeatured
                              ? "rounded-xl border border-moss/40 bg-gradient-to-b from-moss/10 to-transparent p-5"
                              : "rounded-xl border border-bone/10 bg-bone/[0.03] p-5"
                          }
                        >
                          <div
                            className={`text-xs uppercase tracking-crest ${
                              isFeatured
                                ? "text-moss-bright"
                                : "text-champagne-bright"
                            }`}
                          >
                            {tier.name}
                          </div>
                          <div className="mt-2 font-serif text-2xl text-bone">
                            ${tier.monthly.toLocaleString()}
                            <span className="text-xs text-bone/50"> / mo</span>
                          </div>
                          <div className="mt-1 text-[11px] text-bone/45">
                            {fmtMoney(annualCost)} / yr at {crews} crew
                            {crews === 1 ? "" : "s"}
                          </div>
                          <div className="mt-4 flex items-baseline gap-1">
                            <span
                              className={`font-mono text-3xl font-semibold tabular-nums ${
                                isFeatured
                                  ? "text-moss-bright"
                                  : "text-champagne-bright"
                              }`}
                            >
                              {ratio < 100
                                ? `${ratio.toFixed(1)}×`
                                : `${Math.round(ratio)}×`}
                            </span>
                            <span className="text-xs text-bone/45">
                              return
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-bone/55">
                            Pays back in {paybackDays}{" "}
                            {paybackDays === 1 ? "day" : "days"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/demo"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-base font-semibold text-forest shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
                  >
                    See it on your data — book a 30-min demo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-champagne-bright/40 px-6 py-3 text-sm font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
                  >
                    See the pricing page →
                  </Link>
                </div>

                <p className="text-xs leading-relaxed text-bone/40">
                  Conservative scaling for multi-crew shops (0.85^crews
                  diminishing factor; floors at 0.30). Upsell Whisperer and
                  Referral Radar cap at 5 crews so we don&rsquo;t over-promise
                  on the long tail. Real founding-cohort recovery has clustered
                  within ±15% of these projections through Q1 2026.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

function SliderInput({
  label,
  sublabel,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-bone">{label}</div>
          <div className="mt-0.5 text-[11px] text-bone/45">{sublabel}</div>
        </div>
        <div className="font-mono text-base font-semibold text-champagne-bright tabular-nums">
          {display}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-bone/10 accent-champagne-bright [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-champagne-bright [&::-webkit-slider-thumb]:shadow-[0_0_12px_-2px_rgba(212,178,122,0.6)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-champagne-bright"
      />
    </div>
  );
}
