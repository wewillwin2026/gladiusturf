import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { PricingTier } from "@/components/pricing-tier";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BDC_ADDON, TIERS } from "@/content/pricing";

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
              <span className="font-semibold text-bone">No 3-year contract.</span>{" "}
              Cancel anytime after month 3.
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
              Every plan ships with all seven engines. No per-user fees. No
              add-on tax.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <ScrollReveal key={t.id} delay={i * 0.08}>
              <PricingTier tier={t} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.25}>
          <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-bone">
                {BDC_ADDON.name} —{" "}
                <span className="font-mono text-champagne-bright">
                  ${BDC_ADDON.price}
                </span>
                <span className="text-bone/50">{BDC_ADDON.period}</span>
              </p>
              <p className="mt-1 text-[13px] leading-[1.5] text-bone/60">
                {BDC_ADDON.description}
              </p>
            </div>
            <Link
              href="/demo?addon=bdc"
              className="group inline-flex items-center gap-1.5 rounded-full border border-champagne-bright/40 px-4 py-2 text-sm font-medium text-champagne-bright transition-all hover:border-champagne-bright hover:bg-champagne/10"
            >
              Add BDC
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
