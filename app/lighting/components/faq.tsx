import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FAQ } from "@/lib/lighting/content";

export function LightingFaq() {
  return (
    <section className="border-b border-bone/10 bg-slate-deep py-28">
      <div className="mx-auto max-w-content px-6">
        <ScrollReveal>
          <Eyebrow tone="honey">FAQ</Eyebrow>
          <h2 className="mt-3 font-serif text-h2-md font-semibold tracking-[-0.01em] text-bone md:text-h2-lg">
            Real questions a lighting operator would actually ask.
          </h2>
        </ScrollReveal>

        <div className="mt-12 flex flex-col divide-y divide-bone/10 border-t border-b border-bone/10">
          {FAQ.map((item, i) => (
            <ScrollReveal key={item.q} delay={(i % 3) * 0.04}>
              <div className="grid grid-cols-1 gap-3 py-7 md:grid-cols-[1fr_2fr] md:gap-10">
                <h3 className="font-serif text-[18px] font-semibold leading-[1.3] text-bone">
                  {item.q}
                </h3>
                <p className="text-[15px] leading-[1.65] text-bone/65">
                  {item.a}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
