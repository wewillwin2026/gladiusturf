import { ScrollReveal } from "@/components/scroll-reveal";
import { PROBLEMS, PROBLEM_HEADER } from "@/lib/lighting/content";

/**
 * Six bottleneck cards, 2 columns × 3 rows on desktop, single column mobile.
 * Each title gets a subtle bronze underline accent. No bullet lists inside
 * cards per spec — one short paragraph per card.
 */
export function LightingProblem() {
  return (
    <section className="border-y border-tw-line bg-tw-bg-base py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <h2 className="max-w-3xl font-tiempos text-3xl font-medium tracking-[-0.01em] text-tw-text-primary md:text-4xl">
            {PROBLEM_HEADER}
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PROBLEMS.map((p, i) => (
            <ScrollReveal key={p.title} delay={(i % 2) * 0.05}>
              <article className="relative h-full rounded-lg border border-tw-line bg-tw-bg-elevated p-8 transition-colors hover:border-tw-accent-bronze/40">
                <h3 className="relative inline-block pb-2 text-[18px] font-medium leading-[1.3] text-tw-text-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-12 after:bg-tw-accent-bronze">
                  {p.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.65] text-tw-text-secondary">
                  {p.body}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
