import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileWarning,
  Phone,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { WaitlistForm } from "@/components/vertical/WaitlistForm";

export const metadata: Metadata = {
  title: {
    absolute:
      "GladiusTurf for Landscaping — Stop losing $232K a year to your software",
  },
  description:
    "Software for lawn maintenance and landscape companies. Answers the phones, rescues dead quotes, chases late invoices, and surfaces upsells your crew walks past. Per-crew pricing, 30-day money-back.",
  alternates: { canonical: "/landscaping" },
};

// ─── Problem cards ────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    icon: <Phone className="h-4 w-4 text-moss-bright" aria-hidden />,
    title: "Voicemail is a graveyard",
    body: "Every after-hours call that goes to voicemail is a quote your competitor will answer in the morning. Most shops lose 3–5 jobs a week this way.",
  },
  {
    icon: <Clock className="h-4 w-4 text-honey-bright" aria-hidden />,
    title: "Quotes expire before you call back",
    body: "A 24-hour-old quote closes at half the rate of a same-day follow-up. Your stack has no mechanism to rescue them automatically.",
  },
  {
    icon: <TrendingDown className="h-4 w-4 text-moss-bright" aria-hidden />,
    title: "Invoices age into write-offs",
    body: "Day 30 unpaid is normal. Day 60 is a negotiation. Day 90 is a loss. Without automated escalation, your office eats the soft conversations.",
  },
  {
    icon: <Sparkles className="h-4 w-4 text-honey-bright" aria-hidden />,
    title: "Crews don't upsell — they mow",
    body: "The aeration window, the mulch refresh, the drainage flag your lead saw on the truck. Gone. No system prompted the quote, so no quote was sent.",
  },
  {
    icon: <CalendarClock className="h-4 w-4 text-moss-bright" aria-hidden />,
    title: "Scheduling is a group text",
    body: "Three crews, two foremen, and a shared iPhone calendar. One reschedule cascades into four angry customers and a half-day of calls to fix it.",
  },
  {
    icon: <FileWarning className="h-4 w-4 text-honey-bright" aria-hidden />,
    title: "Your referral engine is word of mouth and luck",
    body: "Happy customers refer people. But without a timed ask — 48 hours post-service, NOAA-timed, personalized — you're leaving the best leads to chance.",
  },
];

// ─── Solution engine blocks ───────────────────────────────────────────────────

type EngineBlock = {
  pillTone: "moss" | "honey";
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
  proof: string;
  flip: boolean;
};

