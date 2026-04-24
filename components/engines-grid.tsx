import { EngineCard } from "@/components/engine-card";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ENGINES } from "@/content/engines";

export function EnginesGrid() {
  return (
    <section
      id="engines"
      className="border-t border-bone/10 bg-forest-deep py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow className="mb-3">The seven engines</Eyebrow>
            <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
              One spine. Seven revenue engines.
            </h2>
            <p className="mt-5 text-lg text-bone/65">
              We don&apos;t ship features. We ship engines. Each one replaces a
              tool you&apos;re already paying for and pays for itself inside the
              first month.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ENGINES.map((e, i) => (
            <ScrollReveal key={e.slug} delay={i * 0.05}>
              <EngineCard engine={e} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
