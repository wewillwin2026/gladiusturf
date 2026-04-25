import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  LayoutDashboard,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { ComparisonTable } from "@/components/comparison-table";
import { CtaBand } from "@/components/cta-band";
import { EnginesGrid } from "@/components/engines-grid";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { PricingSection } from "@/components/pricing-section";
import { QuoteBlock } from "@/components/quote-block";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  description:
    "GladiusTurf is the twenty-seven-engine landscaping operating system across five tiers — revenue, lifecycle, intelligence, operations, marketplace — that catches every forgotten quote, missed upsell, late invoice, and dropped referral your current stack is letting walk.",
};

const FOUNDING_CREWS = [
  { name: "Pinehurst Greens", region: "NC · 14 crews" },
  { name: "Cobblestone Land Co.", region: "TX · 9 crews" },
  { name: "Riverbend Outdoor", region: "FL · 7 crews" },
  { name: "Cedarline Property", region: "GA · 12 crews" },
  { name: "North Forty Lawn", region: "OH · 6 crews" },
];

const PROBLEM_STATS = [
  {
    value: 232200,
    prefix: "$",
    label: "leaked from the average crew's books each year",
    accent: true,
  },
  {
    value: 21000,
    prefix: "$",
    label: "lost to missed calls per month at the average shop",
  },
  {
    value: 27,
    suffix: " engines",
    label: "across five tiers — one operating system that closes every leak",
  },
];

type ProductBlock = {
  eyebrow: string;
  icon: React.ReactNode;
  headline: string;
  body: string;
  bullets: string[];
  proof: string;
  flip: boolean;
  /** Accent color for headline span, proof, mock. Defaults to moss. */
  accent?: "moss" | "honey";
  /** Optional custom mock renderer instead of generic preview. */
  mock?: "portal" | "cadence";
};

const PRODUCT_BLOCKS: ProductBlock[] = [
  {
    eyebrow: "Quote Intercept",
    icon: <Phone className="h-3 w-3" />,
    headline: "The voicemail you never returned just became revenue.",
    body: "Every quote that lands after hours, every callback nobody made, every estimate that aged past 24 hours — Intercept captures it, transcribes it, and re-engages the prospect before a competitor calls them back.",
    bullets: [
      "After-hours voicemails transcribed and routed in 30s",
      "Stale quotes auto-rescued before they age out",
      "Ghosted prospects re-engaged with a personal SMS",
    ],
    proof: "Founding crews recover ~$14,200/mo in deals that would have died.",
    flip: false,
  },
  {
    eyebrow: "Upsell Whisperer",
    icon: <Sparkles className="h-3 w-3" />,
    headline: "Every property already has the next sale on it.",
    body: "Whisperer scans every site every visit — aeration windows, mulch refresh, drainage red flags, irrigation gaps. Crews see the punch-list before they pull off the truck. Clients get a 1-tap approve link tied to the next visit.",
    bullets: [
      "Visual scoring of every site, every visit",
      "Crew gets a punch-list, client gets a 1-tap approve",
      "Upsell revenue tied to next visit, not next quarter",
    ],
    proof: "Avg founding crew adds $38,000/mo in upsell revenue.",
    flip: true,
  },
  {
    eyebrow: "Referral Radar",
    icon: <Users className="h-3 w-3" />,
    headline: "Your best crew brings referrals. Your worst crew kills them.",
    body: "Radar tracks which properties produce new business, which reps quietly lose them, and fires next-door outreach the moment a job goes well — before the neighbor calls a competitor first.",
    bullets: [
      "Per-property referral lift, scored weekly",
      "Reps that kill referrals flagged before churn",
      "Next-door outreach fires on every great review",
    ],
    proof: "$180,000/yr in referral revenue most crews have no idea they're losing.",
    flip: false,
  },
  {
    eyebrow: "Client Portal",
    icon: <LayoutDashboard className="h-3 w-3" />,
    headline: "The phone stops ringing for status updates.",
    body: "Your branded portal lives at your domain, in your colors. Homeowners reschedule visits, book new services, pay invoices, and approve change orders themselves — and every action lands in your dispatch board in real time.",
    bullets: [
      "Reschedule, book, and pay from one branded link",
      "Change orders approved by the homeowner in 2 taps",
      "Job history, photos, and invoices self-serve 24/7",
    ],
    proof: "73% fewer 'when are you coming?' calls inside the first 60 days.",
    flip: true,
    accent: "honey",
    mock: "portal",
  },
  {
    eyebrow: "Cadence",
    icon: <CalendarClock className="h-3 w-3" />,
    headline: "The follow-up brain that catches what the office misses.",
    body: "Post-service feedback fires within six hours. Late-payment cadences warm before they escalate — Day 3, Day 7, Day 14, then a human handoff with full context. NOAA-timed seasonal reminders pull from Site Memory so every message reads like the owner wrote it.",
    bullets: [
      "Late-payment cadence recovers $12,800/mo on average",
      "Day 3 / Day 7 / Day 14 warm before human handoff",
      "Seasonal reminders timed to NOAA, scripted from Site Memory",
    ],
    proof: "+24% retention and $12,800/mo recovered in late invoices.",
    flip: false,
    accent: "moss",
    mock: "cadence",
  },
];

