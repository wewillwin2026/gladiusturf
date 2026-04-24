import type { Tier } from "@/content/pricing";
import { cn } from "@/lib/cn";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-[4px] shrink-0">
      <path d="M3 8.5 L6.5 12 L13 4.5" stroke="#7FE27A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PricingTier({ tier }: { tier: Tier }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[12px] border bg-paper p-8 shadow-card",
        tier.featured
          ? "border-moss"
          : "border-[rgba(15,61,46,0.12)]"
      )}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-forest">
          Most popular
        </span>
      )}
      <h3 className="text-[20px] font-medium text-forest">{tier.name}</h3>
      <p className="mt-2 text-[14px] leading-[1.5] text-stone">{tier.tagline}</p>

      <div className="mt-8 flex items-baseline gap-2">
        <span className="font-mono text-[48px] leading-none text-forest">
          ${tier.price.toLocaleString()}
        </span>
        <span className="text-[14px] text-stone">{tier.period}</span>
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3 text-[14px] leading-[1.5] text-forest">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={`/demo?plan=${tier.id}`}
        className={cn(
          "mt-10 inline-flex items-center justify-center rounded-[8px] px-6 py-3 text-sm font-medium transition-colors",
          tier.featured
            ? "bg-forest text-bone hover:bg-forest/90"
            : "border border-forest bg-bone text-forest hover:bg-bone/70"
        )}
      >
        {tier.cta}
      </a>
    </div>
  );
}
