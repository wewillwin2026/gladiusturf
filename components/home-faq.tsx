import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: "How long does setup actually take?",
    a: "48 hours from signed contract to live engines, founder-led. Two onboarding calls in week one. Your data — customers, jobs, invoices — moves over without you lifting a finger.",
  },
  {
    q: "Will my crew chiefs adopt this?",
    a: "The Field Crew App is a PWA that installs on the cheapest Android phone in 30 seconds. It works offline because the suburbs lose signal constantly. We've onboarded 50+-year-old crew chiefs in under 20 minutes.",
  },
  {
    q: "What about my QuickBooks?",
    a: "One-way sync to QuickBooks Online or Xero ships in week one. Your bookkeeper still gets clean books. We don't replace your accountant.",
  },
  {
    q: "How does this work with my existing phone system?",
    a: "We sit alongside it. Your office phone keeps ringing. We capture voicemails that go unreturned, route inbound texts the system can answer, and hand off the rest to your crew. Your number stays your number.",
  },
  {
    q: "What if it doesn't deliver?",
    a: "30-day money-back guarantee. We refund the month, you keep the data export. No call to retain you, no fight.",
  },
  {
    q: "Who's the founder and why landscape?",
    /* TODO: replace with real founder bio — 2 sentences, the "why landscape" thesis */
    a: "Founder bio coming soon. The thesis: $100B industry running on field-service software built for HVAC, with a labor crisis, a generational ownership transition, and zero AI-native tooling. We built the operating system the trade actually deserves.",
  },
  {
    q: "Why “33 engines” instead of just calling them features?",
    a: "A feature is something you ship and forget. An engine is something that runs every night, gets smarter from your data, and produces a measurable revenue outcome. Each of our 33 has a specific dollar number tied to it.",
  },
  {
    q: "Do you have customers in my service area?",
    /* TODO: update [N] when we publish the real cohort count */
    a: "Founding cohort spans multiple states. We're geographic-agnostic — the engines work the same in Florida as they do in Minnesota. NOAA-timed seasonal logic auto-adjusts to your climate.",
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
                <p className="mt-4 text-[15px] leading-[1.6] text-bone/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