function PortalMock() {
  const rows = [
    { date: "Tue · Jul 30", service: "Mow + edge", action: "Reschedule" },
    { date: "Fri · Aug 02", service: "Bed mulch refresh", action: "Pay invoice" },
    { date: "Wed · Aug 14", service: "Aeration + overseed", action: "Book service" },
  ];
  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-lg bg-forest-mid/60 p-4 text-left">
      <div className="flex items-center justify-between">
        <span className="font-serif text-sm font-semibold text-honey-bright">
          Pinehurst Greens · Client Portal
        </span>
        <span className="rounded-full bg-honey/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-honey-bright">
          Live
        </span>
      </div>
      <p className="text-[11px] text-bone/55">
        Welcome back, Carla — your next visit is Tuesday.
      </p>
      <table className="mt-1 w-full table-fixed text-[11px]">
        <thead>
          <tr className="text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-bone/40">
            <th className="pb-2">When</th>
            <th className="pb-2">Service</th>
            <th className="pb-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date} className="border-t border-bone/5">
              <td className="py-2 pr-2 text-bone/70">{r.date}</td>
              <td className="py-2 pr-2 text-bone/85">{r.service}</td>
              <td className="py-2 text-right">
                <span className="rounded-full border border-honey-bright/40 bg-honey/5 px-2 py-0.5 text-[10px] font-semibold text-honey-bright">
                  {r.action}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
        <span>Self-serve · 24/7</span>
        <span className="text-honey-bright">73% fewer status calls</span>
      </div>
    </div>
  );
}

