import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Coins,
  Receipt,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BOOKS_MODULES } from "@/content/books-modules";

export const metadata: Metadata = {
  title:
    "Save Play · churn predicted 60 days out · +18% NRR",
  description:
    "Retention Intelligence for landscape ops. Six churn signals, save plays, NRR dashboard, LTV ledger. Customers don't ghost — they drift. We catch them before they're gone.",
  alternates: { canonical: "/retention" },
};

type Signal = {
  name: string;
  weight: string;
  detail: string;
  icon: typeof TrendingUp;
  accent: "moss" | "honey" | "champagne";
};

const SIGNALS: Signal[] = [
  {
    name: "Payment delays",
    weight: "/22",
    detail:
      "Days-late on the last three invoices. The first sign a relationship is fraying — usually 8–12 weeks before the cancel email. Books knows the moment Stripe flips a charge to past-due.",
    icon: Coins,
    accent: "champagne",
  },
  {
    name: "ToneRadar response decay",
    weight: "/18",
    detail:
      "40-word reply collapses to 3-word reply collapses to silence. ToneRadar reads the meta and fires the early-warning the moment a regular conversation thread goes terse.",
    icon: TrendingUp,
    accent: "champagne",
  },
  {
    name: "Seasonal lapse",
    weight: "/16",
    detail:
      "Mowing customer who&apos;s booked every spring for four years and went silent this March. Lapse detection fires against the customer&apos;s own historical pattern, not a generic calendar.",
    icon: BarChart3,
    accent: "champagne",
  },
  {
    name: "Service revenue trend",
    weight: "/16",
    detail:
      "Customer who used to spend $4,200/month is now spending $1,800. Books knows; Save Play surfaces it before the next renewal.",
    icon: Wallet,
    accent: "champagne",
  },
  {
    name: "Complaint frequency",
    weight: "/14",
    detail:
      "Two service complaints in a quarter is a leading indicator of churn. Cadence captures every NPS dip; Quality Radar captures every rework. Both feed the radar.",
    icon: Shield,
    accent: "moss",
  },
  {
    name: "Response-time decay",
    weight: "/14",
    detail:
      "Customer used to reply in 23 minutes; now replies in 3 days. The interaction-cadence drift is often the earliest signal — earlier than the payment delay.",
    icon: Users,
    accent: "champagne",
  },
];

type SaveStep = {
  day: string;
  label: string;
  body: string;
  accent: "moss" | "honey" | "champagne";
};

const SAVE_PLAY: SaveStep[] = [
  {
    day: "Day -60",
    label: "Detection",
    body: "Save Play fires on three or more signals crossing threshold. Confidence score generated. Customer flagged in the dispatcher dashboard with a save-play queue.",
    accent: "champagne",
  },
  {
    day: "Day -45",
    label: "First save touch",
    body: "Cadence sends a personalized check-in — referencing the customer&apos;s actual service history (Site Memory feed) and a soft inquiry about how the spring season is going.",
    accent: "champagne",
  },
  {
    day: "Day -30",
    label: "Personalized concession",
    body: "If the first touch lands flat, Cadence escalates: a service-line concession (free aeration with a renewal, a 15% credit toward winter cleanup, a one-visit upgrade) tailored to what this customer actually values.",
    accent: "moss",
  },
  {
    day: "Day -14",
    label: "Crew chief outreach",
    body: "If automation hasn&apos;t saved the relationship by Day -14, the crew chief who knows the property gets a calendar-blocked call to make. Human-to-human, with the full Site Memory context one tap away.",
    accent: "champagne",
  },
];

type Benchmark = {
  pct: string;
  label: string;
  body: string;
  accent: "moss" | "honey" | "champagne";
};

