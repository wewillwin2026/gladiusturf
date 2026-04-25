import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Tier } from "@/content/pricing";
import { cn } from "@/lib/cn";

// Display labels for the small eyebrow above each tier name. We don't render
// the raw `tier.id` (lowercase token) because that leaks the data layer to the
// customer — see audit BUG-CODE-015.
const TIER_EYEBROWS: Record<Tier["id"], string> = {
  independent: "Tier 01",
  professional: "Tier 02",
  enterprise: "Tier 03",
};

export function PricingTier({
  tier,
  billing = "monthly",
}: {
  tier: Tier;
  billing?: "monthly" | "annual";
}) {
  const isAnnual = billing === "annual";
  const displayPrice = isAnnual ? tier.price * 10 : tier.price;
  const periodLabel = isAnnual
    ? tier.period.replace("/ mo", "/ yr").replace("/mo", "/yr")
    : tier.period;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-8",
        tier.featured
          ? "border-moss/50 bg-gradient-to-b from-moss/10 to-transparent shadow-pop"
          : "border-bone/10 bg-bone/[0.02]"
      )}
    >
      {tier.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-bright px-3 py-1 text-[10px] font-bold uppercase tracking-crest text-forest">
          Most popular
        </div>
      )}

      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-crest",
          tier.featured ? "text-moss-bright" : "text-champagne-bright"
        )}
      >
        {TIER_EYEBROWS[tier.id]}
      </p>

      <h3 className="mt-2 font-serif text-2xl font-semibold text-bone">
        {tier.name}
      </h3>
      <p className="mt-2 text-sm leading-[1.5] text-bone/60">{tier.tagline}</p>

      {/* min-w-[8ch] reserves space so monthly→annual swap doesn't cause CLS */}
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="min-w-[8ch] font-serif text-5xl font-semibold tracking-tight text-bone">
          ${displayPrice.toLocaleString()}
        </span>
        <span className="text-sm text-bone/50">{periodLabel}</span>
      </div>
      <p
        className={cn(
          "mt-1 text-xs leading-[1.55]",
          tier.featured ? "text-moss-bright/70" : "text-bone/55"
        )}
      >
        Unlimited seats. 30-day money-back guarantee.
        <br />
        Annual prepay: 2 months free.
      </p>

      <Link
        href={`/demo?plan=${tier.id}`}
        className={cn(
          "mt-8 inline-flex items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold transition-all",
          tier.featured
            ? "bg-lime-bright text-forest-deep shadow-cta hover:bg-lime hover:shadow-cta-hover"
            : "border border-champagne-bright/40 text-champagne-bright hover:border-champagne-bright hover:bg-champagne/10"
        )}
      >
        {tier.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <ul className="mt-8 flex flex-col gap-3">
        {tier.features.map((f, i) => {
          // Alternate check icon color by index: even = champagne, odd = moss.
          // For the featured (Professional) tier, we keep the dominant moss
          // accent stronger so the marquee tier reads moss-first.
          const checkCls = tier.featured
            ? i % 2 === 0
              ? "text-moss-bright"
              : "text-champagne-bright"
            : i % 2 === 0
              ? "text-champagne-bright"
              : "text-moss-bright";
          return (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm leading-[1.5] text-bone/80"
            >
              <Check className={cn("mt-0.5 h-4 w-4 flex-none", checkCls)} />
              <span>{f}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
