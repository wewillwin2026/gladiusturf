import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/cn";
import { PRICING_TEASER } from "@/lib/lighting/content";

export function LightingPricingTeaser() {
  return (
    <section className="border-b border-bone/10 bg-obsidian py-28">
      <div className="mx-auto max-w-content px-6">
        <ScrollReveal>
          <Eyebrow tone="honey">Pricing</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
            Three tiers. One platform.
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRICING_TEASER.tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={i * 0.06}>
              <div
                className={cn(
                  "h-full rounded-2xl border p-7",
                  tier.featured
                    ? "border-honey-bright/40 bg-gradient-to-b from-honey/[0.08] to-transparent shadow-pop-honey"
                    : "border-bone/10 bg-bone/[0.02]"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-[20px] font-semibold text-bone">
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-honey-bright/40 bg-honey/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-crest text-honey-bright">
                      <Star className="h-3 w-3" aria-hidden />
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mt-4 text-[14px] leading-[1.6] text-bone/65">
                  {tier.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-bone/10 pt-8 sm:flex-row sm:items-center">
            <p className="text-sm text-bone/55">{PRICING_TEASER.footnote}</p>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-honey-bright transition-colors hover:text-honey"
            >
              See full pricing
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
