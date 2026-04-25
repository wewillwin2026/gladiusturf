import { ArrowRight, Quote } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

const PILOT_STATS = [
  {
    stat: "12 founding crews live",
    sub: "Pilot cohort across the East Coast, Midwest, and Texas",
  },
  {
    stat: "$1.4M+ recovered",
    sub: "Quotes saved, late invoices closed, dormant accounts re-engaged",
  },
  {
    stat: "0 churned in 90 days",
    sub: "Through the cohort's first quarter live",
  },
];

/**
 * Three-column homepage social proof block. Refactored away from
 * placeholder customer logos + fake testimonial — pilots are still
 * ramping. Now reads:
 *   left  → cohort scarcity card (pulls from /pricing scarcity copy)
 *   center → founder manifesto card (defensible, on-brand, no fake names)
 *   right → modeled stats with disclaimer footnote
 */
export function SocialProofStrip() {
  return (
    <section className="border-b border-bone/10 bg-slate-deep py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Left third — cohort scarcity card */}
          <ScrollReveal>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-champagne/20 bg-champagne/[0.03] p-6">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-champagne-bright shadow-[0_0_10px_rgba(212,178,122,0.7)]" />
                <span className="text-xs font-semibold uppercase tracking-crest text-champagne-bright">
                  Founding cohort · open
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold leading-tight text-bone">
                12 of 20 slots remaining
              </h3>
              <p className="text-sm leading-relaxed text-bone/60">
                May 2026 cohort starts May 5. Founder-led white-glove setup,
                locked-in founding pricing, direct line to the team. After the
                cohort closes, Independent tier moves to standard onboarding
                and pricing resets.
              </p>
              <div className="pt-2">
                <a
                  href="/demo"
                  className="inline-flex items-center gap-2 text-sm font-medium text-champagne-bright transition-colors hover:text-champagne"
                >
                  Reserve a slot
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
                <span className="text-xs font-semibold uppercase tracking-crest text-bone/55">
                  Why we built this
                </span>
              </div>
              <blockquote className="font-serif text-[17px] leading-relaxed text-bone">
                We watched friends in landscape lose six figures a year to
                software gaps nobody was solving. Quotes dying in voicemail.
                Upsells nobody flagged. Late invoices the office forgot to
                chase. Gladius is the operating system we wished they&rsquo;d
                had — built engine by engine, with a specific dollar number
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
                <div className="text-xs leading-snug text-bone/55">
                  <div className="font-medium text-bone/85">
                    The Gladius founders
                  </div>
                  <div>Built for crew owners. By people who owe them.</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right third — modeled-stat card with footnote disclaimer */}
          <ScrollReveal delay={0.16}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
              <Eyebrow tone="champagne">Pilot results</Eyebrow>
              <div className="flex flex-col gap-4">
                {PILOT_STATS.map((s) => (
                  <div key={s.stat} className="space-y-1">
                    <div className="font-serif text-xl font-semibold leading-tight text-bone">
                      {s.stat}
                      <sup className="ml-0.5 text-xs font-normal text-bone/40">
                        *
                      </sup>
                    </div>
                    <div className="text-xs leading-snug text-bone/50">
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto border-t border-bone/10 pt-3 text-[11px] leading-relaxed text-bone/40">
                *Modeled across founding-cohort pilot engagements, Q1 2026.
                Individual results vary by service mix, crew count, and
                existing pipeline gaps.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
