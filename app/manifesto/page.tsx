import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { QuoteBlock } from "@/components/quote-block";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Landscaping is a $115B industry run on spreadsheets, paper invoices, and forgotten quotes. Here is what we believe, what we will never do, and the ten rules we build by.",
};

const COMMANDMENTS: { headline: string; body: string }[] = [
  {
    headline: "The crew is the customer.",
    body: "The owner signs the invoice, but the crew has to live in the software at 5:47 AM with cold hands and a cracked phone. If a foreman can't run his day from the truck without calling the office, the product has failed before payroll prints.",
  },
  {
    headline: "Revenue you didn't capture is more expensive than revenue you didn't book.",
    body: "Booked revenue you missed costs you the job. Captured revenue you missed — the upsell, the renewal, the referral, the follow-up irrigation tune — costs you the customer. We design for the second number, because the second number is where shops actually die.",
  },
  {
    headline: "The forgotten quote is the largest line item on every landscaping P&L.",
    body: "The average shop sends quotes that never close, never die, and never get a second touch. That pile is six figures a year, sitting in an inbox, paying nobody. The first job of this software is to make sure no quote ever gets forgotten again.",
  },
  {
    headline: "One spine, seven engines. Not one app per workflow.",
    body: "Your shop is not seven shops. Quoting, scheduling, routing, chemicals, billing, retention, and surplus are one business — they share a customer, a property, a crew, and a clock. We refuse to ship a stack of disconnected tools that pretend otherwise.",
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
    headline: "Every site has memory. Every customer has a story. Treat both as assets.",
    body: "The hedge that always grows back ugly on the south side. The dog that bites. The gate code that changes every April. That knowledge belongs to your business, not to a foreman who quits in the fall. We make memory portable, durable, and crew-shaped.",
  },
  {
    headline: "The route is a revenue product, not a logistics chore.",
    body: "Every truck-hour is a unit of capacity, and every unit of capacity has a margin. Treating the route as a Google Maps problem instead of a P&L problem is how shops grow revenue while losing money. We optimize for dollars per windshield-minute, not miles.",
  },
  {
    headline: "Surplus pallets, slabs, sod, and stone are someone else's pipeline. Make the marketplace.",
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
];

const NEVERS: string[] = [
  "We will never charge per seat. Crews grow. Software shouldn't punish that.",
  "We will never lock your data. Full export, your format, on demand, free, for the life of the account and after.",
  "We will never gate basic exports, basic reports, or basic API access behind an enterprise tier.",
  "We will never sell ads inside the product. Your foreman's screen is not inventory we get to rent out.",
  "We will never sell, syndicate, or resell your customer list, your crew data, your route data, or your pricing. Not to a competitor, not to a private equity acquirer, not to a marketing partner. Not ever.",
];

export default function ManifestoPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        {/* HERO */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-8 text-sm uppercase tracking-tagline text-stone">
              The GladiusTurf Manifesto
            </p>
            <h1 className="max-w-5xl font-serif text-display-md text-forest md:text-display-lg">
              Landscaping is a $115B industry run on spreadsheets, paper
              invoices, and forgotten quotes.
            </h1>
            <p className="mt-10 max-w-3xl text-[19px] leading-[1.55] text-stone">
              We are the first software company that thinks that&apos;s a
              scandal — and the last one that will treat it like a feature
              backlog instead of a fight.
            </p>
          </div>
        </section>

        {/* OPENING DECLARATION */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-section">
            <p className="mb-8 text-sm uppercase tracking-tagline text-forest">
              Why we&apos;re here
            </p>
            <div className="flex flex-col gap-7 text-[18px] leading-[1.7] text-forest">
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
                seven engines, priced per crew, designed for the foreman first
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
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-forest">
              The Ten Commandments
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Ten rules we build by. We will not break any of them for any
              customer, investor, or quarter.
            </h2>

            <ol className="mt-16 grid gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-14">
              {COMMANDMENTS.map((c, i) => (
                <li key={c.headline} className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif text-[22px] leading-[1.25] text-forest md:text-[26px]">
                      {c.headline}
                    </h3>
                  </div>
                  <p className="pl-12 text-[16px] leading-[1.6] text-forest/80">
                    {c.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <QuoteBlock />

        {/* WHAT WE BELIEVE */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-forest">
              What we believe
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Five positions we&apos;ll defend in public, in writing, and in
              the product.
            </h2>

            <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-x-16">
              {BELIEFS.map((b) => (
                <div
                  key={b.headline}
                  className="border-l-2 border-moss pl-6"
                >
                  <h3 className="font-serif text-[20px] leading-[1.3] text-forest md:text-[22px]">
                    {b.headline}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[1.6] text-forest/80">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT WE WILL NEVER DO */}
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-forest text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-moss">
              What we will never do
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Five hard nos. Read them. Hold us to them.
            </h2>

            <ul className="mt-16 flex flex-col">
              {NEVERS.map((n, i) => (
                <li
                  key={i}
                  className="flex items-start gap-6 border-t border-bone/15 py-7 last:border-b"
                >
                  <span className="font-mono text-[13px] uppercase tracking-tagline text-moss">
                    No.{String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[18px] leading-[1.55] text-bone">{n}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-forest">
              Who we are
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Built by people who&apos;ve ridden in trucks at 5 AM and watched
              quotes die in inboxes.
            </h2>

            <div className="mt-12 flex flex-col gap-7 text-[18px] leading-[1.7] text-forest">
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
              <p className="pt-4 font-serif italic text-stone">
                — The founders, GladiusTurf
              </p>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
