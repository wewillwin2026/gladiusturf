import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SOLUTION } from "@/lib/lighting/content";

export function LightingSolution() {
  return (
    <section className="border-b border-bone/10 bg-slate-deep py-28">
      <div className="mx-auto max-w-content px-6">
        <ScrollReveal>
          <Eyebrow tone="honey">The product</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
            {SOLUTION.header}
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTION.features.map((f, i) => (
            <ScrollReveal key={f.title} delay={(i % 3) * 0.06}>
              <article className="h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 transition-colors hover:border-honey-bright/30">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-honey-bright"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-crest text-bone/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-[20px] leading-[1.25] text-bone">
                  {f.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-bone/65">
                  {f.body}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
