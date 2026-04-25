"use client";

import { useState } from "react";
import { PricingTier } from "@/components/pricing-tier";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TIERS } from "@/content/pricing";
import { cn } from "@/lib/cn";

/**
 * Client wrapper that holds the Monthly | Annual toggle state and renders the
 * 3-tier pricing grid with the right billing context. Annual price = monthly × 10
 * (i.e., 2 months free) — see CLS guard via min-w-[7ch] price column in PricingTier.
 */
export function PricingTiersToggle() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <>
      <ScrollReveal>
        <div className="mx-auto mt-10 inline-flex w-fit items-center gap-1 rounded-full border border-bone/10 bg-bone/[0.04] p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-crest transition-colors",
              billing === "monthly"
                ? "bg-bone/10 text-bone"
                : "text-bone/55 hover:text-bone/80"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-crest transition-colors",
              billing === "annual"
                ? "bg-champagne/15 text-champagne-bright"
                : "text-bone/55 hover:text-bone/80"
            )}
          >
            Annual <span className="ml-1 text-[10px] opacity-80">(save 17%)</span>
          </button>
        </div>
      </ScrollReveal>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <ScrollReveal key={t.id} delay={i * 0.08}>
            <PricingTier tier={t} billing={billing} />
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}
