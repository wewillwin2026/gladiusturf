import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/cn";
import { PRICING_TIERS, PRICING_FOOTNOTE } from "@/lib/lighting/content";

/**
 * Three pricing tiers per LIGHTING_LEGENDARY §7.5. Middle tier
 * (Professional) gets a bronze highlight border + amber pill labeled
 * "Most teams pick this." Each tier shows monthly price + per-bullet
 * features with a Check icon.
 */
export function LightingPricingTeaser() {
  return (
    <section className="border-b border-tw-line bg-tw-bg-base py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <h2 className="font-tiempos text-3xl font-medium tracking-[-0.01em] text-tw-text-primary md:text-4xl">
            Pricing for lighting operators.
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={i * 0.06}>
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-lg border bg-tw-bg-elevated p-8",
                  tier.highlight
                    ? "border-tw-accent-amber"
                    : "border-tw-line",
                )}
              >
                {tier.highlight && "highlightLabel" in tier && (
                  <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-tw-accent-amber px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-tw-bg-base">
                    {tier.highlightLabel}
                  </span>
                )}

                <h3 className="text-[20px] font-medium text-tw-text-primary">
                  {tier.name}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.5] text-tw-text-muted">
                  {tier.pitch}
                </p>

                <p className="mt-6 font-tiempos text-5xl font-medium text-tw-text-primary">
                  {tier.monthly}
                  <span className="ml-1 text-sm font-normal text-tw-text-muted">
                    /mo
                  </span>
                </p>

                <ul className="mt-8 flex flex-col gap-3 text-[14px] leading-[1.5] text-tw-text-secondary">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          tier.highlight
                            ? "text-tw-accent-amber"
                            : "text-tw-accent-bronze",
                        )}
                        aria-hidden
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-tw-text-muted">
            {PRICING_FOOTNOTE}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
