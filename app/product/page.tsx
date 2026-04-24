import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TopographicBg } from "@/components/topographic-bg";
import { ENGINES } from "@/content/engines";

export const metadata: Metadata = {
  title: "Product · The seven-engine operating system for landscaping revenue",
  description:
    "GladiusTurf replaces Jobber, LMN, Service Autopilot and a stack of point tools with seven outcome-driven engines that share one data spine — quote to schedule to crew to invoice to review to upsell.",
};

type EngineCopy = {
  slug: string;
  tagline: string;
  paragraphs: string[];
  features: string[];
};

const ENGINE_COPY: EngineCopy[] = [
  {
    slug: "quote-intercept",
    tagline: "The first hour decides the deal.",
    paragraphs: [
      "Eighty percent of mowing, hardscape, and irrigation estimates are won or lost in the first sixty minutes after the request hits your inbox. Quote Intercept watches every channel — web form, Google LSA, Angi, voicemail transcript, ServiceTitan booking, even the foreman&rsquo;s scribbled note photographed from the truck — and pulls every inbound into one queue with a single owner and a hard SLA.",
      "The engine then reprices the request against your last twelve months of margin data. It knows that your three-cut Bermuda lawns under a half-acre run 38% gross, that retaining-wall jobs over twenty linear feet need a foreman site visit before quoting, and that your Tuesday spray windows are already overbooked. Within ninety seconds it produces a quote the rep can send as-is or sharpen in two clicks. The client gets a live, mobile-signable proposal — not a PDF buried in a Gmail thread.",
      "If the rep doesn&rsquo;t move on it, escalation does. Foreman at four hours. Owner at twelve. Lost-deal autopsy at seventy-two. The average shop running Intercept recovers eighteen to twenty-two estimates a month that would have rotted in voicemail — at an average ticket of $1,840, that&rsquo;s the bill paid before the second week of the month.",
    ],
    features: [
      "Twelve-month margin model auto-prices mow, hardscape, irrigation, and tree work",
      "Live e-sign proposals replace PDF attachments and chasing phone tag",
      "SLA escalations route to rep, foreman, owner — with timestamps you can audit",
      "Lost-deal autopsy flags pricing or response gaps before they become patterns",
    ],
  },
  {
    slug: "upsell-whisperer",
    tagline: "The route is the salesfloor.",
    paragraphs: [
      "Every existing property under contract is a continuous inspection target. Upsell Whisperer pulls satellite imagery, soil-temperature data, the property&rsquo;s mow history, the irrigation controller&rsquo;s leak log, the last fertilization round, and a year of crew photo notes — then surfaces what each property needs this week. Aeration is due on the cool-season turf. The Bradford pear in the side yard is splitting. Zone four has been running thirty-percent over baseline for six days. The mulch ring on the front bed has thinned past the salesman&rsquo;s threshold.",
      "When the crew rolls up Monday morning, they don&rsquo;t open a clipboard. They open the property card and see a prioritized list of three to five whisper-upsells, each with a photo from last visit, a script written for that crew&rsquo;s reading level, and a price already approved by the office. The foreman walks the homeowner outside, points, takes one new photo, and the proposal is texted before the truck pulls away.",
      "Average shop adds $38,000 a month in unbooked revenue inside ninety days — without hiring a salesperson, without running a single outbound campaign, without a homeowner ever feeling sold. Whisper, don&rsquo;t pitch.",
    ],
    features: [
      "Satellite, soil, irrigation, and crew-photo data fused into a per-property work list",
      "Pre-priced add-ons for aeration, overseed, mulch refresh, drainage, tree, and irrigation repair",
      "Photo-backed text proposals signed in the driveway before the truck leaves",
      "Crew-readable scripts so foremen can pitch without a cold-call manager",
    ],
  },
  {
    slug: "referral-radar",
    tagline: "Every premium job is a billboard.",
    paragraphs: [
      "Referral Radar maps every active property to its neighbors, its HOA, and its referral lineage. It knows that the client on Maple Ridge came from the Halls on Birch, that the Halls came from a yard sign in 2022, and that the Birch cul-de-sac has produced eleven jobs at an average ticket of $4,200. It also knows which crews and which reps generate referrals — and which ones quietly burn them.",
      "When a premium hardscape, install, or full-renovation job wraps, Radar fires the same afternoon. A geotargeted postcard hits the next-door and across-the-street addresses by Wednesday. A text drop reaches the HOA distribution list. A doorhanger queue prints to the foreman&rsquo;s next morning. The new homeowner on Maple Ridge sees three signals before the competitor&rsquo;s salesman has finished his coffee.",
      "Radar also publishes a weekly Referral Health score per crew and per rep. If a foreman is on a six-week dry spell after years of producing word-of-mouth, you see it before churn does. We&rsquo;ve seen single shops claw back $180,000 a year in referral revenue that was sitting on the table because nobody was measuring the silent leak.",
    ],
    features: [
      "Geo-graph of every property, neighbor, and HOA tied to historical referral revenue",
      "Same-day postcard, text, and doorhanger campaigns triggered by job completion",
      "Per-crew and per-rep Referral Health scoring with leak alerts",
      "Yard-sign-to-revenue attribution so you know what marketing is actually working",
    ],
  },
  {
    slug: "applicator-shield",
    tagline: "One missed renewal is one closed business.",
    paragraphs: [
      "Pesticide and fertilizer compliance is the silent business-killer in lawn maintenance. State applicator licenses, EPA product registrations, drift-risk wind windows, REI hold periods, organic-certified zone overrides, sensitive-site setbacks, and the lawful-application logs your state inspector will ask for in front of your client — all live in spreadsheets, sticky notes, and the head of one office manager who is one resignation away from the door.",
      "Applicator Shield watches every applicator&rsquo;s license expiration, every chemical&rsquo;s registration in every state you operate in, every spray ticket against real-time wind and humidity, and every renewal CEU your team is due. If a tech tries to log a 2,4-D application on a windy Thursday next to a school zone, Shield blocks the ticket and routes the office. If a license is sixty days from lapsing, the renewal queue is already started. If an inspector calls, you produce a complete spray-and-license audit in under five minutes.",
      "One avoided fine pays for five years of GladiusTurf. One protected license keeps the doors open. This is the engine you don&rsquo;t notice — until the day it earns its keep ten times over.",
    ],
    features: [
      "Live license tracking with auto-renewal queues for every applicator and every state",
      "Per-product registration, REI, and sensitive-site rules enforced at ticket creation",
      "Real-time weather and wind blocks for drift-risk applications",
      "One-click inspector audit pack — every spray, every license, every CEU",
    ],
  },
  {
    slug: "site-memory",
    tagline: "Knowledge that survives turnover.",
    paragraphs: [
      "Every landscaping shop loses tribal knowledge to turnover. The gate code on the Henderson property. The dog that bites only when the gate is left open. The sprinkler zone that&rsquo;s been miswired since the pool install. The client who only takes calls before 7 a.m. The slope on the back lawn that flips a 36-inch zero-turn. The deck chairs that have to come off the lawn before mowing or the office gets a phone call. Today this lives in the head of one ten-year foreman, and the day he leaves, the next crew rediscovers it the hard way.",
      "Site Memory captures all of it on the first visit and every visit after. Every photo, every note, every gate code, every irrigation map, every soil sample, every chemical applied, every plant installed, every crew handoff comment — indexed against the property and searchable by any new hire from their phone. Onboarding for a new foreman drops from six months to six weeks because the property knows them before they know it.",
      "Memory also publishes a Site Health score per property — open issues, pending upsells, complaint history, payment cadence — so when a sales call comes in for renewal, the rep sees the truth, not a guess. The client feels like you&rsquo;ve been mowing their lawn for ten years even when the truck is on its first visit.",
    ],
    features: [
      "Per-property knowledge graph: gate codes, pets, irrigation maps, slope notes, client preferences",
      "Crew handoff capture on every visit — text, photo, voice memo",
      "Searchable from the foreman&rsquo;s phone in under three seconds",
      "Site Health score surfaces open issues, upsells, and risks before the renewal call",
    ],
  },
  {
    slug: "weather-pivot",
    tagline: "The forecast is a route plan.",
    paragraphs: [
      "Weather is the variable that breaks every landscaping schedule, and every shop manages it the same broken way: the dispatcher watches the radar, the crews wait for a phone call, the clients call angry when their Tuesday mow becomes a Friday-afternoon scramble. In snow markets, the same chaos plays at three a.m. Weather Pivot ends it.",
      "Pivot watches a rolling seven-day forecast against every scheduled visit — mow, fert round, hardscape pour, irrigation start-up, leaf cleanup, snow plow, salt run. When a storm shifts, it reshuffles the route by service type and crew skill, holds chemical-sensitive applications until the wind drops, prioritizes pour-and-cure hardscape into the dry window, and texts every affected client the new arrival window before they wonder. The dispatcher reviews and approves in three minutes instead of rebuilding the day in two hours.",
      "Pivot also closes the loop on snow: pre-storm crew calls, mid-event push reports, post-event property photos, and an invoice generated against the actual storm depth pulled from NOAA. The client sees a documented service. The owner sees zero phone time. Storm Saturdays stop being Storm Saturdays.",
    ],
    features: [
      "Rolling seven-day forecast model against every scheduled visit",
      "Auto-reshuffle by service type, crew skill, and chemical-safe windows",
      "Client-facing arrival-window texts and post-service photo proofs",
      "Snow ops mode with NOAA-verified depths and auto-generated per-storm invoices",
    ],
  },
  {
    slug: "surplus-yard",
    tagline: "What rots in the yard becomes revenue.",
    paragraphs: [
      "Every landscaping shop runs a graveyard out back: pallets of leftover sod from a job that came in short, three skids of mulch the homeowner didn&rsquo;t want, a stack of granite pavers from a returned hardscape, two used Stihl trimmers, a like-new aerator from a discontinued line, four trees the nursery wouldn&rsquo;t take back. The accountant calls it shrinkage. The yard guy calls it Tuesday. Across the metro, ten other shops are paying retail for the exact same materials this week.",
      "Surplus Yard is the marketplace that closes the loop. List a pallet, a tree, a tool, or a load — set the price, set the pickup window, attach a photo. Other GladiusTurf shops in your radius see it instantly, pay through the platform, and pick up. GladiusTurf takes a 3% rail fee. The yard clears. The cash lands in the operating account. The materials go to a job instead of a dumpster.",
      "Average shop recovers $20,000 to $60,000 a year in margin that was previously a write-off — without lifting a finger beyond the listing photo. It&rsquo;s also the engine that builds the network: every shop on Surplus Yard becomes a node in the Gladius operating crew, which is how this category eats the legacy CRMs alive.",
    ],
    features: [
      "Multi-shop marketplace for sod, mulch, stone, plants, trees, and equipment",
      "Stripe Connect rail with 3% platform fee, automatic 1099 tracking",
      "Geo-radius listings so material moves locally and pickup is same-day",
      "Inventory write-offs reclassified to revenue line — your CFO will smile",
    ],
  },
];

