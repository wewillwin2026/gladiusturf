import type { Metadata } from "next";
import {
  CalendarClock,
  Phone,
  Sparkles,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HomeFaq } from "@/components/home-faq";
import { HowItWorks } from "@/components/how-it-works";
import { LossCalculatorInline } from "@/components/loss-calculator";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { PricingSection } from "@/components/pricing-section";
import { ProductLoop } from "@/components/product-loop";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SocialProofStrip } from "@/components/social-proof-strip";

export const metadata: Metadata = {
  description:
    "Software that answers the phone, sends the quote, dispatches the crew, and gets paid — without you touching it. Catches every forgotten quote, missed upsell, late invoice, and dropped referral your current stack is letting walk. 30-day money-back, no fight.",
  alternates: { canonical: "/" },
  openGraph: {
    images: [{ url: "/crest.png", width: 600, height: 800 }],
  },
  twitter: {
    images: ["/crest.png"],
  },
};

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
    proof: "Modeled recovery: ~$14,200/mo from a typical pipeline audit.",
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
    proof: "Modeled upside: ~$38,000/mo in surfaced upsell revenue.",
    flip: true,
  },
  {
    eyebrow: "The FollowUp",
    icon: <CalendarClock className="h-3 w-3" />,
    headline: "The follow-up that catches what the office misses.",
    body: "Post-service check-ins fire within six hours. Late-invoice nudges warm before they escalate — Day 3, Day 7, Day 14, then a human handoff with full context. NOAA-timed seasonal reminders pull from Site Memory so every message reads like the owner wrote it.",
    bullets: [
      "Late-invoice follow-up recovers $12,800/mo on average",
      "Day 3 / Day 7 / Day 14 warm before human handoff",
      "Seasonal reminders timed to NOAA, scripted from Site Memory",
    ],
    proof: "Modeled outcome: ~$12,800/mo recovered in late invoices, retention lift in the +20% range.",
    flip: false,
    accent: "moss",
    mock: "cadence",
  },
];

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
          The FollowUp · Late invoice $1,840
        </span>
        <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-moss-bright">
          Active
        </span>
      </div>
      <p className="text-[11px] text-bone/70">
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
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone/70">
                  {s.day}
                </span>
                <span className="text-[10px] text-bone/65">
                  {s.status === "sent" ? "delivered" : "queued"}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-bone">
                {s.label}
              </div>
              <div className="text-[10px] text-bone/70">{s.copy}</div>
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
      <main id="main-content">
        {/* a. Hero */}
        <Hero />

        {/* b2. Animated product loop — replaces founder video. SVG/CSS interim;
                 swap for /animations/product-loop.json + Lottie player when ready. */}
        <section className="border-b border-bone/10 bg-pitch py-20">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <div className="text-center">
                <Eyebrow tone="champagne">The loop</Eyebrow>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                  Watch what happens when an inbound lead hits the system.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm italic text-bone/72">
                  Real workflow, sped up. The same loop runs on every customer,
                  every day.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <div className="mt-10">
                <ProductLoop />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* b3. Loss calculator — moved up 2026-05-12. Personal $X leak
                from the prospect's own numbers replaces the static $232,200
                modeled-aggregate. Lead-magnet + micro-conversion in one. */}
        <LossCalculatorInline />

        {/* b4. Social proof strip — honest 1-customer count + pricing
                promise + founder line. */}
        <SocialProofStrip />

        {/* d. Product highlights — three marquee engines (cut from five
                2026-05-12 per conversion-first plan; Referral Radar +
                Client Portal moved to /product). */}
        <section
          id="product"
          className="border-t border-bone/10 bg-slate-deep py-28"
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
                  <span className="text-bone/70">
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
                        {b.mock === "cadence" ? (
                          <CadenceMock />
                        ) : (
                          <div className="flex flex-col items-center gap-3 px-8 text-center">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/70">
                              Product preview
                            </span>
                            <span className="font-serif text-3xl font-semibold text-bone">
                              {b.eyebrow}
                            </span>
                            <span className={`font-mono text-sm ${accentText}`}>
                              {b.proof}
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

        {/* e. How it works — 3-step ladder */}
        <HowItWorks />

        {/* f. (EnginesGrid removed from home 2026-05-12 — full catalog at /product) */}

        {/* i. Pricing */}
        <PricingSection />

        {/* j. FAQ — 8 questions, native details/summary accordion */}
        <HomeFaq />

        {/* l. Final CTA */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
