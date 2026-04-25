import { Quote } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

// TODO: swap placeholder for real beta customer quote before launch.
export function QuoteBlock() {
  return (
    <section className="bg-pitch py-28">
      <div className="mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <div className="rounded-3xl border border-champagne/20 bg-pitch p-10 md:p-14">
            <Quote
              className="h-10 w-10 text-champagne-bright"
              aria-hidden
            />
            <blockquote className="mt-6 font-serif text-2xl font-medium italic leading-snug tracking-[-0.01em] text-bone md:text-3xl">
              &ldquo;We killed five subscriptions in our first 30 days on
              GladiusTurf and added $43K in upsell revenue we would have left
              on the table. It pays the crew before it pays itself.&rdquo;
            </blockquote>
            <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-honey-deep font-serif text-lg font-semibold text-pitch">
                  RB
                </div>
                <div>
                  <div className="font-medium text-bone">Riley Boone</div>
                  <div className="text-sm text-bone/55">
                    Owner · 14-crew shop, North Carolina
                  </div>
                </div>
              </div>
              <div className="ml-auto text-left sm:text-right">
                <div className="font-serif text-3xl font-semibold text-champagne-bright">
                  +$43K
                </div>
                <div className="text-xs text-bone/55">
                  upsell revenue · first 30 days
                </div>
              </div>
            </div>
            <p className="mt-6 text-[11px] uppercase tracking-crest text-bone/35">
              Placeholder · swap with verified quote pre-launch
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