const INTEGRATIONS: { name: string; line: string }[] = [
  {
    name: "QuickBooks",
    line: "Two-way sync for customers, invoices, payments, and class tracking. Your bookkeeper doesn&rsquo;t change a workflow.",
  },
  {
    name: "Stripe",
    line: "Card-on-file, ACH, and Stripe Connect rails for Surplus Yard payouts. PCI scope stays out of your shop.",
  },
  {
    name: "Twilio",
    line: "Compliant client texting with A2P 10DLC registration handled, plus ringless voicemail for the dead-quote queue.",
  },
  {
    name: "ServiceTitan",
    line: "Native bridge for shops running Titan on tree, irrigation, or commercial divisions — bidirectional jobs and invoices.",
  },
  {
    name: "Aspire",
    line: "One-click migration of properties, contracts, and crew schedules. Most shops are fully imported in under four hours.",
  },
];

const ARCHITECTURE_STEPS: { step: string; title: string; copy: string }[] = [
  {
    step: "Quote",
    title: "One inbox, one model, one SLA",
    copy: "Every channel — web, voicemail, LSA, partner referral — funnels into a single queue. Quote Intercept reprices against the margin model and ships a live proposal.",
  },
  {
    step: "Schedule",
    title: "Property, route, and weather aware",
    copy: "Approved work flows into a route that already knows the crew skill, the chemical-safe windows, the equipment availability, and the client&rsquo;s arrival preference.",
  },
  {
    step: "Crew",
    title: "Foreman opens one screen",
    copy: "The crew lands on a property card with the Site Memory pack, the Whisperer&rsquo;s prioritized add-ons, the Shield&rsquo;s compliance check, and yesterday&rsquo;s photos.",
  },
  {
    step: "Invoice",
    title: "Auto-generated, auto-reconciled",
    copy: "Tickets close to invoices, invoices match the QuickBooks class plan, payments hit Stripe and the bank. Nothing is hand-keyed twice.",
  },
  {
    step: "Review",
    title: "Reputation as a revenue line",
    copy: "Five-star clients are routed to Google. Three-star clients are routed to the owner. Reviews tie back to the crew, the foreman, the property, and the original quote.",
  },
  {
    step: "Upsell",
    title: "The flywheel restarts",
    copy: "The completed job feeds Whisperer&rsquo;s next-touch queue and Radar&rsquo;s neighbor campaign. The property never goes quiet between renewals.",
  },
];

