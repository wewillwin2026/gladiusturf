import { Eyebrow } from "@/components/eyebrow";
import { PricingTiersToggle } from "@/components/pricing-tiers-toggle";
import { ScrollReveal } from "@/components/scroll-reveal";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-t border-bone/10 bg-slate-deep py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Scarcity band — heritage champagne with pulse for warmth without competing with the marquee CTA. */}
        <ScrollReveal>
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-champagne/25 bg-champagne/[0.03] px-6 py-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 flex-none animate-pulse-dot rounded-full bg-champagne-bright shadow-[0_0_10px_rgba(212,178,122,0.7)]" />
              <div>
                <div className="text-sm font-semibold text-bone">
                  Founding cohort · 12 of 20 slots remaining
                </div>
                <div className="text-xs text-bone/55">
                  Founder-led white-glove setup. May 2026 cohort starts May 5.
                </div>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-bone/10 sm:block" />
            <div className="text-xs text-bone/65">
              <span className="font-semibold text-bone">
                30-day money-back guarantee.
              </span>{" "}
              Cancel anytime.
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Pricing</Eyebrow>
            <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
              Flat per crew. Unlimited seats. Forever.
            </h2>
            <p className="mt-4 text-lg text-bone/65">
              Every plan ships with all 33 engines. No per-user fees. No add-on
              tax. Annual prepay = 2 months free.
            </p>
          </div>
        </ScrollReveal>

        {/* Monthly | Annual toggle + 3-tier grid */}
        <div className="text-center">
          <PricingTiersToggle />
        </div>
      </div>
    </section>
  );
}
