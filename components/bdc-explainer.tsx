import Link from "next/link";
import { ArrowRight, PhoneCall, RefreshCcw, Waves } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";

const FEATURES = [
  {
    Icon: PhoneCall,
    title: "24/7 AI phone answering",
    body:
      "Picks up every call you'd miss. Books appointments live. Routes urgent jobs to your dispatcher. Your number stays your number.",
  },
  {
    Icon: RefreshCcw,
    title: "Outbound re-engagement",
    body:
      "Calls back every ghosted quote, every dormant account, every expired contract. Reads from your Site Memory so the conversation sounds personal.",
  },
  {
    Icon: Waves,
    title: "Spring-rush overflow",
    body:
      "When your office phone rings 200x a day in March, BDC absorbs the surge so your team handles only the high-intent ones.",
  },
];

export function BdcExplainer() {
  return (
    <section className="border-t border-bone/10 bg-pitch py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="champagne">GladiusBDC · Add-on</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
              Your 24/7 phone team, without the headcount.
            </h2>
            <p className="mt-4 text-lg text-bone/65">
              Most shops lose their best leads to voicemail between 5pm Friday
              and 8am Monday. BDC catches every one.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.Icon;
            const accent =
              i === 1 ? "text-champagne-bright" : "text-moss-bright";
            const accentBorder =
              i === 1 ? "border-champagne-bright/40" : "border-moss-bright/40";
            return (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${accentBorder}`}
                  >
                    <Icon className={`h-5 w-5 ${accent}`} />
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-semibold text-bone">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-bone/70">
                    {f.body}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-champagne/25 bg-champagne/[0.03] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-[1.5] text-bone/85">
              <span className="font-mono text-champagne-bright">$499/mo.</span>
              <span className="text-bone/55">
                {" "}
                Plugs into any tier. Cancel with 30 days&rsquo; notice.
              </span>
            </p>
            <Link
              href="/demo?addon=bdc"
              className="group inline-flex items-center gap-1.5 rounded-full bg-lime-bright px-5 py-2.5 text-sm font-semibold text-forest shadow-cta transition-all hover:bg-lime hover:shadow-cta-hover"
            >
              Add BDC to your demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
