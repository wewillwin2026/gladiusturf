import {
  Cloud,
  Languages,
  Lightbulb,
  Map,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SOLUTIONS, SOLUTION_HEADER } from "@/lib/lighting/content";

const ICONS: Record<string, LucideIcon> = {
  Lightbulb,
  Languages,
  Map,
  Repeat,
  Cloud,
};

/**
 * Five lighting-specific feature cards. Lighting-vertical nouns (fixture,
 * transformer, low-voltage) used in copy. Same Twilight Bronze card aesthetic
 * as the bottlenecks above.
 */
export function LightingSolution() {
  return (
    <section className="border-b border-tw-line bg-tw-bg-quiet py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <h2 className="max-w-3xl font-tiempos text-3xl font-medium tracking-[-0.01em] text-tw-text-primary md:text-4xl">
            {SOLUTION_HEADER}
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((f, i) => {
            const Icon = ICONS[f.iconName] ?? Lightbulb;
            return (
              <ScrollReveal key={f.title} delay={(i % 3) * 0.05}>
                <article className="h-full rounded-lg border border-tw-line bg-tw-bg-elevated p-8 transition-colors hover:border-tw-accent-bronze/40">
                  <Icon
                    className="h-5 w-5 text-tw-accent-amber"
                    aria-hidden
                  />
                  <h3 className="mt-5 text-[18px] font-medium leading-[1.3] text-tw-text-primary">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.65] text-tw-text-secondary">
                    {f.body}
                  </p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
