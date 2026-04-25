import type { Metadata } from "next";
import {
  Award,
  BarChart3,
  ChevronRight,
  Repeat,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "LRI Score — The 0–100 metric every crew lives by.",
  description:
    "Landscaping Revenue Intelligence. One score. Five subscores. Benchmark your shop against your peer cohort. Portable across employers.",
};

type Subscore = {
  name: string;
  weight: string;
  blurb: string;
  source: string;
  icon: typeof TrendingUp;
  tone: "moss" | "honey";
};

const SUBSCORES: Subscore[] = [
  {
    name: "Win Rate",
    weight: "/25",
    blurb:
      "Percentage of quotes that close. Adjusted for service type, ZIP comps, and the season the bid went out in.",
    source: "Source · Quote Intercept",
    icon: Target,
    tone: "moss",
  },
  {
    name: "On-Time Rate",
    weight: "/20",
    blurb:
      "Crew arrival on or before the promised window. Verified by the Field Crew App's GPS clock-in — not a self-report.",
    source: "Source · Field Crew App",
    icon: TrendingUp,
    tone: "honey",
  },
  {
    name: "Customer Satisfaction",
    weight: "/20",
    blurb:
      "Post-service NPS captured by the Cadence engine. Verified through the customer portal — no review-site scraping.",
    source: "Source · Cadence",
    icon: Sparkles,
    tone: "moss",
  },
  {
    name: "Safety",
    weight: "/15",
    blurb:
      "Days without incident. Pesticide compliance audits. Heat-stress windows respected. Trailer pre-trip checks logged.",
    source: "Source · Safety Shield",
    icon: Shield,
    tone: "honey",
  },
  {
    name: "Repeat Rate",
    weight: "/20",
    blurb:
      "Percentage of customers who book a second service. The truest signal in the score — operations don't fake retention.",
    source: "Source · Cortex outcome graph",
    icon: Repeat,
    tone: "moss",
  },
];

type View = {
  label: string;
  title: string;
  body: string;
  score: number;
  caption: string;
  tone: "moss" | "honey";
};

const VIEWS: View[] = [
  {
    label: "Shop LRI",
    title: "Your company's score.",
    body: "Updates nightly. Compares to your peer cohort — shops in your revenue band, with your service mix, in your region. The single number every crew owner asks about first on a demo call.",
    score: 82,
    caption: "Shop · 73rd percentile",
    tone: "moss",
  },
  {
    label: "Crew LRI",
    title: "Each crew chief's score.",
    body: "Visible to ops. Used in performance reviews. Used in routing decisions. Used to set this season's bonus pool. Most importantly — portable. If a crew chief moves shops, the score moves with them.",
    score: 88,
    caption: "Crew chief · top decile",
    tone: "honey",
  },
  {
    label: "Property LRI",
    title: "Even the property gets one.",
    body: "Properties are scored on revenue potential, risk profile, and upsell history. The property LRI quietly drives crew assignment — high-value lots go to high-LRI crew chiefs. The customer never sees it. The dispatcher always does.",
    score: 74,
    caption: "Property · upsell-rich",
    tone: "moss",
  },
];

type DataSource = {
  source: string;
  arrow: string;
  feedsInto: string;
};

const SOURCES: DataSource[] = [
  {
    source: "Quote Intercept + Win Rate logs",
    arrow: "→",
    feedsInto: "Win Rate subscore",
  },
  {
    source: "Field Crew App GPS",
    arrow: "→",
    feedsInto: "On-Time subscore",
  },
  {
    source: "Cadence feedback responses",
    arrow: "→",
    feedsInto: "Customer Sat subscore",
  },
  {
    source: "Safety Shield + applicator logs",
    arrow: "→",
    feedsInto: "Safety subscore",
  },
  {
    source: "Repeat customer detection",
    arrow: "→",
    feedsInto: "Repeat Rate subscore",
  },
  {
    source: "Cortex outcome labeler",
    arrow: "→",
    feedsInto: "Nightly recalculation",
  },
];

type Faq = { q: string; a: string };

