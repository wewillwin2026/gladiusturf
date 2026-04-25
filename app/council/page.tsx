import type { Metadata } from "next";
import { ArrowRight, Crown, Hammer, Quote } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title:
    "The Council — Where landscape owners build the next 20 years of the trade",
  description:
    "Founder-led community of landscape and lawn-care owners who refuse to run their trade on 2010-era field-service software. Founding cohort. Locked-in pricing. Direct line to the team.",
  alternates: { canonical: "/council" },
  openGraph: {
    title: "The Council — Where landscape owners build the next 20 years",
    description:
      "Founder-led community of landscape owners. Founding cohort. Locked-in pricing. Direct line to the team.",
  },
};

const PERKS = [
  {
    Icon: Crown,
    title: "Founder pricing, locked forever",
    body:
      "Founding-cohort members keep their tier price as long as they stay on the platform. Pricing resets after the cohort closes — Council members never see the new sheet.",
  },
  {
    Icon: Hammer,
    title: "A direct line to the team",
    body:
      "No support tickets, no ticket queues, no 'a CSM will reach out within 48 hours.' Every Council member has a Signal thread with the founders. You ship a feature request on Tuesday morning and it's in the build by Friday.",
  },
  {
    Icon: Quote,
    title: "Build the trade together",
    body:
      "Quarterly off-the-record dinner with other Council owners. Annual two-day Forge in person. Private playbook library — the things owners learn the hard way, written down, indexed, searchable.",
  },
];

const TENETS = [
  "Landscape software is an industry running on tools built for HVAC.",
  "The labor crisis isn't going to fix itself. The owners who solve it first own the next 20 years.",
  "AI is either a job posting at Aspire — or it's already shipping revenue at your shop.",
  "The book of customers you keep is worth more than the leads you chase.",
  "Quotes that die in voicemail are the largest line item on every landscape P&L.",
  "We don't build for tech bros. We build for the crew chief who started in the cab at 4 AM and now signs the checks.",
];

export default function CouncilPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-pitch py-24 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.12),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-4xl">
                <Pill tone="champagne">The Council</Pill>
                <h1 className="mt-7 font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.02em] text-bone md:text-7xl">
                  Where landscape owners build the next twenty years of the
                  trade.
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-parchment/75 md:text-xl">
                  A founder-led cohort of landscape and lawn-care owners who
                  refuse to run their shop on 2010-era field-service software.
                  Founding pricing locked in. Direct line to the build team.
                  Quarterly dinner. Annual Forge.
                </p>
                <p className="mt-3 max-w-2xl text-sm text-bone/55">
                  This isn&rsquo;t a Slack channel pretending to be a community.
                  It&rsquo;s a small, hand-picked room. Below the form, you can
                  read what we&rsquo;re putting in it.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Three perks */}
        <section className="border-b border-bone/10 bg-obsidian py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">What you get</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Three things no other landscape software ever offered.
                </h2>
              </div>
            </ScrollReveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PERKS.map((p, i) => {
                const Icon = p.Icon;
                const accent =
                  i === 1 ? "text-champagne-bright" : "text-moss-bright";
                const accentBorder =
                  i === 1
                    ? "border-champagne-bright/40"
                    : "border-moss-bright/40";
                return (
                  <ScrollReveal key={p.title} delay={i * 0.08}>
                    <div className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${accentBorder}`}
                      >
                        <Icon className={`h-5 w-5 ${accent}`} />
                      </span>
                      <h3 className="mt-5 font-serif text-xl font-semibold text-bone">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.6] text-bone/70">
                        {p.body}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tenets — what the room agrees on */}
        <section className="border-b border-bone/10 bg-slate-deep py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="moss">What the room agrees on</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Six things that aren&rsquo;t up for debate inside the
                  Council.
                </h2>
                <p className="mt-4 max-w-2xl text-base text-bone/60">
                  If you read these and nod, the application below is for you.
                  If you read these and disagree, this room isn&rsquo;t the
                  one for you — and we should both save the demo time.
                </p>
              </div>
            </ScrollReveal>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {TENETS.map((t, i) => (
                <ScrollReveal key={t} delay={(i % 3) * 0.06}>
                  <div className="flex gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <span
                      aria-hidden
                      className={`font-mono text-2xl font-semibold tabular-nums ${
                        i % 2 === 0
                          ? "text-moss-bright/60"
                          : "text-champagne-bright/60"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <p className="text-[15px] leading-[1.55] text-bone/85">
                      {t}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist / Application form */}
        <section className="border-b border-bone/10 bg-obsidian py-24">
          <div className="mx-auto max-w-3xl px-6">
            <ScrollReveal>
              <div className="rounded-2xl border border-champagne/30 bg-gradient-to-b from-champagne/[0.05] to-transparent p-8 shadow-pop-champagne md:p-10">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-champagne-bright shadow-[0_0_10px_rgba(212,178,122,0.7)]" />
                  <span className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
                    Founding cohort · 12 of 20 May 2026 slots remaining
                  </span>
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                  Apply to the Council.
                </h2>
                <p className="mt-3 text-base text-bone/65">
                  Drop your email. We&rsquo;ll send the application — five
                  short questions about your shop, your stack, and what
                  you&rsquo;re trying to fix. Replies within one business
                  day, founder-read.
                </p>
                <div className="mt-6">
                  <WaitlistForm source="council" />
                </div>
                <p className="mt-5 text-xs leading-relaxed text-bone/45">
                  No credit card. No sales sequence. If we&rsquo;re not the
                  right fit for your shop we&rsquo;ll tell you, and recommend
                  who is.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Soft second CTA — alternative entry point */}
        <section className="border-b border-bone/10 bg-pitch py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <ScrollReveal>
              <h3 className="font-serif text-2xl font-semibold text-bone md:text-3xl">
                Not ready to apply? See the system first.
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-base text-bone/65">
                Book a 30-minute demo on your data, run the math on the ROI
                calculator, or read the manifesto. The Council is where this
                ends, not where it starts.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <a
                  href="/demo"
                  className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-7 py-3.5 text-base font-semibold text-forest shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
                >
                  Book a 30-minute demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="/roi"
                  className="group inline-flex items-center gap-2 rounded-full border border-champagne-bright/40 px-6 py-3 text-sm font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
                >
                  Run your numbers →
                </a>
                <a
                  href="/manifesto"
                  className="text-sm text-bone/55 transition-colors hover:text-bone/85"
                >
                  Or read the manifesto →
                </a>
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
