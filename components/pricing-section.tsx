import { PricingTier } from "@/components/pricing-tier";
import { BDC_ADDON, TIERS } from "@/content/pricing";

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
      <div className="mx-auto max-w-content px-6 py-20 md:py-section">
        <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
          Pricing · Flat per crew · Unlimited seats
        </p>
        <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
          Pick a crew size. Everyone on the crew gets a seat. No per-user math.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <PricingTier key={t.id} tier={t} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-bone px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[14px] font-medium text-forest">
              {BDC_ADDON.name} —{" "}
              <span className="font-mono text-forest">
                ${BDC_ADDON.price}
              </span>
              <span className="text-stone">{BDC_ADDON.period}</span>
            </p>
            <p className="mt-1 text-[13px] leading-[1.5] text-stone">
              {BDC_ADDON.description}
            </p>
          </div>
          <a
            href="/demo?addon=bdc"
            className="inline-flex items-center rounded-[8px] border border-forest bg-paper px-4 py-2 text-sm font-medium text-forest hover:bg-bone/70"
          >
            Add BDC
          </a>
        </div>
      </div>
    </section>
  );
}
