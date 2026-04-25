import { PackageCheck, Settings2, TrendingUp } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

const STEPS = [
  {
    n: "01",
    Icon: PackageCheck,
    title: "Switch in 48 hours.",
    body:
      "Founder-led migration. We move your customer list, active jobs, and open invoices off Jobber, LMN, Aspire, or Service Autopilot. You don't lift a finger.",
  },
  {
    n: "02",
    Icon: Settings2,
    title: "White-glove setup.",
    body:
      "Two onboarding calls in the first week. We configure the engines for your service mix, your service area, and your crew. Every engine ships with sane defaults you can tune later.",
  },
  {
    n: "03",
    Icon: TrendingUp,
    title: "First leak closes inside 30 days.",
    body:
      "The engines start running on Day 1. Average founding crew sees the first recovered invoice or rescued quote inside 30 days. If they don't, you get a full refund and keep the data.",
  },
];

/**
 * 3-step horizontal ladder showing onboarding flow. Designed to live between
 * the product highlights and the engines grid.
 */
export function HowItWorks() {
  return (
    <section className="border-y border-bone/10 bg-slate-deep py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <Eyebrow tone="champagne">How it works</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
              From signed contract to first recovered dollar.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-bone/60">
              Three steps. Founder-led the whole way. No 90-day implementation
              drag.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.Icon;
            const accent =
              i === 1 ? "text-champagne-bright" : "text-moss-bright";
            return (
              <ScrollReveal key={step.n} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-sm tracking-crest ${accent}`}
                    >
                      {step.n}
                    </span>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        i === 1
                          ? "border-champagne-bright/40"
                          : "border-moss-bright/40"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${accent}`} />
                    </span>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold tracking-[-0.01em] text-bone">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-bone/70">
                    {step.body}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
