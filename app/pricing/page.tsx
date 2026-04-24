import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { PricingTier } from "@/components/pricing-tier";
import { BDC_ADDON, TIERS } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing — Flat per crew. No per-seat tax. No usage gotchas.",
  description:
    "GladiusTurf pricing: $397 Independent, $997 Professional, $2,997 Enterprise per crew per month. Unlimited seats. Optional $499 BDC addon. Month-to-month, no contract.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "What counts as a crew?",
    a: "One mobile unit that leaves the yard in the morning. A truck, a trailer, a route, a foreman. If you split a crew in half mid-season for a second truck, that becomes two crews on your next billing cycle. We don't pro-rate within a month — if you add a crew on the 18th, you pay the next 1st. We don't charge per laborer, per route, per stop, or per estimate. Just the number of physical crews running.",
  },
  {
    q: "Can I switch tiers later?",
    a: "Yes, any direction, any time. Move from Independent to Professional the day you sign your second crew. Drop from Professional to Independent during the winter slow months and we re-bill on the next cycle. No upgrade fees, no demotion penalty, no 'sales rep approval' delay. The tier you're on is the tier you need this month, not a forever decision.",
  },
  {
    q: "Is there an annual discount?",
    a: "Yes. Pay annually and you get two months free, which works out to roughly 17% off. The Independent tier becomes $3,970 a year instead of $4,764. Professional becomes $9,970 instead of $11,964. Enterprise gets a custom annual contract negotiated with the founder. We don't push annual prepay — it should only happen because the math is good for you, not because we needed cash.",
  },
  {
    q: "How long does onboarding take?",
    a: "If you're switching from Jobber, LMN, or Service Autopilot, our team migrates your customers, properties, recurring schedules, and invoice history inside 48 hours. We do this on a Friday-to-Monday cadence so your crews open the new app on Monday morning without missing a single mow. Enterprise migrations with custom integrations or multiple branches take 2–3 weeks and include a named project manager.",
  },
  {
    q: "Will my data import cleanly?",
    a: "We've imported customer lists from QuickBooks, Jobber, LMN, Service Autopilot, Aspire, and dozens of dealer-built spreadsheets. Standard fields — customer name, service address, phone, email, recurring service, last invoice date — come over without a hitch. We hand-clean fuzzy matches and duplicate customers as part of migration. If your data is on paper or in a foreman's head, that's a pilot conversation, not a deal-breaker.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Month-to-month by default. Cancel any day, for any reason, by emailing founders@gladiusturf.com. We bill through the end of the current cycle and we don't bill again. We give you a full export of your customers, properties, route history, and invoice ledger as CSV inside 24 hours of cancellation. No data ransom. No exit interview gauntlet. The leverage stays with you.",
  },
  {
    q: "I have multiple locations. How does that work?",
    a: "Each crew is counted regardless of which yard it leaves from. A 3-location operator running 8 crews total pays for 8 crews. Multi-location routing, branch-level reporting, and inter-yard equipment transfers are Enterprise features. If you have 2 locations and a single ops manager who runs both, Professional usually fits — talk to us before assuming you need Enterprise.",
  },
  {
    q: "Is there a free trial?",
    a: "14-day pilot at Professional pricing, no card required to start. We give you a sandbox loaded with sample customers and recurring routes so you can stress-test Quote Intercept and Upsell Whisperer against your own dollar figures. If you don't see a clear payback path by day 14, we close the account and refund any setup time we billed. We're confident enough in the engines to put our own time at risk.",
  },
  {
    q: "Do you offer white-label?",
    a: "Not at standard tiers. Our brand is part of the offer — the Surplus Yard marketplace, the Find a Crew listings, and the trust signals we're building only work because they're public and shared across operators. Multi-rooftop holding companies running 50+ crews can negotiate a private-label arrangement at the Enterprise tier with custom commercials. Email founders@gladiusturf.com.",
  },
  {
    q: "Do I have to sign a contract?",
    a: "No annual lock-in unless you choose the annual prepay discount. Standard billing is month-to-month with a credit card or ACH. Enterprise customers can request a Master Services Agreement with custom payment terms (Net 30, PO-based) and we'll negotiate those line by line. We've never hidden behind a 12-month auto-renew with a 60-day cancellation window. That trick is for vendors who don't trust their product.",
  },
  {
    q: "What does support actually look like?",
    a: "Independent: email and in-app chat, 4-hour response on weekdays. Professional: priority email and chat, 1-hour response weekdays, plus a dedicated Customer Success Manager assigned at month 3 once your engines are tuned. Enterprise: named account team with a revenue strategist, direct phone line to your CSM, founder access for escalations, and a published SLA with service credits if we miss it.",
  },
  {
    q: "What happens if my crew count drops in the off-season?",
    a: "Adjust your subscription. Drop from 5 crews to 2 in November, scale back up in March. We don't punish seasonality — that would be insane in landscaping. You can right-size your bill on the dashboard or by emailing support. The Surplus Yard, Site Memory, and Referral Radar engines keep working all winter on every active crew, which is exactly why dormant-customer reactivation pays for itself in Q1.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        {/* Hero */}
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Pricing
            </p>
            <h1 className="max-w-4xl font-serif text-display-md text-forest md:text-display-lg">
              Flat per crew. No per-seat tax. No usage gotchas.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.6] text-stone">
              Three tiers. One price per crew per month. Everyone on the crew
              gets a seat — the foreman, the laborer, the irrigation tech, the
              office admin checking schedules from her phone. No surprise
              charges for SMS volume, photo storage, or the AI assistant
              answering your phone at 7pm. The number you see is the number
              you pay.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] text-stone">
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
                Month-to-month, cancel any time
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
                Unlimited seats per crew
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
                14-day pilot at Professional pricing
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
                Free 48-hour migration from Jobber / LMN / Aspire
              </span>
            </div>
          </div>
        </section>

        {/* Three-tier comparison */}
        <section
          id="tiers"
          className="border-b border-[rgba(15,61,46,0.12)] bg-paper"
        >
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              The three tiers
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              Pick the one that matches the crews you actually run today. Move
              up, down, or sideways whenever your operation changes.
            </h2>

            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
              {TIERS.map((t) => (
                <PricingTier key={t.id} tier={t} />
              ))}
            </div>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <p className="text-[12px] uppercase tracking-tagline text-moss">
                  Independent — $397
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  Built for the solo operator running one truck and one crew.
                  All seven engines on day one — Quote Intercept, Site Memory,
                  Weather Pivot, Referral Radar, Upsell Whisperer, Surplus
                  Yard, Applicator Shield. Email and in-app chat support with
                  a 4-hour weekday response. The same product the
                  $15M-revenue shops use, sized for a one-crew leak rate.
                </p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-tagline text-moss">
                  Professional — $997
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  The tier where the math gets brutal. 2 to 5 crews, priority
                  support with 1-hour weekday response, and a dedicated
                  Customer Success Manager assigned at month 3 once your
                  engines are tuned to your route density and pricing
                  patterns. This is where most operators land and stay. One
                  recovered Quote Intercept payback covers a full year.
                </p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-tagline text-moss">
                  Enterprise — $2,997
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-stone">
                  6 or more crews, multi-location, white-glove onboarding
                  with a named project manager, custom integrations to your
                  existing accounting, telematics, or HR systems, and a
                  named account team that includes a revenue strategist
                  reviewing your numbers monthly. Direct line to the founder
                  for escalations. Service-level agreement with credits when
                  we miss it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BDC Addon */}
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
                  Optional addon
                </p>
                <h2 className="font-serif text-h2-md text-forest md:text-h2-lg">
                  GladiusBDC for Turf
                </h2>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-mono text-[56px] leading-none text-forest">
                    ${BDC_ADDON.price}
                  </span>
                  <span className="text-[14px] text-stone">
                    {BDC_ADDON.period}
                  </span>
                </div>
                <p className="mt-2 text-[13px] uppercase tracking-tagline text-stone">
                  Per company, not per crew
                </p>
                <a
                  href="/demo?addon=bdc"
                  className="mt-10 inline-flex items-center justify-center rounded-[8px] bg-forest px-6 py-3 text-sm font-medium text-bone transition-colors hover:bg-forest/90"
                >
                  Add BDC to a pilot
                </a>
              </div>
              <div className="md:col-span-7">
                <p className="text-[17px] leading-[1.65] text-forest">
                  A Business Development Center is the inside-sales muscle big
                  operators have always had and small ones never could afford.
                  We rent you ours. The BDC addon plugs into any tier and
                  gives you outbound coverage your competitors aren&apos;t
                  running.
                </p>
                <ul className="mt-8 flex flex-col gap-5 text-[15px] leading-[1.6] text-stone">
                  <li>
                    <span className="font-medium text-forest">
                      Outbound winter service campaigns.
                    </span>{" "}
                    Snow contracts, holiday lighting, hardscape design
                    consults, dormant tree pruning. We dial your existing
                    customer base in November and book January revenue while
                    your crews are still wrapping fall cleanups.
                  </li>
                  <li>
                    <span className="font-medium text-forest">
                      Dormant-customer reactivation.
                    </span>{" "}
                    Every shop has 200 to 800 customers who didn&apos;t renew
                    last spring. We work that list with a structured 4-touch
                    cadence and book consultations directly into your
                    foreman&apos;s calendar. The reactivation rate averages
                    18 to 24 percent.
                  </li>
                  <li>
                    <span className="font-medium text-forest">
                      Manned weekend phone coverage.
                    </span>{" "}
                    Saturday morning is when 31% of new landscaping leads
                    call. Most shops send those calls to a voicemail box
                    nobody checks until Monday. We answer them live, qualify
                    them, and put them on your Monday morning estimate
                    schedule.
                  </li>
                  <li>
                    <span className="font-medium text-forest">
                      Spring-rush overflow.
                    </span>{" "}
                    March through May, your office gets 4x the call volume.
                    We absorb the spillover so your admin isn&apos;t fielding
                    new-quote calls while a $40,000 customer is on hold trying
                    to add an irrigation repair.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ROI calculator narrative */}
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              The math
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              One recovered Quote Intercept payback covers a Professional tier
              for fourteen months.
            </h2>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-paper p-8 shadow-card">
                <p className="text-[12px] uppercase tracking-tagline text-stone">
                  Quote Intercept
                </p>
                <p className="mt-4 font-mono text-stat-sm text-forest">
                  $14,200
                </p>
                <p className="text-[13px] text-stone">recovered per month</p>
                <p className="mt-6 text-[14px] leading-[1.6] text-stone">
                  Estimates that go cold the moment a customer doesn&apos;t
                  hear back inside 24 hours. SMS routing pulls them back.
                  Average shop sees this in week two.
                </p>
              </div>
              <div className="rounded-[12px] border border-moss bg-bone p-8 shadow-card">
                <p className="text-[12px] uppercase tracking-tagline text-forest">
                  Upsell Whisperer
                </p>
                <p className="mt-4 font-mono text-stat-sm text-forest">
                  +$38,000
                </p>
                <p className="text-[13px] text-stone">added monthly revenue</p>
                <p className="mt-6 text-[14px] leading-[1.6] text-forest">
                  AI scoring on every visit. The customer who needs aeration,
                  the one ready for a fall fertilization upsell, the one whose
                  irrigation timer is on its last season — flagged for the
                  foreman before they roll.
                </p>
              </div>
              <div className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-paper p-8 shadow-card">
                <p className="text-[12px] uppercase tracking-tagline text-stone">
                  Referral Radar
                </p>
                <p className="mt-4 font-mono text-stat-sm text-forest">
                  $180,000
                </p>
                <p className="text-[13px] text-stone">net new annual revenue</p>
                <p className="mt-6 text-[14px] leading-[1.6] text-stone">
                  Neighbor outreach the day your crew is on someone&apos;s
                  lawn. Geo-fenced postcards, SMS intros, satellite-property
                  matching. Highest-LTV channel in landscaping.
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-3xl">
              <p className="text-[17px] leading-[1.7] text-forest">
                Run the numbers for the Professional tier. Two crews at $997
                each is{" "}
                <span className="font-mono text-forest">$1,994</span> per
                month — call it{" "}
                <span className="font-mono text-forest">$23,928</span> a year.
                The Quote Intercept engine alone, at the average{" "}
                <span className="font-mono text-forest">$14,200</span> in
                recovered estimates per month, returns{" "}
                <span className="font-mono text-forest">$170,400</span>{" "}
                annually. That&apos;s a 7.1x payback on the engine that
                installs itself in week one. Add Upsell Whisperer&apos;s
                $38,000-a-month and Referral Radar&apos;s $180,000-a-year and
                the conversation stops being about subscription cost. It
                becomes a question of how fast you can train the foremen to
                use it.
              </p>
              <p className="mt-6 text-[17px] leading-[1.7] text-forest">
                A single recovered $14,200 month covers your Professional tier
                fourteen times over. We&apos;re not pricing this as software.
                We&apos;re pricing it as a percentage of the leak we plug.
                Anyone charging less is selling you a CRM that doesn&apos;t
                do the work. Anyone charging more is selling you ten years of
                accumulated middleware and a sales rep&apos;s commission.
              </p>
              <p className="mt-6 text-[15px] leading-[1.6] text-stone">
                Numbers above are 90-day cohort averages from operators
                running 2–6 crews after engine tuning. Your mileage will vary
                with route density, average ticket size, and how disciplined
                your foremen are about closing tickets in the field. We will
                show you a 30/60/90 model on the demo with your route count
                plugged in.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Pricing FAQ
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              The questions every owner asks before they sign.
            </h2>

            <dl className="mt-12 grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2">
              {FAQ.map((f) => (
                <div
                  key={f.q}
                  className="border-t border-[rgba(15,61,46,0.12)] py-7"
                >
                  <dt className="text-[17px] font-medium text-forest">
                    {f.q}
                  </dt>
                  <dd className="mt-3 text-[15px] leading-[1.65] text-stone">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Talk to founders CTA */}
        <section className="bg-forest text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-moss">
              Talk to founders
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Still have a question the page didn&apos;t answer? Get on a call
              with the people who built this.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-bone/80">
              Thirty minutes, screen-shared. We&apos;ll plug your route count
              and average ticket into the model and walk you through a
              30/60/90 payback. If we&apos;re not a fit, we&apos;ll tell you
              that on the call instead of after a contract. No sales rep, no
              SDR — the founders run every demo until it stops scaling, and
              we&apos;re nowhere close.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="/demo"
                className="inline-flex items-center rounded-[8px] bg-moss px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
              >
                Book the founder demo
              </a>
              <a
                href="mailto:founders@gladiusturf.com"
                className="text-sm font-medium text-bone underline underline-offset-4 hover:text-moss"
              >
                Or email founders@gladiusturf.com →
              </a>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
