import type { Metadata } from "next";
import { Quote, X } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Landscaping is a $115B industry run on spreadsheets, paper invoices, and forgotten quotes. Here is what we believe, what we will never do, and the ten rules we build by.",
  alternates: { canonical: "/manifesto" },
};

const COMMANDMENTS: { headline: string; body: string }[] = [
  {
    headline: "The crew is the customer.",
    body: "The owner signs the invoice, but the crew has to live in the software at 5:47 AM with cold hands and a cracked phone. If a foreman can't run his day from the truck without calling the office, the product has failed before payroll prints.",
  },
  {
    headline:
      "Revenue you didn't capture is more expensive than revenue you didn't book.",
    body: "Booked revenue you missed costs you the job. Captured revenue you missed — the upsell, the renewal, the referral, the follow-up irrigation tune — costs you the customer. We design for the second number, because the second number is where shops actually die.",
  },
  {
    headline:
      "The forgotten quote is the largest line item on every landscaping P&L.",
    body: "The average shop sends quotes that never close, never die, and never get a second touch. That pile is six figures a year, sitting in an inbox, paying nobody. The first job of this software is to make sure no quote ever gets forgotten again.",
  },
  {
    headline: "One spine, thirty-three engines. Not one app per workflow.",
    body: "Your shop is not thirty-three shops. Quoting, scheduling, routing, chemicals, billing, books, payroll, retention, and surplus are one business — they share a customer, a property, a crew, and a clock. We refuse to ship a stack of disconnected tools that pretend otherwise.",
  },
  {
    headline: "Per-crew pricing or it's a tax on growth.",
    body: "Per-seat pricing punishes you for hiring. It tells the owner that every new foreman is a line item. We price by crew, because crews are how you make money, and we will not be the reason a good kid doesn't get a login.",
  },
  {
    headline: "We don't sell modules. We close revenue gaps.",
    body: "Every engine we ship has a number on it — dollars recovered, jobs saved, days back. If an engine can't show its money, it doesn't ship. If a shipped engine stops showing its money, we rebuild it or rip it out.",
  },
  {
    headline: "Weather is a planning input, not an excuse.",
    body: "Rain happens. Frost happens. The wind picks up at 11:14 and the spray window closes. Software that pretends otherwise is software written by people who have never lost a Tuesday. We build for the storm, not the brochure.",
  },
  {
    headline:
      "Every site has memory. Every customer has a story. Treat both as assets.",
    body: "The hedge that always grows back ugly on the south side. The dog that bites. The gate code that changes every April. That knowledge belongs to your business, not to a foreman who quits in the fall. We make memory portable, durable, and crew-shaped.",
  },
  {
    headline: "The route is a revenue product, not a logistics chore.",
    body: "Every truck-hour is a unit of capacity, and every unit of capacity has a margin. Treating the route as a Google Maps problem instead of a P&L problem is how shops grow revenue while losing money. We optimize for dollars per windshield-minute, not miles.",
  },
  {
    headline:
      "Surplus pallets, slabs, sod, and stone are someone else's pipeline. Make the marketplace.",
    body: "Every shop in America has a back lot of half-pallets, leftover sod rolls, takeoff stone, and unused mulch. That inventory is cash, sitting in the rain. We turn it into a regional marketplace, because the trade should not be subsidizing big-box returns desks.",
  },
];

const BELIEFS: { headline: string; body: string }[] = [
  {
    headline: "Software should pay the crew before it pays itself.",
    body: "If we cost a shop $399 a month, we should put $4,000 back in their pocket the same month. If we can't, we don't deserve the line item.",
  },
  {
    headline: "Spreadsheets are not the enemy. Disconnection is.",
    body: "A clean spreadsheet has beaten a bad SaaS in this industry for twenty years. We earn our place by being more useful, not by being more modern.",
  },
  {
    headline: "Trades software has been condescending for too long.",
    body: "Landscape owners are operators, capital allocators, and crew leaders. Build for them like you'd build for a hedge fund — fast, dense, and honest about the numbers.",
  },
  {
    headline: "The phone is the office.",
    body: "Anything that requires a desktop to do well is a feature that didn't ship. The truck is the office. The phone is the cash register. Build accordingly.",
  },
  {
    headline: "Trust is a six-month exercise, not a launch event.",
    body: "We will earn your data, your team, and your retention week by week. The day we stop earning it is the day we deserve to be cancelled.",
  },
  {
    headline: "The customer should never have to call to ask 'when are you coming.'",
    body: "Customers should never have to call to ask 'when are you coming.' That's why every plan ships with a branded client portal and an intelligent cadence engine.",
  },
];

