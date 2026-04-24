import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ENGINES } from "@/content/engines";

export const metadata: Metadata = {
  title: "Seven engines",
  description:
    "A deep look at every engine that powers GladiusTurf. Each one ships a specific number to your bank account.",
};

const LONG_COPY: Record<string, string> = {
  "quote-intercept":
    "The moment an estimate request hits your inbox, Intercept routes it to the right crew, re-prices against the last 12 months of margin data, and texts the client a live link in under two minutes. If no one acts within your SLA, it escalates — to the foreman, then the owner. The average shop recovers 18–22 quotes a month that would otherwise vanish.",
  "upsell-whisperer":
    "Upsell Whisperer runs a continuous inspection on every property under contract. It flags aeration windows, mulch refresh cycles, irrigation leaks, and dying specimens before the client sees them. When a crew arrives, they see a prioritized list. The client gets a photo-backed proposal the same afternoon.",
  "referral-radar":
    "Radar maps every client to their neighbors, their HOA, and their referral history. It identifies which properties produce the most new business — and which reps are silently losing it. When a crew finishes a premium job, Radar drops a neighbor-facing postcard, text, or doorhanger the same day.",
  "applicator-shield":
    "Shield watches every applicator's license, every chemical's state registration, every spray record, every drift-risk weather window, and every renewal deadline. It blocks a spray you shouldn't do and alerts your office before a state inspector ever calls. One fine prevented pays for five years of GladiusTurf.",
  "site-memory":
    "Memory is where the gate code, the dog's name, the sprinkler zone that leaks, and the client's Monday-morning routine live. Every crew handoff captures a hundred small facts. A new hire pulls up the property on their phone Monday morning and knows more than last year's crew did.",
  "weather-pivot":
    "Pivot watches a rolling 7-day forecast against every scheduled visit. When a storm hits, it reshuffles the route, texts affected clients the new window, and reprioritizes chemical-safe days. You stop losing Saturday mornings to angry phone calls.",
  "surplus-yard":
    "Leftover sod, mulch, stone, trees, tools — Surplus Yard turns what rots in the yard into revenue. Post a listing, a crew across town buys it, payment lands in your bank. GladiusTurf takes 3%. The yard gets cleared.",
};

export default function ProductPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Seven engines · One platform
            </p>
            <h1 className="max-w-4xl font-serif text-display-md text-forest md:text-display-lg">
              Every engine is a specific number going into your bank account.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.6] text-stone">
              A feature is a button. An engine is an outcome. Below is every
              engine in GladiusTurf, with the dollar number we hold ourselves
              to.
            </p>
          </div>
        </section>

        {ENGINES.map((e, i) => (
          <section
            key={e.slug}
            id={e.slug}
            className={
              "scroll-mt-20 border-b border-[rgba(15,61,46,0.12)] " +
              (i % 2 === 0 ? "bg-paper" : "bg-bone")
            }
          >
            <div className="mx-auto grid max-w-content grid-cols-1 gap-12 px-6 py-20 md:grid-cols-[1fr_2fr] md:py-section">
              <div>
                <span className="font-serif text-[56px] leading-none text-forest">
                  {e.number}
                </span>
                <h2 className="mt-6 font-serif text-h2-md text-forest md:text-h2-lg">
                  {e.name}
                </h2>
                <p className="mt-4 font-mono text-[18px] text-moss">{e.outcome}</p>
              </div>
              <div>
                <p className="text-[18px] leading-[1.6] text-forest">
                  {e.description}
                </p>
                <p className="mt-6 text-[16px] leading-[1.7] text-stone">
                  {LONG_COPY[e.slug]}
                </p>
              </div>
            </div>
          </section>
        ))}

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