function dangerouslyHTML(input: string) {
  // Allow simple curly-quote entities in copy strings.
  return { __html: input };
}

export default function ProductPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="relative overflow-hidden border-b border-[rgba(15,61,46,0.12)] bg-paper">
          <TopographicBg />
          <div className="relative mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              The product · seven engines · one data spine
            </p>
            <h1 className="max-w-5xl font-serif text-display-md text-forest md:text-display-lg">
              The Seven-Engine Operating System for Landscaping Revenue.
            </h1>
            <p className="mt-8 max-w-3xl text-[20px] leading-[1.55] text-stone">
              GladiusTurf replaces the scattered stack — Jobber for jobs, LMN
              for estimates, Service Autopilot for routes, a CRM for clients, a
              compliance binder for the state, a whiteboard for everything else
              — with one revenue intelligence layer. Seven engines, one data
              spine, one number going into your bank account every month.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="/demo"
                className="inline-flex items-center rounded-[8px] bg-forest px-6 py-3 text-sm font-medium text-bone transition-colors hover:bg-forest/90"
              >
                Book the live demo
              </a>
              <a
                href="#engines"
                className="text-sm font-medium text-forest underline underline-offset-4 hover:text-moss"
              >
                Walk every engine →
              </a>
            </div>
          </div>
        </section>

        <section className="bg-obsidian text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div>
                <p className="font-mono text-[14px] uppercase tracking-tagline text-lime">
                  The premise
                </p>
                <h2 className="mt-6 font-serif text-h2-md md:text-h2-lg">
                  A feature is a button. An engine is an outcome.
                </h2>
              </div>
              <div className="md:col-span-2">
                <p className="text-[18px] leading-[1.6] text-bone/80">
                  Legacy field-service software is a database with a paint job.
                  You log work, you bill it, you run a report. Nothing in the
                  product gets paid for performance. GladiusTurf inverts that.
                  Every engine ships against a specific dollar number — saved
                  deals, recovered referrals, prevented fines, recaptured
                  margin — and we write that number on the contract. If an
                  engine isn&rsquo;t moving its number inside ninety days, we
                  retire it. That&rsquo;s the deal.
                </p>
                <p className="mt-6 text-[16px] leading-[1.7] text-bone/60">
                  The seven engines below share one data spine: every quote,
                  every schedule, every crew note, every invoice, every review
                  feeds the next loop. There is no double-entry. There is no
                  &ldquo;export to CSV.&rdquo; There is one revenue brain.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="engines" aria-label="Seven engines, in detail">
          {ENGINES.map((engine, i) => {
            const copy = ENGINE_COPY.find((c) => c.slug === engine.slug);
            if (!copy) return null;
            const reverse = i % 2 === 1;
            const tone = i % 2 === 0 ? "bg-paper" : "bg-bone";
            return (
              <article
                key={engine.slug}
                id={engine.slug}
                className={`scroll-mt-20 border-b border-[rgba(15,61,46,0.12)] ${tone}`}
              >
                <div
                  className={`mx-auto grid max-w-content grid-cols-1 gap-12 px-6 py-20 md:py-section lg:grid-cols-12 lg:gap-16 ${
                    reverse ? "" : ""
                  }`}
                >
                  <header
                    className={`lg:col-span-4 ${
                      reverse ? "lg:order-2 lg:col-start-9" : "lg:order-1"
                    }`}
                  >
                    <span className="font-mono text-[14px] uppercase tracking-tagline text-stone">
                      Engine {engine.number}
                    </span>
                    <h2 className="mt-4 font-serif text-h2-md text-forest md:text-h2-lg">
                      {engine.name}
                    </h2>
                    <p className="mt-4 font-mono text-[18px] text-moss">
                      {engine.outcome}
                    </p>
                    <p className="mt-6 font-serif text-[20px] italic leading-[1.4] text-forest/80">
                      {copy.tagline}
                    </p>
                  </header>

                  <div
                    className={`lg:col-span-8 ${
                      reverse ? "lg:order-1 lg:col-start-1" : "lg:order-2"
                    }`}
                  >
                    <p className="text-[18px] leading-[1.6] text-forest">
                      {engine.description}
                    </p>
                    {copy.paragraphs.map((p, idx) => (
                      <p
                        key={idx}
                        className="mt-6 text-[16px] leading-[1.75] text-stone"
                        dangerouslySetInnerHTML={dangerouslyHTML(p)}
                      />
                    ))}
                    <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {copy.features.map((f) => (
                        <li
                          key={f}
                          className="flex gap-3 rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-paper p-5"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-moss"
                          />
                          <span
                            className="text-[15px] leading-[1.55] text-forest"
                            dangerouslySetInnerHTML={dangerouslyHTML(f)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section
          id="architecture"
          className="border-b border-[rgba(15,61,46,0.12)] bg-forest text-bone"
        >
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 font-mono text-[14px] uppercase tracking-tagline text-lime">
              Architecture · one data spine
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Quote. Schedule. Crew. Invoice. Review. Upsell. The loop never
              breaks.
            </h2>
            <p className="mt-8 max-w-3xl text-[17px] leading-[1.65] text-bone/80">
              Each engine is real, but no engine is alone. The spine that ties
              them together is the reason a four-truck shop using GladiusTurf
              acts like a forty-truck operation. The same property record
              feeds every screen. The same client identity follows every
              touch. There is one source of truth, and every engine writes
              back to it.
            </p>
            <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ARCHITECTURE_STEPS.map((s, idx) => (
                <li
                  key={s.step}
                  className="rounded-[12px] border border-bone/10 bg-obsidian/40 p-6"
                >
                  <span className="font-mono text-[12px] uppercase tracking-tagline text-lime">
                    Step {String(idx + 1).padStart(2, "0")} · {s.step}
                  </span>
                  <h3 className="mt-4 font-serif text-[22px] leading-[1.25] text-bone">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-bone/70">
                    {s.copy}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-12 max-w-3xl text-[16px] leading-[1.7] text-bone/60">
              The output: a shop that closes faster, schedules cleaner,
              executes tighter, invoices on the same day, gets paid quicker,
              and re-sells the same client three more times before the
              competitor has finished the first proposal. That&rsquo;s
              landscaping revenue intelligence.
            </p>
          </div>
        </section>

        <section
          id="integrations"
          className="border-b border-[rgba(15,61,46,0.12)] bg-paper"
        >
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Integrations · keep what works
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              GladiusTurf doesn&rsquo;t fight your bookkeeper, your bank, or
              your existing field tool.
            </h2>
            <p className="mt-8 max-w-3xl text-[17px] leading-[1.6] text-stone">
              The fastest way to lose a switching customer is to demand a
              full-stack rip-and-replace on day one. We don&rsquo;t. Plug
              GladiusTurf into the systems your shop already pays for and
              we&rsquo;ll retire what&rsquo;s redundant on your timeline, not
              ours.
            </p>
            <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {INTEGRATIONS.map((i) => (
                <li
                  key={i.name}
                  className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-bone p-6"
                >
                  <h3 className="font-serif text-[22px] leading-none text-forest">
                    {i.name}
                  </h3>
                  <p
                    className="mt-4 text-[15px] leading-[1.6] text-stone"
                    dangerouslySetInnerHTML={dangerouslyHTML(i.line)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
