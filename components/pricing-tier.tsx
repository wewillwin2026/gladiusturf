import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Tier } from "@/content/pricing";
import { cn } from "@/lib/cn";

export function PricingTier({ tier }: { tier: Tier }) {
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-bright px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-deep">
          Most popular
        </div>
      )}

      <h3 className="font-serif text-2xl font-semibold text-bone">
        {tier.name}
      </h3>
      <p className="mt-2 text-sm leading-[1.5] text-bone/60">{tier.tagline}</p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-serif text-5xl font-semibold tracking-tight text-bone">
          ${tier.price.toLocaleString()}
        </span>
        <span className="text-sm text-bone/50">{tier.period}</span>
      </div>
      <p className="mt-1 text-xs text-bone/50">
        Unlimited seats. Cancel anytime after month 3.
      </p>

      <Link
        href={`/demo?plan=${tier.id}`}
        className={cn(
          "mt-8 inline-flex items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold transition-all",
          tier.featured
            ? "bg-lime-bright text-forest-deep shadow-cta hover:bg-lime hover:shadow-cta-hover"
            : "border border-bone/15 text-bone hover:border-moss/40 hover:bg-bone/5"
        )}
      >
        {tier.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <ul className="mt-8 flex flex-col gap-3">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm leading-[1.5] text-bone/80"
          >
            <Check className="mt-0.5 h-4 w-4 flex-none text-moss-bright" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