const ENGINES: EngineBlock[] = [
  {
    pillTone: "moss",
    eyebrow: "Quote Intercept",
    headline: "The voicemail you never returned just became revenue.",
    body: "Every quote that lands after hours, every callback nobody made, every estimate that aged past 24 hours — Intercept captures it, transcribes it, and re-engages the prospect before a competitor calls them back.",
    bullets: [
      "After-hours voicemails transcribed and routed in 30s",
      "Stale quotes auto-rescued before they age out",
      "Ghosted prospects re-engaged with a personal SMS",
    ],
    proof: "Modeled recovery: ~$14,200/mo from a typical pipeline audit.",
    flip: false,
  },
  {
    pillTone: "honey",
    eyebrow: "The FollowUp",
    headline: "Late invoices have a due date. Yours just moved.",
    body: "Post-service check-ins fire within six hours. Late-invoice nudges warm before they escalate — Day 3, Day 7, Day 14, then a human handoff with full context. Every message reads like the owner wrote it.",
    bullets: [
      "Day 3 / Day 7 / Day 14 warm escalation",
      "Late-invoice follow-up recovers $12,800/mo on average",
      "Human handoff with full thread when automation hands off",
    ],
    proof: "Modeled outcome: ~$12,800/mo recovered in late invoices.",
    flip: true,
  },
  {
    pillTone: "moss",
    eyebrow: "Upsell Whisperer",
    headline: "Every property already has the next sale on it.",
    body: "Whisperer scans every site every visit — aeration windows, mulch refresh, drainage red flags. Crews see the punch-list before they pull off the truck. Clients get a 1-tap approve link tied to the next visit.",
    bullets: [
      "Visual scoring of every site, every visit",
      "Crew gets punch-list, client gets 1-tap approve",
      "Upsell revenue tied to next visit, not next quarter",
    ],
    proof: "Modeled upside: ~$38,000/mo in surfaced upsell revenue.",
    flip: false,
  },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    number: "01",
    heading: "Sign the contract Friday",
    body: "We get access credentials and pull your existing customer list. No data entry, no CSV import by you.",
  },
  {
    number: "02",
    heading: "Founder-led setup call Monday",
    body: "Ricardo or Joshua walks your crew chief through the Field App in 20 minutes. We configure your zones, pricing, and follow-up cadences.",
  },
  {
    number: "03",
    heading: "Live by Wednesday, recovering revenue by Thursday",
    body: "The engines run in the background. You run the business.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandscapingPage() {
  return (
    <>
      <Nav />

      <main id="main-content">
        {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-pitch py-28 md:py-36">
          {/* Champagne radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(ellipse at center, #D4B27A 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-5xl px-6">
            <ScrollReveal>
              {/* Eyebrow */}
              <p className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
                Software for lawn &amp; landscape companies
              </p>

              {/* H1 */}
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.07] tracking-[-0.025em] text-bone md:text-6xl lg:text-7xl">
                Quotes rotting in voicemail.
                <br />
                Invoices aging past 30 days.
                <br />
                <span className="text-moss-bright">
                  Your software built that problem.
                </span>
              </h1>

              {/* Subhead */}
              <p className="mt-7 max-w-2xl text-lg leading-[1.6] text-bone/70">
                GladiusTurf answers the calls, sends the quotes, dispatches the
                crews, and chases the money. Every forgotten lead and late
                invoice your current stack lets walk — stopped.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-6 py-3.5 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:shadow-cta-hover"
                >
                  Book a 30-min demo
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/#leak"
                  className="text-sm text-bone/60 underline underline-offset-4 transition-colors hover:text-bone/85"
                >
                  or see your number first ↓
                </Link>
              </div>

              {/* Risk reversal */}
              <p className="mt-5 text-[12px] font-medium uppercase tracking-crest text-bone/40">
                30-day money-back · per-crew pricing · switch in 48 hours
              </p>
            </ScrollReveal>

            {/* Hero stats */}
            <ScrollReveal delay={0.12}>
              <div className="mt-14 grid grid-cols-1 gap-6 border-t border-bone/10 pt-10 sm:grid-cols-3">
                {[
                  {
                    stat: "$232K",
                    label:
                      "average annual leak per shop from missed quotes, late invoices, and silent churn",
                  },
                  {
                    stat: "23%",
                    label:
                      "of inbound quotes never get a follow-up call — your competitor makes that call instead",
                  },
                  {
                    stat: "48 hrs",
                    label:
                      "from signed contract to live engines, founder-led onboarding",
                  },
                ].map((item) => (
                  <div key={item.stat} className="flex flex-col gap-2">
                    <span className="font-serif text-4xl font-semibold tracking-[-0.02em] text-moss-bright md:text-5xl">
                      {item.stat}
                    </span>
                    <p className="text-[13px] leading-[1.5] text-bone/55">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Section 2: Problem ──────────────────────────────────────────── */}
        <section className="border-y border-bone/10 bg-obsidian py-24 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal>
              <h2 className="max-w-3xl font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                The same six problems ending every landscape company's growth
                story.
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
              {PROBLEMS.map((p, i) => (
                <ScrollReveal key={p.title} delay={(i % 2) * 0.06}>
                  <article className="flex h-full flex-col gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 transition-colors hover:border-bone/20">
                    <div className="flex items-center gap-3">
                      {p.icon}
                      <h3 className="text-[17px] font-semibold leading-snug text-bone">
                        {p.title}
                      </h3>
                    </div>
                    <p className="text-[14px] leading-[1.65] text-bone/65">
                      {p.body}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Solution (alternating engine blocks) ─────────────── */}
        <section className="bg-slate-deep py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal>
              <div className="text-center">
                <Eyebrow tone="champagne">The engines</Eyebrow>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                  Three engines. Each one is a specific number going into your
                  account.
                </h2>
              </div>
            </ScrollReveal>

            <div className="mt-16 flex flex-col gap-20">
              {ENGINES.map((engine, idx) => (
                <ScrollReveal key={engine.eyebrow} delay={0.06}>
                  <div
                    className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${
                      engine.flip ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    {/* Text column */}
                    <div className="flex flex-col gap-5">
                      <Pill tone={engine.pillTone}>{engine.eyebrow}</Pill>
                      <h3 className="font-serif text-2xl font-semibold leading-[1.25] tracking-[-0.015em] text-bone md:text-3xl">
                        {engine.headline}
                      </h3>
                      <p className="text-[15px] leading-[1.65] text-bone/70">
                        {engine.body}
                      </p>
                      <ul className="flex flex-col gap-3">
                        {engine.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-3">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 flex-none text-moss-bright"
                              aria-hidden
                            />
                            <span className="text-[14px] text-bone/75">{b}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Proof badge */}
                      <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-champagne/25 bg-champagne/5 px-4 py-2">
                        <span className="text-[12px] font-medium text-champagne-bright">
                          {engine.proof}
                        </span>
                      </div>
                    </div>

                    {/* Visual column — minimal mock card */}
                    <div
                      className={`flex items-center justify-center rounded-2xl border border-bone/10 bg-pitch/60 p-8 ${
                        idx === 0
                          ? "min-h-[260px]"
                          : idx === 1
                            ? "min-h-[260px]"
                            : "min-h-[260px]"
                      }`}
                    >
                      {idx === 0 && <QuoteInterceptMock />}
                      {idx === 1 && <FollowUpMock />}
                      {idx === 2 && <WhispererMock />}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: Social proof / honest count ──────────────────────── */}
        <section className="bg-pitch py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <ScrollReveal>
              <div className="rounded-2xl border border-champagne/25 bg-champagne/[0.04] p-10 text-center">
                <p className="font-serif text-xl font-semibold text-bone md:text-2xl">
                  1 paying customer · Bright Lights Landscape Lighting ·
                  Sarasota, FL · 22 days live
                </p>
                <p className="mx-auto mt-5 max-w-xl text-[14px] leading-[1.65] text-bone/60">
                  We'd rather tell you the honest count than dress up a list.
                  The engines are live. The math is conservative. The refund is
                  real.
                </p>
                <Link
                  href="/demo"
                  className="group mt-7 inline-flex items-center gap-2 rounded-full bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:shadow-cta-hover"
                >
                  Book a 30-minute demo
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Section 5: How it works ─────────────────────────────────────── */}
        <section className="border-y border-bone/10 bg-obsidian py-24 md:py-28">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <div className="text-center">
                <Eyebrow tone="moss">How it works</Eyebrow>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                  Live in 48 hours. No IT project.
                </h2>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
              {HOW_STEPS.map((step, i) => (
                <ScrollReveal key={step.number} delay={i * 0.08}>
                  <div className="flex flex-col gap-4">
                    <span className="font-geist-mono text-xs font-semibold uppercase tracking-crest text-moss-bright/60">
                      {step.number}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-bone">
                      {step.heading}
                    </h3>
                    <p className="text-[14px] leading-[1.65] text-bone/60">
                      {step.body}
                    </p>
                    {i < HOW_STEPS.length - 1 && (
                      <div className="hidden h-px bg-bone/10 md:block" />
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 6: Lead form ─────────────────────────────────────────── */}
        <section
          id="landscaping-form"
          className="scroll-mt-20 bg-slate-deep py-24 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
              {/* Left: pitch */}
              <ScrollReveal>
                <div className="flex flex-col gap-6">
                  <Eyebrow tone="champagne">Book a demo</Eyebrow>
                  <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                    Get a 30-minute demo. Walk away with a free pipeline audit.
                  </h2>
                  <ul className="flex flex-col gap-4">
                    {[
                      "Real call from Ricardo or Joshua. No SDR.",
                      "One business day response. Not a drip sequence.",
                      "If it doesn't recover more than it costs in 30 days, full refund.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 flex-none text-moss-bright"
                          aria-hidden
                        />
                        <span className="text-[15px] leading-[1.6] text-bone/75">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              {/* Right: form */}
              <ScrollReveal delay={0.08}>
                <WaitlistForm
                  vertical="landscape"
                  submitLabel="Book my demo"
                  footnote="We respond to every request within one business day."
                  successHeader="You're booked."
                  successBody="A founder will text you within the hour to lock the time. We'll run a free pipeline audit on the call."
                />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Section 7: Footer CTA band ──────────────────────────────────── */}
        <section className="border-t border-bone/10 bg-pitch py-20 md:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <ScrollReveal>
              <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                Stop leaving $232K on the table.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-[1.65] text-bone/60">
                Every week without GladiusTurf is a week of quotes rotting in
                voicemail, invoices aging past 30 days, and upsells your crew
                walked past.
              </p>
              <Link
                href="/demo"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-sm font-semibold text-forest-deep shadow-cta transition-all hover:shadow-cta-hover"
              >
                Book a 30-minute demo
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ─── Engine mock components (inline, no "use client" needed) ──────────────────

function QuoteInterceptMock() {
  const entries = [
    {
      time: "9:42 PM",
      name: "Mike H.",
      status: "Rescued",
      note: "Backyard re-sod quote · $3,200",
      color: "text-moss-bright",
      dot: "bg-moss-bright",
    },
    {
      time: "6:17 PM",
      name: "Tanya R.",
      status: "Routed",
      note: "Spring cleanup · voicemail → SMS in 28s",
      color: "text-honey-bright",
      dot: "bg-honey-bright",
    },
    {
      time: "11:55 AM",
      name: "Carlos M.",
      status: "Rescued",
      note: "24h stale quote · re-engaged · booked",
      color: "text-moss-bright",
      dot: "bg-moss-bright",
    },
  ];
  return (
    <div className="w-full max-w-sm rounded-xl bg-forest-deep/70 p-5 text-left">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-serif text-sm font-semibold text-moss-bright">
          Quote Intercept · Live
        </span>
        <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-crest text-moss-bright">
          3 today
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {entries.map((e) => (
          <li key={e.name} className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${e.dot}`}
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-semibold text-bone">
                  {e.name}
                </span>
                <span className={`text-[10px] font-medium ${e.color}`}>
                  {e.status}
                </span>
              </div>
              <p className="text-[10px] text-bone/55">{e.note}</p>
              <p className="text-[9px] text-bone/35">{e.time}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-bone/10 pt-3 text-right text-[10px] text-bone/40">
        ~$14,200/mo modeled recovery
      </div>
    </div>
  );
}

function FollowUpMock() {
  const steps = [
    {
      day: "Day 3",
      label: "Soft nudge",
      copy: "Hey Maria — invoice #1847 still outstanding. One-tap pay link.",
      status: "sent",
    },
    {
      day: "Day 7",
      label: "Warmer reminder",
      copy: "Quick check-in — anything we got wrong on visit #9?",
      status: "sent",
    },
    {
      day: "Day 14",
      label: "Human handoff",
      copy: "Ricardo calls. Full thread + Site Memory in front of him.",
      status: "queued",
    },
  ];
  return (
    <div className="w-full max-w-sm rounded-xl bg-forest-deep/70 p-5 text-left">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-serif text-sm font-semibold text-honey-bright">
          The FollowUp · Invoice $2,140
        </span>
        <span className="rounded-full bg-honey/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-crest text-honey-bright">
          Active
        </span>
      </div>
      <p className="mb-3 text-[10px] text-bone/50">
        Maria V. · 44 Cypress Run · last paid Mar 28
      </p>
      <ul className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={s.day} className="flex items-start gap-3">
            <span
              className={`mt-1 h-2 w-2 flex-none rounded-full ${
                s.status === "sent"
                  ? i % 2 === 0
                    ? "bg-moss-bright"
                    : "bg-honey-bright"
                  : "bg-bone/25"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[9px] uppercase tracking-crest text-bone/60">
                  {s.day}
                </span>
                <span className="text-[9px] text-bone/45">
                  {s.status === "sent" ? "delivered" : "queued"}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-bone">{s.label}</p>
              <p className="text-[10px] text-bone/55">{s.copy}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-bone/10 pt-3 text-right text-[10px] text-bone/40">
        ~$12,800/mo recovered
      </div>
    </div>
  );
}

function WhispererMock() {
  const items = [
    {
      label: "Aeration window",
      score: 92,
      note: "Last aerated 14 months ago",
      accent: "bg-moss-bright",
    },
    {
      label: "Mulch refresh",
      score: 78,
      note: "Visible fade · 3 zones",
      accent: "bg-honey-bright",
    },
    {
      label: "Drainage flag",
      score: 61,
      note: "Standing water near driveway edge",
      accent: "bg-champagne-bright",
    },
  ];
  return (
    <div className="w-full max-w-sm rounded-xl bg-forest-deep/70 p-5 text-left">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-serif text-sm font-semibold text-moss-bright">
          Upsell Whisperer · 1472 Laurel Ct
        </span>
        <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-crest text-moss-bright">
          3 flags
        </span>
      </div>
      <ul className="flex flex-col gap-3.5">
        {items.map((item) => (
          <li key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-bone">
                {item.label}
              </span>
              <span className="text-[11px] font-semibold text-bone/70">
                {item.score}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bone/10">
              <div
                className={`h-full rounded-full ${item.accent}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
            <p className="text-[10px] text-bone/50">{item.note}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-bone/10 pt-3">
        <span className="text-[10px] text-bone/40">1-tap approve sent</span>
        <span className="text-[10px] font-medium text-moss-bright">
          ~$38,000/mo upside
        </span>
      </div>
    </div>
  );
}
