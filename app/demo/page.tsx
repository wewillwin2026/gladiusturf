import type { Metadata } from "next";
import {
  ArrowRight,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { DemoForm } from "@/components/demo-form";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { QuoteBlock } from "@/components/quote-block";

export const metadata: Metadata = {
  title: "Request a demo",
  description:
    "See GladiusTurf on your own data in 30 minutes. Founders run the call. No SDR, no slides, no junior CSM. ROI projection live on screen.",
};

const COVER_STEPS = [
  {
    title: "Walk your quote pipeline through Quote Intercept",
    body:
      "We pull your last 30 days of estimate requests and run them through the engine live. You see the ones that would have been auto-routed inside two minutes, the ones that would have escalated, and the ones a competitor stole because the inbox sat for three days.",
  },
  {
    title: "Score your last 90 days of jobs through Upsell Whisperer",
    body:
      "Export your job list, paste it in, and watch the engine flag the aeration windows, mulch refresh cycles, irrigation leaks, and dying specimens you didn't pitch. It puts a dollar number next to every property.",
  },
  {
    title: "Map your referral graph",
    body:
      "Drop in your customer list. Referral Radar plots which properties produce the most new business, which neighbors share an HOA, and which reps are quietly losing referrals. We mark the postcards we'd send tomorrow.",
  },
  {
    title: "ROI projection — live, on screen",
    body:
      "Three numbers. Recovered estimates, recovered upsells, recovered referrals — annualized against your real volume. No spreadsheets sent over later. You watch us do the math in the product.",
  },
  {
    title: "Migration plan",
    body:
      "Last ten minutes. We tell you what we'll move, when we'll move it, and which day your crew opens GladiusTurf for the first time. 48 hours from yes to live.",
  },
];

const BRING_ITEMS = [
  {
    icon: FileSpreadsheet,
    title: "Last 90 days of quotes",
    body:
      "CSV export from Jobber, LMN, Service Autopilot, Aspire, Zentive, or your spreadsheet. Won, lost, ghosted — all of them.",
  },
  {
    icon: Users,
    title: "Customer list export",
    body:
      "Address, contact, contract type. We don't need revenue figures. We use addresses to map your referral graph live on the call.",
  },
  {
    icon: Settings,
    title: "Current software name",
    body:
      "Whatever you're running today, plus anything bolted onto it. We've migrated off all of them. Tell us in the form.",
  },
];

const eyebrowMoss = "text-xs font-semibold uppercase tracking-crest text-moss-bright";

export default function DemoPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* HERO */}
        <section className="border-b border-bone/10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-28 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <Eyebrow tone="champagne">Live demo</Eyebrow>
              <h1 className="mt-6 font-serif text-4xl tracking-[-0.02em] leading-[1.05] text-bone md:text-6xl">
                See it on your data. 30 minutes. Founders run the call.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-[1.6] text-bone/70 md:text-xl">
                You won&apos;t see a deck. You&apos;ll see GladiusTurf running
                live against your own quote pipeline, your own customer list,
                and the last 90 days of jobs you&apos;ve already done. We
                screen-share the engines that move your numbers, point them at your data, and
                read the recovered revenue out loud.
              </p>
              <p className="mt-6 max-w-xl text-lg leading-[1.6] text-bone/60">
                No SDR pre-qualifying. No junior CSM reading talking points
                back to you. A founder shows up with the product open. By
                minute thirty you&apos;ll know — within a few thousand
                dollars — what GladiusTurf would have put in your bank last
                quarter, and exactly what migration looks like.
              </p>

              <ul className="mt-10 flex flex-col gap-3 text-[15px] leading-[1.6] text-bone/70">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-bright" />
                  14-day pilot, no card on file
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-bright" />
                  48-hour migration from Jobber / LMN / Service Autopilot
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-bright" />
                  We pay your overlap month
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-bright" />
                  Month-to-month. Cancel anytime, no claw-back.
                </li>
              </ul>
            </div>

            <div className="lg:pl-8">
              {/* Heritage gold halo on the conversion card. */}
              <div className="rounded-2xl border border-champagne/40 bg-gradient-to-b from-champagne/5 to-transparent p-8 shadow-pop-champagne">
                <div className="mb-6 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-crest text-champagne-bright">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Founders run the call
                  </span>
                </div>
                <DemoForm />
              </div>
            </div>
          </div>
        </section>

        {/* WHAT WE'LL COVER — alternate champagne / moss / champagne / moss / champagne */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <Eyebrow tone="champagne">What we&apos;ll cover</Eyebrow>
            <h2 className="mt-6 max-w-3xl font-serif text-4xl tracking-[-0.02em] leading-[1.05] text-bone md:text-5xl">
              Thirty minutes. Five proofs.
            </h2>

            <ol className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {COVER_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
                >
                  <p
                    className={`font-mono text-xs uppercase tracking-crest ${
                      i % 2 === 0 ? "text-champagne-bright" : "text-moss-bright"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-serif text-[22px] leading-[1.25] text-bone">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.65] text-bone/60">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHO RUNS THE DEMO */}
        <section className="border-b border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <p className={eyebrowMoss}>Founders only</p>
            <h2 className="mt-6 max-w-4xl font-serif text-4xl tracking-[-0.02em] leading-[1.05] text-bone md:text-5xl">
              No SDR. No junior CSM. Until rep number twenty.
            </h2>

            <div className="mt-10 grid max-w-3xl grid-cols-1 gap-6 text-[17px] leading-[1.7] text-bone/70">
              <p>
                Other category software hands you off the second you ask for a
                demo. SDR books the call. AE runs slides. Implementation hands
                you a junior CSM who learned the product six weeks ago. By the
                time you have a real question, the person who can answer it is
                three layers away from your inbox.
              </p>
              <p>
                That ends here. Until we&apos;re north of twenty paying shops,
                every demo is run by a founder. Every migration is touched by a
                founder. Every late-night text on a Saturday afternoon when a
                sprinkler controller breaks is a founder replying. You&apos;ll
                have our cell phones inside the first week. That&apos;s not a
                perk we&apos;re marketing — it&apos;s how we move fast enough
                to be worth your subscription.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[0, 1, 2].map((n) => (
                <div
                  key={n}
                  className="aspect-[4/5] rounded-2xl border border-champagne-bright/20 bg-bone/[0.02] p-8"
                >
                  <div className="flex h-full flex-col justify-end">
                    <p className="font-mono text-xs uppercase tracking-crest text-bone/40">
                      Founder {String(n + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-serif text-[18px] text-bone/50">
                      Photo placeholder
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <QuoteBlock />

        {/* WHAT YOU NEED TO BRING — champagne accents */}
        <section className="border-b border-bone/10">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <Eyebrow tone="champagne">What you need to bring</Eyebrow>
            <h2 className="mt-6 max-w-3xl font-serif text-4xl tracking-[-0.02em] leading-[1.05] text-bone md:text-5xl">
              Three things to bring on the call.
            </h2>

            <ul className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
              {BRING_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const accent = "text-champagne-bright";
                return (
                  <li
                    key={item.title}
                    className="rounded-2xl border border-champagne/20 bg-bone/[0.02] p-8"
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-mono text-xs uppercase tracking-crest ${accent}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <Icon
                        className={`h-5 w-5 ${accent}`}
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-6 font-serif text-[22px] leading-[1.25] text-bone">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-[1.65] text-bone/60">
                      {item.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* SOFT CTA */}
        <section className="bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center">
            <a
              href="#tour"
              className="inline-flex items-center gap-2 text-sm font-medium text-bone/60 transition-colors hover:text-champagne-bright"
            >
              Not ready to demo? Watch the 4-minute product tour
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
