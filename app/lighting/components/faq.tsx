import { Plus } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FAQ } from "@/lib/lighting/content";

/**
 * Eight lighting-specific FAQs per LIGHTING_LEGENDARY §7.6. Native
 * <details>/<summary> accordion — no JS framework dependency, fully
 * accessible by default, indexable by search engines for FAQPage schema.
 */
export function LightingFaq() {
  return (
    <section className="border-b border-tw-line bg-tw-bg-base py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <h2 className="font-tiempos text-3xl font-medium tracking-[-0.01em] text-tw-text-primary md:text-4xl">
            Real questions a lighting operator would actually ask.
          </h2>
        </ScrollReveal>

        <div className="mt-12 flex flex-col divide-y divide-tw-line border-y border-tw-line">
          {FAQ.map((item, i) => (
            <ScrollReveal key={item.q} delay={(i % 4) * 0.04}>
              <details className="group py-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                  <h3 className="text-[17px] font-medium leading-[1.4] text-tw-text-primary">
                    {item.q}
                  </h3>
                  <Plus
                    className="mt-1 h-5 w-5 shrink-0 text-tw-accent-bronze transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-tw-text-secondary">
                  {item.a}
                </p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
