import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        {/* Trust band — replaced the prior "founding cohort 12 of 20"
            scarcity copy 2026-05-08 per board's unanimous "drop the
            theater unless 8 are signed paper" call. The promise is the
            durable signal: cap the increase, money-back the start. */}
        <ScrollReveal>
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-champagne/25 bg-champagne/[0.03] px-6 py-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 flex-none animate-pulse-dot rounded-full bg-champagne-bright shadow-[0_0_10px_rgba(212,178,122,0.7)]" />
              <div>
                <div className="text-sm font-semibold text-bone">
                  Annual increase capped at 5% — forever.
                </div>
                <div className="text-xs text-bone/75">
                  Aspire just hiked their list 102% YoY. We won&apos;t do that
                  to you, in writing.
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
            <p className="mt-4 text-lg text-bone/80">
              Every plan ships with every engine. No per-user fees. No add-on
              tax. Annual prepay = 2 months free.
            </p>
          </div>
        </ScrollReveal>

        {/* Monthly | Annual toggle + 3-tier grid */}
        <div className="text-center">
          <PricingTiersToggle />
        </div>

        {/* CFO defense packet — surfaced 2026-05-12 for the buyer who
            wants to see the math vs. Aspire, Jobber, LMN, etc. */}
        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 flex max-w-2xl items-center justify-center">
            <Link
              href="/pricing/cfo"
              className="group inline-flex items-center gap-2 rounded-full border border-bone/15 bg-bone/[0.03] px-5 py-3 text-sm font-medium text-bone/85 transition-colors hover:border-champagne-bright/50 hover:text-bone"
            >
              How is this defensible vs. Aspire and Jobber?
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