const FAQ: Faq[] = [
  {
    q: "How is LRI different from a Yelp or Google rating?",
    a: "Yelp scores customer impressions filtered by who bothers to review. LRI scores actual operational outcomes — quotes won, arrivals on time, repeat rate — using internal verified data. Customers see Yelp; operators look at LRI.",
  },
  {
    q: "Can I see another shop's LRI?",
    a: "No. Cohort comparisons are anonymized. You see your percentile in the cohort, not the score of any specific shop next to you.",
  },
  {
    q: "How often is the score updated?",
    a: "Nightly. We replay the last 24 hours of operational events through the scoring model, persist the new score, and run Cortex against any subscore that dropped more than two points.",
  },
  {
    q: "Can I dispute a subscore?",
    a: "Yes. Every score is backed by a source-event log. Click any subscore on your shop dashboard to see the events that produced it. Disputes route into a five-day review window with a human in the loop.",
  },
  {
    q: "Will the LRI be public?",
    a: "Optionally. Some shops want their LRI on their website (\"LRI: 89 verified by GladiusTurf\") — like a Better Business Bureau seal. We support a verified embed for shops scoring 75 or higher.",
  },
  {
    q: "What's the score scale of acceptability?",
    a: "70+ is healthy. 80+ is strong. 90+ is rare. Industry median is currently 56 based on early cohort data — most shops have never had a number to look at.",
  },
];

// Big circular progress ring used in the hero.
function ScoreRingHero({ value }: { value: number }) {
  const size = 360;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(245,241,232,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#9DFF8A"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/50">
          LRI Score
        </p>
        <p className="mt-3 font-mono text-[140px] leading-none text-bone">
          {value}
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-honey-bright">
          +4 last 30 days
        </p>
      </div>
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(157,255,138,0.18),transparent_65%)]"
      />
    </div>
  );
}

// Compact ring used in view cards.
function ScoreRingMini({
  value,
  tone,
}: {
  value: number;
  tone: "moss" | "honey";
}) {
  const size = 140;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = tone === "honey" ? "#F4CC85" : "#9DFF8A";
  return (
    <div className="relative h-[140px] w-[140px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(245,241,232,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-4xl text-bone">{value}</span>
      </div>
    </div>
  );
}