const NEVERS: string[] = [
  "We will never charge per seat. Crews grow. Software shouldn't punish that.",
  "We will never lock your data. Full export, your format, on demand, free, for the life of the account and after.",
  "We will never gate basic exports, basic reports, or basic API access behind an enterprise tier.",
  "We will never sell ads inside the product. Your foreman's screen is not inventory we get to rent out.",
  "We will never sell, syndicate, or resell your customer list, your crew data, your route data, or your pricing. Not to a competitor, not to a private equity acquirer, not to a marketing partner. Not ever.",
];

// The featured commandment we pull as the band quote — Commandment III is the
// rallying cry of the company.
const FEATURED_COMMANDMENT_INDEX = 2;

export default function ManifestoPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* HERO — heritage monolith, pure pitch */}
        <section className="relative overflow-hidden bg-pitch">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(201,168,122,0.12),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] opacity-[0.08] [background-image:linear-gradient(to_right,rgba(234,227,210,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(234,227,210,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-28 md:py-32">
            <Pill tone="champagne" className="mb-8">Manifesto</Pill>
            <h1 className="font-serif text-5xl tracking-[-0.02em] leading-[1.05] text-bone md:text-7xl">
              Landscaping is a $115B industry run on spreadsheets, paper
              invoices, and forgotten quotes.
            </h1>
            <p className="mt-10 max-w-2xl text-xl leading-relaxed text-bone/70">
              We are the first software company that thinks that&apos;s a
              scandal — and the last one that will treat it like a feature
              backlog instead of a fight.
            </p>
          </div>
        </section>

        {/* OPENING DECLARATION */}
        <section className="border-t border-bone/5">
          <div className="mx-auto max-w-3xl px-6 py-28">
            <div className="flex flex-col gap-8 text-xl leading-relaxed text-bone/70">
              <p>
                The trade is the most underleveraged service business in
                America. Two and a half million workers. A hundred and fifteen
                billion dollars of annual revenue. Margins that should be
                healthy and rarely are. Crews that show up at dawn, run hard
                physical work in heat and frost, hold chemical licenses, drive
                heavy trucks, and operate equipment that costs more than most
                cars. The work is skilled, weather-exposed, and load-bearing
                for every American suburb. The back-office tooling treats it
                like a side hustle.
              </p>
              <p>
                Landscape owners are quoted in industry conferences as
                &ldquo;the next wave of digital transformation.&rdquo; What
                that has meant in practice is a steady drip of software built
                by people who have never sat in a F-250 at 5:47 AM with a cold
                cup of gas-station coffee, watching the sky to decide if the
                spray window is going to hold. They&apos;ve built dashboards.
                They&apos;ve built scheduling grids. They&apos;ve built field
                service rolodexes that ship a generic CRM with a green logo.
                They have not built revenue intelligence. They have not built
                anything that pays the crew before it pays itself.
              </p>
              <p>
                We&apos;re building the opposite. GladiusTurf is one spine,
                thirty-three engines, priced per crew, designed for the foreman first
                and the office second. It is not a CRM. A CRM is a rolodex
                with a calendar bolted on. What landscape shops actually need
                is a system that watches the property, watches the crew,
                watches the weather, watches the chemicals, watches the
                quotes, and tells a human exactly what to do next — and how
                much that next move is worth. That is what we built. And this
                document is how we promise to keep building it.
              </p>
            </div>
          </div>
        </section>

        {/* THE TEN COMMANDMENTS */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-6">The Ten Commandments</Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                Ten rules we build by. We will not break any of them for any
                customer, investor, or quarter.
              </h2>
            </div>

            <ol className="mt-24 flex flex-col gap-8">
              {COMMANDMENTS.map((c, i) => {
                const isFeatured = i === FEATURED_COMMANDMENT_INDEX;
                // Marquee commandment keeps the moss halo (logo echo).
                const cardCls = isFeatured
                  ? "rounded-2xl border border-moss/30 bg-gradient-to-b from-moss/10 to-transparent p-8 md:p-12 shadow-pop"
                  : "rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 md:p-12";
                // Odd commandments → moss (logo echo). Even → champagne (heritage).
                const numeralCls =
                  (i + 1) % 2 === 1
                    ? "text-moss-bright/40"
                    : "text-champagne-bright/40";
                return (
                  <li key={c.headline} className={cardCls}>
                    <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-12">
                      <div className={`font-mono text-7xl leading-none md:text-8xl ${numeralCls}`}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex flex-col gap-4">
                        <h3 className="font-serif text-3xl tracking-[-0.01em] leading-[1.15] text-bone md:text-4xl">
                          {c.headline}
                        </h3>
                        <p className="text-lg leading-relaxed text-bone/60">
                          {c.body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* PULL-QUOTE BAND — slate-deep with champagne quote glyph */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-5xl px-6 py-28">
            <Quote
              className="mb-8 h-12 w-12 text-champagne-bright/60"
              aria-hidden
            />
            <blockquote className="font-serif text-3xl tracking-[-0.01em] leading-[1.15] text-parchment md:text-5xl">
              &ldquo;{COMMANDMENTS[FEATURED_COMMANDMENT_INDEX].headline}&rdquo;
            </blockquote>
            <p className="mt-10 text-xs font-semibold uppercase tracking-crest text-bone/40">
              — Commandment{" "}
              {String(FEATURED_COMMANDMENT_INDEX + 1).padStart(2, "0")}
            </p>
          </div>
        </section>

        {/* WHAT WE BELIEVE */}
        <section className="border-t border-bone/5">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-6">What we believe</Eyebrow>
              <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
                Six positions we&apos;ll defend in public, in writing, and in
                the product.
              </h2>
            </div>

            <div className="mt-20 grid gap-6 md:grid-cols-2">
              {BELIEFS.map((b, i) => (
                <div
                  key={b.headline}
                  className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
                >
                  <div
                    className={`font-mono text-sm font-semibold uppercase tracking-crest ${
                      i % 2 === 0 ? "text-champagne-bright" : "text-moss-bright"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")} / Belief
                  </div>
                  <h3 className="mt-4 font-serif text-2xl tracking-[-0.01em] leading-[1.2] text-bone md:text-3xl">
                    {b.headline}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-bone/60">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT WE WILL NEVER DO — rotate champagne / moss / champagne / moss / champagne */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-5xl px-6 py-28">
            <Eyebrow tone="champagne" className="mb-6">Hard nos</Eyebrow>
            <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.1] text-bone md:text-5xl">
              Five things we will never do.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-bone/60">
              Read them. Hold us to them.
            </p>

            <ul className="mt-16 flex flex-col">
              {NEVERS.map((n, i) => {
                // rotate: 0,2,4 → champagne · 1,3 → moss
                const isChampagne = i % 2 === 0;
                const xCls = isChampagne
                  ? "border-champagne-bright/40 bg-champagne-bright/10 text-champagne-bright"
                  : "border-moss-bright/40 bg-moss-bright/10 text-moss-bright";
                return (
                  <li
                    key={i}
                    className="flex items-start gap-6 border-t border-bone/10 py-8 last:border-b"
                  >
                    <span
                      className={`mt-2 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border ${xCls}`}
                      aria-hidden
                    >
                      <X className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <p className="font-serif text-2xl leading-[1.25] text-bone">
                      {n}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* WHO WE ARE — founder narrative on slate-deep, parchment text for warmth */}
        <section className="border-t border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-3xl px-6 py-28">
            <Eyebrow tone="champagne" className="mb-6">Who we are</Eyebrow>
            <h2 className="font-serif text-4xl tracking-[-0.01em] leading-[1.05] text-parchment md:text-5xl">
              Built by people who&apos;ve ridden in trucks at 5 AM.
            </h2>

            <div className="mt-12 flex flex-col gap-7 text-xl leading-relaxed text-parchment/75">
              <p>
                We are a small team that grew up around the trade. We&apos;ve
                pulled weeds at our father&apos;s shop, ridden the route on
                summer mornings when the spray rig was still wet from the
                rinse-down, and sat at the kitchen table while the owner ran
                the books on a yellow legal pad. We&apos;ve also built
                production software for hedge funds, automotive groups, and
                stone fabricators. We know what the back of a real P&amp;L
                looks like, and we know what a clean codebase looks like, and
                we are no longer willing to accept that those two things
                belong to different industries.
              </p>
              <p>
                The shop in our hometown lost a customer last spring because a
                quote sat unread for nine days, and the owner found out by
                reading a Google review. That story is the entire reason this
                company exists. We are not building a CRM. We are not building
                a workflow tool. We are building a revenue system for the
                people who hold this country&apos;s yards, fields, and
                fairways together — and we are building it the way we&apos;d
                want it built if our name were on the truck.
              </p>
              <p className="pt-4 font-serif text-lg italic text-parchment/45">
                — The founders, GladiusTurf
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative border-t border-bone/5 bg-slate-deep">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(212,178,122,0.10),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-28 text-center">
            <Eyebrow tone="lime" className="mb-6">
              If this sounds right
            </Eyebrow>
            <h2 className="mx-auto max-w-3xl font-serif text-4xl tracking-[-0.02em] leading-[1.05] text-bone md:text-6xl">
              See the demo.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-bone/60">
              Twenty minutes. Your shop&apos;s real numbers. We&apos;ll show
              you exactly which engine pays for itself first.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <CtaButton href="/demo" size="lg">
                Book the demo
              </CtaButton>
              <CtaButton href="/product" variant="ghost-champagne">
                See the product
              </CtaButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
