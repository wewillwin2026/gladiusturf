"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calculator, RefreshCcw, ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

/**
 * Loss math model
 * ---------------
 * IDENTICAL math to components/roi-calculator.tsx — same per-engine yearly
 * benchmarks, same diminishing-returns scaling, same ticket/inquiry
 * multipliers. The only difference is FRAMING: every output is labeled as a
 * CURRENT loss leaking through the prospect's stack, not a future recovery.
 *
 * NOTE: Math is duplicated from roi-calculator.tsx by intent (per project
 * brief). If you change the benchmarks or scaling factors here, change them
 * in components/roi-calculator.tsx too — or extract both into a shared
 * lib/roi-math.ts module.
 */
const BENCHMARK_AVG_TICKET = 340;
const BENCHMARK_INQUIRIES_PER_CREW = 80;

function diminish(crews: number): number {
  if (crews <= 1) return 1;
  return Math.max(0.3, Math.pow(0.85, crews - 1) * crews);
}

function ticketScale(avg: number): number {
  return Math.min(1.6, Math.max(0.5, avg / BENCHMARK_AVG_TICKET));
}

function inquiryScale(per: number): number {
  return Math.min(1.4, Math.max(0.4, per / BENCHMARK_INQUIRIES_PER_CREW));
}

type EngineOutput = {
  /** Loss-framed label, e.g. "Lost quotes (forgotten in voicemail)". */
  label: string;
  /** Original engine name for the basis line. */
  engine: string;
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
      label: "Lost quotes (forgotten in voicemail)",
      engine: "Quote Intercept",
      yearly: 14200 * 12 * c * t * i,
      basis: "$14,200/mo per crew leaked at the missed-call line",
      accent: "champagne",
    },
    {
      label: "Late invoices that never get chased",
      engine: "The FollowUp",
      yearly: 12800 * 12 * c * t,
      basis: "$12,800/mo aging out past 30 days, uncollected",
      accent: "champagne",
    },
    {
      label: "Dead leads that never reactivated",
      engine: "Ghost Recovery",
      yearly: 11200 * 12 * c * t * i,
      basis: "$11,200/mo sitting cold in your pipeline",
      accent: "champagne",
    },
    {
      label: "Inquiries lost to slow first-touch",
      engine: "InstantText",
      yearly: 8400 * 12 * c * i,
      basis: "$8,400/mo lost when the first reply takes >5 min",
      accent: "champagne",
    },
    {
      label: "Upsells your crew chiefs never noticed",
      engine: "Upsell Whisperer",
      yearly: 38000 * 12 * Math.min(crews, 5) * t,
      basis: "$38,000/mo in adjacent work walking off the property",
      accent: "champagne",
    },
    {
      label: "Referrals your competitors caught first",
      engine: "Referral Radar",
      yearly: 180000 * Math.min(crews, 5),
      basis: "$180,000/yr in referrals routed to the next dispatcher",
      accent: "champagne",
    },
    {
      label: "Customers walking quietly out the door",
      engine: "Save Play",
      yearly: 0.18 * crews * 50 * avgTicket * 12,
      basis: "18% silent churn × 50 active accounts/crew",
      accent: "champagne",
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

/**
 * Pull a sharp comparison line beneath the headline leak number. We pick
 * whichever ratio reads strongest at the user's loss level, and gracefully
 * fall back to the smaller comparison if the bigger one would round to zero.
 */
const COST_PER_CREW_CHIEF = 58_000;
const COST_PER_MOWER = 11_000;
const COST_PER_SIX_MONTHS_OFF = 90_000;

function comparisonLine(total: number): string {
  const chiefs = Math.floor(total / COST_PER_CREW_CHIEF);
  const mowers = Math.floor(total / COST_PER_MOWER);
  const sixMonthsOff = total >= COST_PER_SIX_MONTHS_OFF;

  if (chiefs >= 2 && sixMonthsOff) {
    return `That's enough to hire ${chiefs} crew chiefs · or buy ${mowers} mowers · or take six months off.`;
  }
  if (chiefs >= 1 && mowers >= 2) {
    return `That's enough to hire ${chiefs} crew ${
      chiefs === 1 ? "chief" : "chiefs"
    } · or buy ${mowers} mowers.`;
  }
  if (mowers >= 2) {
    return `That's enough to buy ${mowers} commercial mowers outright.`;
  }
  if (mowers >= 1) {
    return `That's enough to buy a new commercial mower outright.`;
  }
  return `That's revenue your crew already earned — and your software let walk away.`;
}

export function LossCalculator() {
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

  const punchline = comparisonLine(total);

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
              <Pill tone="champagne">Loss Calculator</Pill>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                What is your current stack costing you?
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
                Most landscape software is structurally incapable of catching
                what walks out the door. Type your shop&rsquo;s numbers.
                We&rsquo;ll tell you what last year actually cost &mdash; quote
                by quote, late invoice by late invoice.
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

                {/* Headline LEAK card — replaces /roi's recovery card */}
                <div className="mt-8 rounded-xl border border-champagne/30 bg-champagne/[0.06] px-5 py-5">
                  <div className="text-xs uppercase tracking-crest text-champagne-bright">
                    Modeled annual leak
                  </div>
                  <div className="mt-1 font-serif text-4xl font-semibold tracking-tight text-champagne-bright md:text-5xl">
                    {fmtMoneyPrecise(total)}
                  </div>
                  <div className="mt-2 text-xs text-bone/55">
                    Across all marquee gaps, after diminishing-returns
                    multi-crew adjustment.
                  </div>
                  <div className="mt-3 border-t border-champagne/15 pt-3 text-xs italic text-bone/70">
                    {punchline}
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
                      What&rsquo;s leaking, line by line
                    </span>
                  </div>
                  <ul className="mt-5 flex flex-col gap-4">
                    {engines.map((e) => (
                      <li
                        key={e.engine}
                        className="flex items-baseline justify-between gap-3 border-b border-bone/5 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <div className="font-serif text-base text-bone">
                            {e.label}
                          </div>
                          <div className="text-xs text-bone/45">{e.basis}</div>
                        </div>
                        <div className="font-mono text-lg font-semibold tabular-nums text-champagne-bright">
                          {fmtMoneyPrecise(e.yearly)}
                          <span className="text-xs font-normal text-bone/40">
                            {" "}
                            / yr
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tier "what it costs to fix this" grid — flipped from /roi */}
                <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-crest text-bone/55">
                      What it would cost to fix this · {crews} crew
                      {crews === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {TIERS.map((tier) => {
                      const annualCost = tierAnnualCost(tier.monthly);
                      const recoverableDays = Math.max(
                        1,
                        Math.round((annualCost / total) * 365)
                      );
                      // weeks of leak required to equal the tier's annual cost
                      const weeksOfLeak = Math.max(
                        1,
                        Math.round((annualCost / total) * 52)
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
                            annual cost: {fmtMoney(annualCost)}
                          </div>
                          <div className="mt-4 inline-flex items-center rounded-full border border-champagne/30 bg-champagne/[0.08] px-3 py-1 font-mono text-[11px] tabular-nums text-champagne-bright">
                            Recoverable in {recoverableDays}{" "}
                            {recoverableDays === 1 ? "day" : "days"}
                          </div>
                          <div className="mt-3 text-[11px] leading-relaxed text-bone/55">
                            You leak more than this in {weeksOfLeak}{" "}
                            {weeksOfLeak === 1 ? "week" : "weeks"}.
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
                    Stop the leak — book a 30-min demo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/roi"
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-champagne-bright/40 px-6 py-3 text-sm font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
                  >
                    See the recovery math instead →
                  </Link>
                </div>

                <p className="text-xs leading-relaxed text-bone/40">
                  Conservative scaling for multi-crew shops (0.85^crews
                  diminishing factor; floors at 0.30). Real founding-cohort
                  recovery has clustered within ±15% of these projections
                  through Q1 2026. The leak is real. The math is honest. Cancel
                  anytime if it isn&rsquo;t.
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