// Stylized percentile distribution used in the cohort section.
function CohortChart() {
  const bars = [
    4, 7, 11, 16, 22, 30, 40, 52, 64, 73, 78, 75, 64, 50, 36, 24, 14, 8,
  ];
  const max = Math.max(...bars);
  return (
    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
      <div className="flex items-end justify-between gap-1.5">
        {bars.map((v, i) => {
          const isYou = i === 12;
          const h = (v / max) * 180;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${h}px`,
                  background: isYou ? "#9DFF8A" : "rgba(245,241,232,0.10)",
                  boxShadow: isYou
                    ? "0 -10px 30px -10px rgba(157,255,138,0.6)"
                    : undefined,
                }}
              />
              {isYou ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-moss-bright">
                  you
                </span>
              ) : (
                <span className="h-[14px]" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-bone/10 pt-5 text-[11px] font-mono uppercase tracking-[0.2em] text-bone/50">
        <span>0th pct</span>
        <span className="text-moss-bright">73rd pct · on-time rate</span>
        <span>100th pct</span>
      </div>
    </div>
  );
}

function CrewPassport() {
  return (
    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
      <div className="flex items-center justify-between border-b border-bone/10 pb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-bone/50">
            Crew Passport
          </p>
          <p className="mt-2 font-serif text-2xl text-bone">
            Crew Chief · placeholder
          </p>
          <p className="mt-1 text-sm text-bone/60">9 seasons · ATL metro</p>
        </div>
        <ScoreRingMini value={91} tone="moss" />
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-bone/50">
          Shop history
        </p>
        <ul className="mt-3 space-y-2 font-mono text-sm text-bone/70">
          <li className="flex justify-between">
            <span>Acme Lawns · 2022–2024</span>
            <span className="text-bone/40">LRI 84</span>
          </li>
          <li className="flex justify-between">
            <span>Greenline Co · 2024–2025</span>
            <span className="text-bone/40">LRI 88</span>
          </li>
          <li className="flex justify-between">
            <span>Current shop · 2025–</span>
            <span className="text-moss-bright">LRI 91</span>
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-bone/50">
          Strengths
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="moss">On-time 96%</Pill>
          <Pill tone="honey">Repeat 71%</Pill>
          <Pill tone="moss">Zero incidents</Pill>
          <Pill tone="honey">Upsell rate 2.1×</Pill>
        </div>
      </div>
    </div>
  );
}

export default function ScorePage() {
  return (
    <div className="bg-forest-deep">
      <Nav />

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-forest-deep py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(157,255,138,0.10),transparent_65%)]"
        />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <ScrollReveal>
                <Eyebrow tone="moss">LRI Score · Beta</Eyebrow>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <h1 className="mt-6 font-serif text-6xl leading-[1.0] tracking-[-0.02em] text-bone md:text-8xl">
                  Your shop is a number.
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-8 max-w-xl text-xl text-bone/60 md:text-2xl">
                  0–100. Updated nightly. Rolls up from every quote, every job,
                  every photo, every signature, every customer reply. The first
                  time landscaping has had a credit score.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <CtaButton href="/demo" size="lg">
                    Book a demo
                  </CtaButton>
                  <a
                    href="#methodology"
                    className="group inline-flex items-center gap-1.5 text-base font-medium text-bone/70 transition-colors hover:text-moss-bright"
                  >
                    See methodology
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.2}>
              <ScoreRingHero value={82} />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. METHODOLOGY — five subscores */}
      <section id="methodology" className="bg-forest-mid py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="moss">Methodology</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
              Five subscores. One number.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg text-bone/60">
              Each subscore is weighted by how directly it predicts revenue
              survival. The five add to 100. None of them are vanity metrics —
              every one is sourced from a system of record we already run.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {SUBSCORES.map((s, i) => {
              const Icon = s.icon;
              const accent =
                s.tone === "honey" ? "text-honey-bright" : "text-moss-bright";
              return (
                <ScrollReveal key={s.name} delay={0.05 + i * 0.05}>
                  <div className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <div className="flex items-center justify-between">
                      <Icon className={`h-5 w-5 ${accent}`} />
                      <span className="font-mono text-2xl text-bone">
                        {s.weight}
                      </span>
                    </div>
                    <h3 className="mt-6 font-serif text-2xl tracking-[-0.01em] text-bone">
                      {s.name}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-[1.6] text-bone/60">
                      {s.blurb}
                    </p>
                    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
                      {s.source}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. THREE VIEWS */}
      <section className="bg-forest-deep py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="honey">Views</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
              Same score, three lenses.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg text-bone/60">
              The LRI rolls up from individual events all the way to a single
              shop number — but you can pull any layer in between.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {VIEWS.map((v, i) => (
              <ScrollReveal key={v.label} delay={0.05 + i * 0.07}>
                <div className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
                        {v.label}
                      </p>
                      <h3 className="mt-3 font-serif text-3xl tracking-[-0.01em] text-bone">
                        {v.title}
                      </h3>
                    </div>
                    <ScoreRingMini value={v.score} tone={v.tone} />
                  </div>
                  <p className="mt-6 flex-1 text-base leading-[1.6] text-bone/60">
                    {v.body}
                  </p>
                  <p
                    className={`mt-6 font-mono text-[11px] uppercase tracking-[0.2em] ${
                      v.tone === "honey"
                        ? "text-honey-bright"
                        : "text-moss-bright"
                    }`}
                  >
                    {v.caption}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PEER COHORT */}
      <section className="bg-forest-mid py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="moss">Cohort</Eyebrow>
          </ScrollReveal>

          <div className="mt-4 grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <ScrollReveal delay={0.05}>
                <h2 className="font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
                  Anonymous peer benchmarking. The mirror landscape ops never
                  had.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-8 text-lg leading-[1.65] text-bone/60">
                  Every shop is bucketed into a peer cohort by revenue band,
                  region, and service mix. Your scores tell you exactly where
                  you sit — for example, &ldquo;Your On-Time Rate is at the
                  73rd percentile of $1M–$3M shops in the Southeast.&rdquo; The
                  cohort
                  refreshes every quarter as new shops join.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="mt-5 text-lg leading-[1.65] text-bone/60">
                  Anonymized end-to-end. No shop sees another shop&rsquo;s
                  name.
                  Cohort math runs on aggregated, hashed data — your numbers
                  contribute to the picture, but your name never leaves your
                  tenant.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="mt-8 flex flex-wrap gap-2">
                  <Pill tone="moss">Revenue band</Pill>
                  <Pill tone="honey">Region</Pill>
                  <Pill tone="moss">Service mix</Pill>
                  <Pill tone="honey">Quarterly refresh</Pill>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15}>
              <CohortChart />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. CORTEX ACTION ENGINE */}
      <section className="bg-forest-deep py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="lime">Cortex</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
              Score drops? We don&rsquo;t just tell you. We tell you what to
              fix.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-6 max-w-3xl text-lg leading-[1.65] text-bone/60">
              The LRI feeds Cortex — the autonomous hypothesis engine borrowed
              from the Gladius CRM lineage. When a subscore drops more than two
              points in fourteen days, Cortex doesn&rsquo;t ping you with a
              chart. It
              auto-detects the cause, runs the math against every adjacent
              event stream, and proposes a specific fix. You approve. Then it
              ripens into a workflow change.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-12 rounded-2xl border border-moss/30 bg-moss/[0.04] p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-moss-bright">
                Cortex hypothesis · 04:12 AM
              </p>
              <p className="mt-4 font-serif text-2xl leading-[1.4] text-bone md:text-3xl">
                &ldquo;On-Time Rate dropped 6 pts in the last 14 days. Crew
                B&rsquo;s average GPS arrival is{" "}
                <span className="text-honey-bright">18 minutes late</span> vs.
                a 4-minute baseline. Suggested fix: review Crew B&rsquo;s
                morning route start window and re-check the depot fuel
                stop.&rdquo;
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button className="rounded-full bg-lime-bright px-5 py-2.5 text-sm font-semibold text-forest-deep shadow-cta">
                  Approve fix
                </button>
                <button className="rounded-full border border-bone/20 px-5 py-2.5 text-sm font-medium text-bone/70">
                  Show me the events
                </button>
                <button className="rounded-full border border-bone/10 px-5 py-2.5 text-sm font-medium text-bone/50">
                  Dismiss
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Score drops",
                body: "Nightly recalculation flags any subscore that dropped more than two points in a fourteen-day window.",
                icon: BarChart3,
              },
              {
                step: "02",
                title: "Cortex hypothesizes",
                body: "The engine inspects adjacent event streams — GPS, applicator logs, cadence replies — and assembles the most likely cause.",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Admin approves",
                body: "You see the proposal, the math behind it, and the events that produced it. One click ripens the suggestion into a routing or coaching change.",
                icon: Award,
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={s.step} delay={0.05 + i * 0.07}>
                  <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm text-honey-bright">
                        {s.step}
                      </p>
                      <Icon className="h-5 w-5 text-moss-bright" />
                    </div>
                    <h3 className="mt-5 font-serif text-2xl tracking-[-0.01em] text-bone">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.65] text-bone/60">
                      {s.body}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PORTABILITY */}
      <section className="bg-forest-mid py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="honey">Portable</Eyebrow>
          </ScrollReveal>

          <div className="mt-4 grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <ScrollReveal delay={0.05}>
                <h2 className="font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
                  When a crew chief leaves, their score travels.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-8 text-lg leading-[1.65] text-bone/60">
                  The Crew LRI is the chief&rsquo;s score, not the shop&rsquo;s.
                  If they change employers, they bring their LRI with them —
                  with the previous shop&rsquo;s anonymized cohort data
                  attached for context.
                  No hand-wave references. No résumé lies. Just the verified
                  number.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="mt-5 text-lg leading-[1.65] text-bone/60">
                  High-LRI crew chiefs become a marketplace. Premium shops bid
                  for them. Excellence becomes liquid. Solving the labor
                  shortage starts with making excellence portable — not with
                  one more recruiting funnel.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15}>
              <CrewPassport />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. DATA SOURCES */}
      <section className="bg-forest-deep py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="moss">Sources</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
              Where the score comes from.
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map((s, i) => (
              <ScrollReveal key={s.source} delay={0.04 + i * 0.04}>
                <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                  <p className="font-serif text-xl tracking-[-0.01em] text-bone">
                    {s.source}
                  </p>
                  <p className="mt-3 font-mono text-sm text-moss-bright">
                    {s.arrow} {s.feedsInto}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="mt-12 max-w-3xl text-base leading-[1.7] text-bone/50">
              Your data, your score, your control. Exportable any time as CSV
              or JSON. We never sell, share, or train external models on it.
              The cohort math runs on aggregated, hashed signals — your raw
              data never leaves your tenant.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="bg-forest-mid py-28">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <Eyebrow tone="honey">FAQ</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-bone md:text-6xl">
              The questions every owner asks first.
            </h2>
          </ScrollReveal>

          <div className="mt-12 max-w-4xl divide-y divide-bone/10 border-y border-bone/10">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group py-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-6 text-left">
                  <span className="font-serif text-xl tracking-[-0.01em] text-bone md:text-2xl">
                    {item.q}
                  </span>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-moss-bright transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-4 max-w-3xl text-base leading-[1.7] text-bone/60">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <CtaBand />

      <Footer />
    </div>
  );
}