const BENCHMARKS: Benchmark[] = [
  {
    pct: "89%",
    label: "Median landscape NRR",
    body: "The shop down the street. Losing 11% of revenue every year before they even count new sales. That&apos;s the silent killer of small-shop economics.",
    accent: "champagne",
  },
  {
    pct: "105%",
    label: "Healthy shop NRR",
    body: "What good ops looks like — every cohort grows in revenue year-over-year through upsell and reactivation, even if a few customers churn. Save Play moves you here in two quarters.",
    accent: "champagne",
  },
  {
    pct: "118%",
    label: "Top-shop NRR",
    body: "The 90th-percentile crew. The customer base stacks 18% on retention alone — before a single new lead lands. This is the bar Save Play is built against.",
    accent: "moss",
  },
];

export default function RetentionPage() {
  const retentionModules = BOOKS_MODULES.filter(
    (m) => m.surface === "retention",
  );

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-obsidian py-28 md:py-36">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(127,226,122,0.10),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <Eyebrow tone="champagne">Save Play · Engine 32</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h1 className="mt-4 max-w-5xl font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                Customers don&apos;t ghost.{" "}
                <span className="text-moss-bright">They drift.</span>{" "}
                <span className="text-bone/55">Then they&apos;re gone.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mt-8 max-w-3xl space-y-5 text-lg text-bone/60 md:text-xl">
                <p>
                  The silent killer of landscape revenue isn&apos;t the angry
                  cancel email. It&apos;s the customer who quietly stops
                  booking the spring fert, who lets the auto-renew lapse
                  without saying why, who replies to the foreman&apos;s text
                  with one word instead of three. By the time the office
                  notices, the relationship is already gone — and the
                  next-door neighbor has a new sign in the yard.
                </p>
                <p>
                  Save Play watches every customer for the six churn
                  signals that actually predict the cancel: payment delays,
                  response-time decay, seasonal lapse, service-revenue trend,
                  complaint frequency, and ToneRadar interaction collapse.
                  When the score crosses threshold — usually sixty days before
                  the customer would actually cancel — the platform fires a
                  save play. Cadence sends a personalized check-in. The crew
                  chief gets a calendar-blocked call queued. The relationship
                  is rescued before it&apos;s broken.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <CtaButton href="/demo" variant="primary" size="lg">
                  See Save Play on a 30-min demo
                </CtaButton>
                <CtaButton href="/retention/demo" variant="ghost-champagne" withArrow>
                  Try the live sandbox
                </CtaButton>
                <CtaButton href="#signals" variant="ghost-champagne" withArrow>
                  Read the signals
                </CtaButton>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Pill tone="champagne">Engine 32 · Save Play</Pill>
                <Pill tone="champagne">Engine 33 · LTV Ledger</Pill>
                <Pill tone="moss">+18% NRR shipped</Pill>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Churn signals */}
        <section
          id="signals"
          className="border-b border-bone/10 bg-slate-deep py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Churn signals</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Six signals.{" "}
                  <span className="text-champagne-bright">
                    One confidence score.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Each signal is weighted, normalized to the customer&apos;s
                  own historical baseline, and scored against the cohort. The
                  combined output is a 0–100 churn-risk score. Anything above
                  72 fires the save play; anything above 88 escalates to the
                  crew chief in the same hour.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SIGNALS.map((s, i) => {
                const accentText =
                  s.accent === "honey"
                    ? "text-honey-bright"
                    : s.accent === "moss"
                      ? "text-moss-bright"
                      : "text-champagne-bright";
                const accentBorder =
                  s.accent === "honey"
                    ? "border-honey/30"
                    : s.accent === "moss"
                      ? "border-moss/30"
                      : "border-champagne/30";
                const Icon = s.icon;
                return (
                  <ScrollReveal key={s.name} delay={(i % 3) * 0.05}>
                    <article
                      className={`flex h-full flex-col rounded-2xl border ${accentBorder} bg-bone/[0.02] p-7`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentBorder} bg-bone/[0.03] ${accentText}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`font-mono text-xs font-semibold tracking-[0.16em] ${accentText}`}
                        >
                          {s.weight}
                        </span>
                      </div>
                      <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-bone">
                        {s.name}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                        {s.detail}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Save play timeline */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">The save play</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Sixty days early.{" "}
                  <span className="text-champagne-bright">
                    Four-touch rescue.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Once the score crosses threshold, the save play runs
                  automatically — but every touch is personalized from Site
                  Memory. The customer doesn&apos;t feel a save; they feel
                  cared for. The crew chief stays in the loop the whole time
                  and only gets pulled in if automation hasn&apos;t closed the
                  gap by Day -14.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 md:p-10">
                <div className="grid gap-6 md:grid-cols-4">
                  {SAVE_PLAY.map((step, i) => {
                    const accentText =
                      step.accent === "honey"
                        ? "text-honey-bright"
                        : step.accent === "moss"
                          ? "text-moss-bright"
                          : "text-champagne-bright";
                    const accentBorder =
                      step.accent === "honey"
                        ? "border-honey/30"
                        : step.accent === "moss"
                          ? "border-moss/30"
                          : "border-champagne/30";
                    const accentDot =
                      step.accent === "honey"
                        ? "bg-honey-bright"
                        : step.accent === "moss"
                          ? "bg-moss-bright"
                          : "bg-champagne-bright";
                    return (
                      <div key={step.day} className="relative">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2.5 w-2.5 flex-none rounded-full ${accentDot}`}
                          />
                          <span
                            className={`font-mono text-[10px] font-semibold uppercase tracking-[0.22em] ${accentText}`}
                          >
                            {step.day}
                          </span>
                        </div>
                        <div
                          className={`mt-4 rounded-xl border ${accentBorder} bg-bone/[0.02] p-5`}
                        >
                          <h3 className="font-serif text-lg font-semibold tracking-tight text-bone">
                            {step.label}
                          </h3>
                          <p className="mt-3 text-[13px] leading-[1.6] text-bone/65">
                            {step.body}
                          </p>
                        </div>
                        {i < SAVE_PLAY.length - 1 ? (
                          <div className="absolute right-[-12px] top-2 hidden md:block">
                            <ArrowRight className="h-4 w-4 text-bone/25" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* NRR dashboard mock */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Keeping-customers dashboard</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Keeping the customers you already have.{" "}
                  <span className="text-champagne-bright">
                    The only metric that matters.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Tracked monthly, broken out by segment, by service line, by
                  crew. The single dashboard the owner opens on Monday morning
                  before the operations huddle. Everything else is a story
                  about this number.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 rounded-2xl border border-bone/10 bg-obsidian/60 p-6 shadow-pop md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bone/10 pb-5">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/45">
                      Net revenue retention · trailing 12 months
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="font-serif text-5xl font-semibold tracking-tight text-champagne-bright md:text-6xl">
                        112.4%
                      </span>
                      <span className="rounded-full border border-moss/30 bg-moss/10 px-2.5 py-0.5 font-mono text-[11px] text-moss-bright">
                        +6.8 vs last yr
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {["3M", "6M", "12M", "ALL"].map((p) => (
                      <span
                        key={p}
                        className={
                          p === "12M"
                            ? "rounded-full border border-moss/30 bg-moss/10 px-3 py-1 font-mono text-[11px] text-moss-bright"
                            : "rounded-full border border-bone/15 bg-bone/[0.03] px-3 py-1 font-mono text-[11px] text-bone/55"
                        }
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mini SVG chart */}
                <svg
                  viewBox="0 0 800 220"
                  className="mt-6 w-full"
                  role="img"
                  aria-label="NRR trend chart showing growth from 89% to 112% across 12 months"
                >
                  <defs>
                    <linearGradient id="rt-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="rgba(127,226,122,0.4)" />
                      <stop offset="1" stopColor="rgba(127,226,122,0)" />
                    </linearGradient>
                  </defs>
                  {/* gridlines */}
                  {[40, 90, 140, 190].map((y) => (
                    <line
                      key={y}
                      x1="40"
                      x2="780"
                      y1={y}
                      y2={y}
                      stroke="rgba(244,243,238,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* threshold lines */}
                  <line
                    x1="40"
                    x2="780"
                    y1="160"
                    y2="160"
                    stroke="rgba(244,243,238,0.12)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="44"
                    y="155"
                    fontFamily="ui-sans-serif, system-ui"
                    fontSize="10"
                    fill="rgba(244,243,238,0.45)"
                  >
                    89% median
                  </text>
                  <line
                    x1="40"
                    x2="780"
                    y1="100"
                    y2="100"
                    stroke="rgba(245,191,89,0.32)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="44"
                    y="95"
                    fontFamily="ui-sans-serif, system-ui"
                    fontSize="10"
                    fill="rgba(245,191,89,0.85)"
                  >
                    105% healthy
                  </text>
                  {/* area */}
                  <path
                    d="M40,170 L100,164 L160,158 L220,148 L280,140 L340,128 L400,120 L460,110 L520,98 L580,90 L640,80 L700,70 L780,62 L780,200 L40,200 Z"
                    fill="url(#rt-area)"
                  />
                  {/* line */}
                  <path
                    d="M40,170 L100,164 L160,158 L220,148 L280,140 L340,128 L400,120 L460,110 L520,98 L580,90 L640,80 L700,70 L780,62"
                    fill="none"
                    stroke="rgba(127,226,122,1)"
                    strokeWidth="2.5"
                  />
                  {/* end dot */}
                  <circle cx="780" cy="62" r="4.5" fill="#7FE27A" />
                </svg>

                <div className="mt-6 grid gap-4 border-t border-bone/10 pt-6 text-[13px] text-bone/65 md:grid-cols-3">
                  <div>
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/45">
                      Mowing
                    </div>
                    <div className="mt-1.5 font-serif text-2xl text-champagne-bright">
                      118%
                    </div>
                    <div className="mt-1 text-bone/55">recurring backbone</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/45">
                      Fert programs
                    </div>
                    <div className="mt-1.5 font-serif text-2xl text-champagne-bright">
                      114%
                    </div>
                    <div className="mt-1 text-bone/55">multi-step contracts</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/45">
                      Hardscape
                    </div>
                    <div className="mt-1.5 font-serif text-2xl text-moss-bright">
                      96%
                    </div>
                    <div className="mt-1 text-bone/55">project-based, lumpy</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* LTV Ledger */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <ScrollReveal>
                <div>
                  <Eyebrow tone="champagne">LTV Ledger · Engine 33</Eyebrow>
                  <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                    True LTV.{" "}
                    <span className="text-champagne-bright">
                      Real cost. Real revenue.
                    </span>
                  </h2>
                  <p className="mt-5 text-lg text-bone/60">
                    Most landscape ops have never known what a customer is
                    actually worth. The acquisition cost is fuzzy, the cost to
                    serve gets averaged into a 30% margin assumption, and the
                    lifetime is a guess. LTV Ledger fixes all three: revenue
                    flows in from Books, cost-to-serve from Job Costing,
                    acquisition from the marketing attribution feed.
                  </p>
                  <ul className="mt-8 space-y-3 text-[14px] text-bone/70">
                    {[
                      "Per-customer LTV updated nightly · revenue minus real cost",
                      "Cohort survival curves · Q2-2025 vs Q2-2026 vs Q2-2027",
                      "Segment ROI · weekly mowing vs hardscape one-offs vs fert programs",
                      "Payback period by acquisition source · Google Ads vs door-knock vs referral",
                      "Plug into Books for the closing the loop on every dollar",
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <Receipt className="mt-0.5 h-4 w-4 flex-none text-champagne-bright" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl border border-bone/10 bg-slate-deep/60 p-6 shadow-pop md:p-8">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/45">
                    Cohort LTV · 24-month payback
                  </div>
                  <div className="mt-5 space-y-3.5">
                    {[
                      ["Weekly mowing", "$4,820", "9 mo", "champagne"],
                      ["Fert program (5-step)", "$3,640", "11 mo", "champagne"],
                      ["Annual maintenance contract", "$8,210", "14 mo", "champagne"],
                      ["Hardscape one-off", "$1,420", "Project", "moss"],
                      ["Snow contract", "$2,180", "1 season", "moss"],
                    ].map((row) => {
                      const dot =
                        row[3] === "moss"
                          ? "bg-moss-bright"
                          : "bg-champagne-bright";
                      const pill =
                        row[3] === "moss"
                          ? "rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 font-mono text-[10px] text-moss-bright"
                          : "rounded-full border border-champagne/30 bg-champagne/10 px-2 py-0.5 font-mono text-[10px] text-champagne-bright";
                      const amountCls =
                        row[3] === "moss"
                          ? "font-mono text-bone/85"
                          : "font-mono text-champagne-bright";
                      return (
                        <div
                          key={row[0]}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-bone/[0.06] pb-3.5 text-[13px]"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                            <span className="text-bone/85">{row[0]}</span>
                          </div>
                          <span className={amountCls}>{row[1]}</span>
                          <span className={pill}>{row[2]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-lg border border-bone/10 bg-bone/[0.03] p-3 font-mono text-[11px] text-bone/60">
                    <span className="text-champagne-bright">Insight:</span> the
                    annual maintenance contract has 1.7x the LTV of weekly
                    mowing — but only if the cohort retains past month 14.
                    Save Play makes that bet bankable.
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Benchmarks */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Benchmarks</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Three numbers.{" "}
                  <span className="text-champagne-bright">
                    Where do you stand?
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  We&apos;ve aggregated NRR data across hundreds of landscape
                  shops in the GladiusTurf ecosystem and our sister products.
                  Three benchmarks emerge — the median, the healthy line, and
                  the top-shop ceiling. Save Play is the apparatus that
                  moves you up the curve.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {BENCHMARKS.map((b, i) => {
                const accentText =
                  b.accent === "honey"
                    ? "text-honey-bright"
                    : b.accent === "moss"
                      ? "text-moss-bright"
                      : "text-champagne-bright";
                const accentBorder =
                  b.accent === "honey"
                    ? "border-honey/30"
                    : b.accent === "moss"
                      ? "border-moss/30"
                      : "border-champagne/30";
                return (
                  <ScrollReveal key={b.label} delay={i * 0.08}>
                    <article
                      className={`h-full rounded-2xl border ${accentBorder} bg-gradient-to-b from-bone/[0.03] to-transparent p-8 text-center`}
                    >
                      <div
                        className={`font-serif text-6xl font-semibold tracking-tight md:text-7xl ${accentText}`}
                      >
                        {b.pct}
                      </div>
                      <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-bone/85">
                        {b.label}
                      </div>
                      <p className="mt-3 text-[13px] leading-[1.65] text-bone/55">
                        {b.body}
                      </p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal delay={0.2}>
              <div className="mt-12 text-center text-bone/65">
                <p className="mx-auto max-w-2xl text-[15px] leading-[1.65]">
                  We move shops up the curve. Median customers who install
                  Save Play see <span className="text-moss-bright">+18 percentage points of NRR</span> within
                  two quarters — without a sales hire, without a discount
                  reset, without a new ad budget.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Modules */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Retention modules</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Three modules.{" "}
                  <span className="text-champagne-bright">
                    One number that matters.
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {retentionModules.map((m, i) => (
                <ScrollReveal key={m.slug} delay={(i % 3) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <h3 className="font-serif text-xl font-semibold tracking-tight text-bone">
                      {m.name}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                      {m.description}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.15}>
              <div className="mt-12 text-center">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-1.5 text-sm text-lime-bright transition-colors hover:text-lime"
                >
                  See Books · the ledger underneath
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
