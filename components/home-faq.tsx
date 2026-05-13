import type { ReactNode } from "react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

type FaqItem = { q: string; a: ReactNode };

// FAQ trimmed 8 → 5 on 2026-05-12 per the conversion-first plan. Kept
// only the objection-killers — setup time, adoption, refund, who runs
// onboarding, and the honest customer-count answer. Engines-as-features
// and founder-bio entries moved to /about (deferred).
const FAQS: FaqItem[] = [
  {
    q: "How long does setup actually take?",
    a: "48 hours from signed contract to live engines, founder-led. Two onboarding calls in week one. Your data — customers, jobs, invoices — moves over without you lifting a finger.",
  },
  {
    q: "Will my crew chiefs actually adopt this?",
    a: "The Field Crew App is a PWA that installs on the cheapest Android phone in 30 seconds. It works offline because the suburbs lose signal constantly. We've onboarded 50+-year-old crew chiefs in under 20 minutes.",
  },
  {
    q: "What if it doesn't deliver?",
    a: "30-day money-back guarantee. We refund the month, you keep the data export. No call to retain you, no fight.",
  },
  {
    q: "Who actually runs the onboarding?",
    a: "A founder. Not a CSM. Not a ticket queue. For the first year, every paying customer gets a direct line to Ricardo and Joshua. White-glove migration, two onboarding calls in week one, and a Slack channel that doesn't sleep.",
  },
  {
    q: "Do you have customers in my service area?",
    a: "We're early — a Sarasota lighting business (Bright Lights Landscape Lighting) is our first paying customer. The engines are geographic-agnostic by design: NOAA-timed seasonal logic auto-adjusts to your zone, your frost dates, your storm windows. We'd rather tell you the honest count than dress up a customer list.",
  },
];

export function HomeFaq() {
  return (
    <section className="border-t border-bone/10 bg-obsidian py-28">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <Eyebrow tone="champagne">FAQ</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
              Questions every owner asks us.
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-bone/10 bg-bone/[0.02] px-6 py-5 transition-colors open:border-champagne/30 open:bg-bone/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                  <span className="font-serif text-lg font-medium text-bone">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-champagne-bright/40 text-sm font-bold text-champagne-bright transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-4 text-[15px] leading-[1.6] text-bone/70">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
