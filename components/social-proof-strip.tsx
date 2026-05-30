import { ArrowRight, Quote } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

const PILOT_STATS = [
  {
    stat: "1 paying customer, live",
    sub: "Bright Lights Landscape Lighting · Sarasota, FL",
  },
  {
    stat: "Founder-led setup",
    sub: "Direct line to the team. No CSM, no ticket queue, no offshore script.",
  },
  {
    stat: "30 days, no fight",
    sub: "Money back if it doesn't pay for itself in month one. Data export included.",
  },
];

/**
 * Three-column homepage social proof block. Rewritten 2026-05-12 after the
 * board's emergency review flagged the prior "12 founding crews / $1.4M+
 * recovered / 0 churned" stats as a credibility bomb — they contradicted
 * the homepage FAQ which honestly named our single paying customer.
 *
 *   left   → pricing-promise card (durable cap, not countdown theater)
 *   center → founder manifesto card
 *   right  → honest customer count + guarantee
 */
export function SocialProofStrip() {
  return (
    <section className="border-b border-bone/10 bg-slate-deep py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Left third — pricing-promise card. Replaced "12 of 20 slots"
              theater 2026-05-08 per board's unanimous "drop unless 8 are
              signed paper" call. The durable signal is the cap, not the
              countdown. */}
          <ScrollReveal>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-champagne/20 bg-champagne/[0.03] p-6">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-champagne-bright shadow-[0_0_10px_rgba(212,178,122,0.7)]" />
                <span className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
                  Pricing promise
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold leading-tight text-bone">
                Annual increase capped at 5% — forever.
              </h3>
              <p className="text-sm leading-relaxed text-bone/60">
                Aspire just hiked their list price 102% YoY. We won&apos;t
                do that to you, in writing. Per-crew pricing means seasonal
                hires are free. Founder-led white-glove setup. Direct line
                to the team during your first week.
              </p>
              <div className="pt-2">
                <a
                  href="/demo"
                  className="inline-flex items-center gap-2 text-sm font-medium text-champagne-bright transition-colors hover:text-champagne"
                >
                  Book a 30-minute demo
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Center third — founder manifesto card */}
          <ScrollReveal delay={0.08}>
            <div className="flex h-full flex-col gap-5 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
              <div className="flex items-center gap-2">
                <Quote
                  className="h-4 w-4 text-champagne-bright"
                  aria-hidden
                />
                <span className="text-xs font-semibold uppercase tracking-crest text-bone/70">
                  Why we built this
                </span>
              </div>
              <blockquote className="font-serif text-[17px] leading-relaxed text-bone">
                I watched friends in landscape lose six figures a year to
                software gaps nobody was solving. Quotes dying in voicemail.
                Upsells nobody flagged. Late invoices the office forgot to
                chase. Gladius is the operating system I wished they&rsquo;d
                had — shipped engine by engine, with a specific dollar number
                tied to every one.
              </blockquote>
              <div className="mt-auto flex items-center gap-3 border-t border-bone/10 pt-4">
                <div
                  aria-hidden
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-champagne-bright/30 bg-gradient-to-br from-champagne/20 to-honey-deep/20"
                >
                  <span className="font-serif text-sm font-semibold text-champagne-bright">
                    G
                  </span>
                </div>
                <div className="text-xs leading-snug text-bone/70">
                  <div className="font-medium text-bone/85">
                    Ricardo Gamon · Founder
                  </div>
                  <div>Built for crew owners. By people who owe them.</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right third — modeled-stat card with footnote disclaimer */}
          <ScrollReveal delay={0.16}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
              <Eyebrow tone="champagne">Who we serve today</Eyebrow>
              <div className="flex flex-col gap-4">
                {PILOT_STATS.map((s) => (
                  <div key={s.stat} className="space-y-1">
                    <div className="font-serif text-xl font-semibold leading-tight text-bone">
                      {s.stat}
                    </div>
                    <div className="text-xs leading-snug text-bone/65">
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto border-t border-bone/10 pt-3 text-[13px] leading-relaxed text-bone/75">
                We&rsquo;ll tell you the honest count over a dressed-up
                customer list. That doesn&rsquo;t change in month two.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