function CadenceMock() {
  const steps = [
    {
      day: "Day 3",
      label: "Soft nudge",
      copy: "Hey Carla — invoice #2118 still outstanding. One-tap pay link.",
      status: "sent",
    },
    {
      day: "Day 7",
      label: "Warmer reminder",
      copy: "Quick check-in — anything we got wrong on visit #14?",
      status: "sent",
    },
    {
      day: "Day 14",
      label: "Human handoff",
      copy: "Riley calls. Full thread + Site Memory in front of him.",
      status: "queued",
    },
  ];
  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-lg bg-forest-mid/60 p-4 text-left">
      <div className="flex items-center justify-between">
        <span className="font-serif text-sm font-semibold text-moss-bright">
          Cadence · Late invoice $1,840
        </span>
        <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-moss-bright">
          Active
        </span>
      </div>
      <p className="text-[11px] text-bone/55">
        Carla Brown · 12 Pine Hollow Lane · last paid Apr 2
      </p>
      <ul className="mt-1 flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <li key={s.day} className="flex items-start gap-3">
            <span
              className={`mt-1 h-2 w-2 flex-none rounded-full ${
                s.status === "sent"
                  ? i % 2 === 0
                    ? "bg-moss-bright"
                    : "bg-honey-bright"
                  : "bg-bone/30"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone/55">
                  {s.day}
                </span>
                <span className="text-[10px] text-bone/40">
                  {s.status === "sent" ? "delivered" : "queued"}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-bone">
                {s.label}
              </div>
              <div className="text-[10px] text-bone/55">{s.copy}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between border-t border-bone/10 pt-3 text-[10px] text-bone/50">
        <span>NOAA · Site Memory · Stripe</span>
        <span className="text-moss-bright">$12,800/mo recovered</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* a. Hero */}
        <Hero />

        {/* b. Proof strip — founding crews + tech bar */}
        <section className="border-y border-bone/10 bg-forest-mid py-14">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-bone/45">
                Trusted by founding crews
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
                {FOUNDING_CREWS.map((c) => (
                  <div
                    key={c.name}
                    className="flex flex-col items-center text-center"
                  >
                    <span className="font-serif text-base font-semibold tracking-[0.04em] text-bone/85">
                      {c.name}
                    </span>
                    <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-bone/40">
                      {c.region}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="mt-8 text-center text-xs text-bone/45">
                Built on infrastructure your shop already trusts ·{" "}
                <span className="text-bone/65">
                  Stripe · Twilio · Supabase · QuickBooks · Vercel
                </span>
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* c. The real cost — problem section */}
        <section className="relative overflow-hidden py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <Eyebrow className="mb-3 text-center">
                The real cost of a leaky stack
              </Eyebrow>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                <span className="text-moss-bright">$232,200</span> walks out of
                every crew&apos;s books each year.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-bone/70">
                Quotes that die in voicemail. Upsells nobody flagged. Referrals
                that got chased by a competitor first. The 12 founding crews
                that audited their pipelines with us last quarter were stunned
                by the number.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <p className="mx-auto mt-6 max-w-2xl text-center text-base italic text-bone/55">
                Don&apos;t be the owner explaining to your spouse why the books
                were down again — when the work was already booked.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                {PROBLEM_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className={
                      stat.accent
                        ? "rounded-2xl border border-moss/30 bg-gradient-to-b from-moss/10 to-transparent p-8 text-center"
                        : "rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 text-center"
                    }
                  >
                    <div
                      className={
                        stat.accent
                          ? "font-serif text-6xl font-semibold tracking-tight text-moss-bright md:text-7xl"
                          : "font-serif text-6xl font-semibold tracking-tight text-honey-bright md:text-7xl"
                      }
                    >
                      <AnimatedCounter
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </div>
                    <p className="mt-4 text-sm leading-[1.5] text-bone/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mt-8 text-center text-xs text-bone/40">
                Sources: Aspire 2026 Commercial Landscape Industry Report;
                founding-crew pipeline audits, 2026.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* d. Engines grid */}
        <EnginesGrid />

        {/* e. Three alternating product blocks */}
        <section
          id="product"
          className="border-t border-bone/10 bg-forest-mid py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow className="mb-3" tone="honey">
                  The product
                </Eyebrow>
                <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Every engine is a specific number
                  <br />
                  <span className="text-bone/55">
                    going into your bank account.
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            {PRODUCT_BLOCKS.map((b, i) => {
              const accent = b.accent ?? (i % 2 === 0 ? "moss" : "honey");
              const accentText =
                accent === "honey" ? "text-honey-bright" : "text-moss-bright";
              const accentBullet =
                accent === "honey" ? "bg-honey-bright" : "bg-moss-bright";
              const accentGradient =
                accent === "honey"
                  ? "from-honey/[0.08] via-bone/[0.02] to-transparent"
                  : "from-moss/[0.06] via-bone/[0.02] to-transparent";

              return (
                <div
                  key={b.eyebrow}
                  className={
                    i === 0
                      ? "mt-24 grid items-center gap-12 md:grid-cols-2"
                      : "mt-32 grid items-center gap-12 md:grid-cols-2"
                  }
                >
                  <ScrollReveal className={b.flip ? "md:order-2" : undefined}>
                    <div>
                      <Pill className="mb-4" tone={accent}>
                        {b.icon}
                        {b.eyebrow}
                      </Pill>
                      <h3 className="font-serif text-3xl font-semibold tracking-tight text-bone md:text-4xl">
                        {b.headline}
                      </h3>
                      <p className="mt-4 text-lg text-bone/70">{b.body}</p>
                      <ul className="mt-6 space-y-3 text-sm text-bone/85">
                        {b.bullets.map((item, idx) => (
                          <li key={item} className="flex items-start gap-3">
                            <span
                              className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${
                                idx % 2 === 0
                                  ? accentBullet
                                  : accent === "honey"
                                    ? "bg-moss-bright"
                                    : "bg-honey-bright"
                              }`}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 inline-block rounded-full border border-bone/10 bg-bone/[0.03] px-3 py-1 text-xs text-bone/80">
                        <span className={`font-semibold ${accentText}`}>
                          {b.proof}
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal
                    delay={0.1}
                    className={b.flip ? "md:order-1" : undefined}
                  >
                    <div
                      className={`aspect-[4/3] overflow-hidden rounded-2xl border border-bone/10 bg-gradient-to-br p-1 ${accentGradient}`}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-forest-deep p-6">
                        {b.mock === "portal" ? (
                          <PortalMock />
                        ) : b.mock === "cadence" ? (
                          <CadenceMock />
                        ) : (
                          <div className="flex flex-col items-center gap-3 px-8 text-center">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/40">
                              Product preview
                            </span>
                            <span className="font-serif text-3xl font-semibold text-bone">
                              {b.eyebrow}
                            </span>
                            <span className={`font-mono text-sm ${accentText}`}>
                              {b.proof.split("Founding crews ").pop()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </section>

        {/* f. ROI tease */}
        <section className="border-t border-bone/10 bg-forest-deep py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <ScrollReveal>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                Your last bad month cost more than
                <br />
                GladiusTurf costs for a{" "}
                <span className="text-moss-bright">year</span>.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-bone/70">
                Run your real numbers. Most founding crews see payback inside
                45 days — usually from the first leak we close.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <Link
                href="/pricing"
                className="group mt-10 inline-flex items-center gap-2 rounded-full border border-honey-bright/40 bg-honey/5 px-7 py-3.5 text-base font-medium text-honey-bright transition-all hover:border-honey-bright hover:bg-honey/10"
              >
                Run your numbers
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* g. Comparison preview */}
        <section className="border-t border-bone/10 bg-forest-mid py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow className="mb-3" tone="honey">
                  Compare
                </Eyebrow>
                <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  What you&apos;re paying now vs.
                  <br />
                  <span className="text-moss-bright">what GladiusTurf costs.</span>
                </h2>
                <p className="mt-4 text-lg text-bone/65">
                  Slower software. Higher bills. No real AI. Here&apos;s the
                  side-by-side.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="relative mt-14 rounded-2xl border border-bone/10 bg-forest-deep p-6 md:p-8">
                <ComparisonTable bare />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-6 right-6 w-12 rounded-r-2xl bg-gradient-to-l from-forest-deep to-transparent md:hidden"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-8 text-center">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-1.5 text-sm text-lime-bright transition-colors hover:text-lime"
                >
                  See full comparison
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* h. Quote block */}
        <QuoteBlock />

        {/* i. Pricing */}
        <PricingSection />

        {/* j. Final CTA */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
