import { ScrollReveal } from "@/components/scroll-reveal";
import { PROBLEM } from "@/lib/lighting/content";

export function LightingProblem() {
  return (
    <section className="border-b border-bone/10 bg-obsidian py-24 md:py-28">
      <div className="mx-auto max-w-content px-6">
        <ScrollReveal>
          <h2 className="max-w-3xl font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
            {PROBLEM.header}
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {PROBLEM.bullets.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 0.06}>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-honey-bright"
                />
                <div>
                  <h3 className="font-serif text-[20px] leading-[1.25] text-bone">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-bone/65">
                    {b.body}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
