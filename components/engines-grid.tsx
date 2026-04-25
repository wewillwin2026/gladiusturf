import { EngineCard } from "@/components/engine-card";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ENGINE_TIERS } from "@/content/engine-tiers";
import { ENGINES } from "@/content/engines";

// Heritage rotation across the 5 tiers: champagne / moss / champagne / moss / champagne.
// 3-2 split favors the heritage default while still echoing the crest twice.
const TIER_ACCENT_ROTATION = [
  "champagne",
  "moss",
  "champagne",
  "moss",
  "champagne",
] as const;

export function EnginesGrid() {
  return (
    <section
      id="engines"
      className="border-t border-bone/10 bg-obsidian py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow className="mb-3">The thirty-three engines</Eyebrow>
            <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
              One spine. Five tiers.
              <br />
              <span className="text-champagne-bright">
                Thirty-three revenue engines.
              </span>
            </h2>
            <p className="mt-5 text-lg text-parchment/70">
              We don&apos;t ship features. We ship engines — and we organize
              them the way a crew actually runs the day. Win the work. Keep the
              customer. Get smarter every night. Execute in the field. Compound
              the network.
            </p>
          </div>
        </ScrollReveal>

        {ENGINE_TIERS.map((tier, tierIdx) => {
          const tierEngines = ENGINES.filter((e) => e.tier === tier.slug);
          const rotation =
            TIER_ACCENT_ROTATION[tierIdx % TIER_ACCENT_ROTATION.length];
          const tierToneCls =
            rotation === "moss"
              ? "text-moss-bright"
              : "text-champagne-bright";
          return (
            <div
              key={tier.slug}
              className={
                tierIdx === 0
                  ? "mt-20"
                  : "mt-24 border-t border-bone/10 pt-24"
              }
            >
              <ScrollReveal>
                <div className="mx-auto max-w-3xl text-center">
                  <Eyebrow className="mb-3" tone={rotation}>
                    Tier {tierIdx + 1} · {tier.name}
                  </Eyebrow>
                  <h3 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
                    <span className={tierToneCls}>{tier.tagline}</span>
                  </h3>
                  <p className="mt-4 text-base text-bone/60">{tier.blurb}</p>
                </div>
              </ScrollReveal>

              <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tierEngines.map((e, i) => (
                  <ScrollReveal key={e.slug} delay={i * 0.04}>
                    <EngineCard engine={e} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
