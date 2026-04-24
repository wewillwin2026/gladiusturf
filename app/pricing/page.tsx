import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { BDC_ADDON, TIERS } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing — Flat per crew. No per-seat tax. No usage gotchas.",
  description:
    "GladiusTurf pricing: $397 Independent, $997 Professional, $2,997 Enterprise per crew per month. All nine engines included. Unlimited seats. Optional $499 BDC addon. Month-to-month, no contract.",
};

// Per-tier extra feature rows for the new Client Portal + Cadence engines.
// Held in page.tsx so we don't touch content/pricing.ts on this pass.
const TIER_EXTRAS: Record<"independent" | "professional" | "enterprise", string[]> = {
  independent: [
    "Client Portal — branded for your crew, included",
    "Cadence — automated follow-up + reminders, included",
  ],
  professional: [
    "Client Portal — branded for your crew, included",
    "Cadence — automated follow-up + reminders, included",
  ],
  enterprise: [
    "Client Portal — multi-location white-label",
    "Cadence — custom seasonal cadences",
  ],
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
  {
    q: "How does the Client Portal work?",
    a: "It's white-labeled with your crew's logo and colors. Customers get a single magic-link login (no passwords). They reschedule visits, pay invoices via Stripe (card or ACH), approve change orders, and view job history. SMS + email confirmations close the loop. Included on every tier.",
  },
  {
    q: "What's the difference between Cadence and a CRM cadence engine?",
    a: "Most CRMs ship a basic 'send email at Day 7' rule. Cadence reads from Site Memory — the dog's name, the gate code, the back zone — and personalizes every touch. It's also tuned for landscaping rhythms (NOAA-timed seasonal reminders, applicator-aware messaging) instead of generic SaaS cadences.",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8 L7 12 L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5l1.4 3.6L13 6.5l-3.6 1.4L8 11.5 6.6 7.9 3 6.5l3.6-1.4L8 1.5zM12.5 11l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="bg-forest-deep text-bone">
        {/* Hero + scarcity band + tier grid */}
        <section className="py-28">
          <div className="mx-auto max-w-7xl px-6">
            {/* Scarcity band */}
            <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-honey/25 bg-honey/[0.03] px-6 py-4 text-center sm:flex-row sm:gap-6 sm:text-left">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2 flex-none">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-honey-bright opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-honey-bright" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-bone">
                    Q2 2026 onboarding · 8 of 20 founding crew slots remaining
                  </div>
                  <div className="text-xs text-bone/40">
                    Founder-led white-glove setup.
                  </div>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-bone/10 sm:block" />
              <div className="text-xs text-bone/60">
                <span className="font-semibold text-bone">
                  No 3-year contract.
                </span>{" "}
                Cancel anytime after month 3.
              </div>
            </div>

            {/* Hero copy */}
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                <SparklesIcon className="h-3 w-3" />
                Pricing
              </p>
              <h1 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                Flat per crew. No per-seat tax. No usage gotchas.
              </h1>
              <p className="mt-6 text-lg text-bone/60">
                Every plan ships with all nine engines — including the new
                Client Portal and Cadence. No add-on tax. No usage caps. The
                number you see is the number you pay.
              </p>
            </div>

            {/* Three-tier pricing grid */}
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
              {TIERS.map((tier) => {
                const featured = Boolean(tier.featured);
                return (
                  <div
                    key={tier.id}
                    className={
                      featured
                        ? "relative flex h-full flex-col rounded-2xl border border-moss/50 bg-gradient-to-b from-moss/10 to-transparent p-8 shadow-pop"
                        : "relative flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-8"
                    }
                  >
                    {featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-bright px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                        Most popular
                      </div>
                    ) : null}
                    <h3 className="font-serif text-2xl text-bone">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm text-bone/40">{tier.tagline}</p>
                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="font-serif text-5xl text-bone">
                        ${tier.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-bone/40">/mo</span>
                    </div>
                    <p className="mt-1 text-xs text-bone/30">
                      per crew, billed monthly
                    </p>
                    <a
                      href={tier.id === "enterprise" ? "/demo?tier=enterprise" : "/demo"}
                      className={
                        featured
                          ? "mt-8 inline-flex items-center justify-center gap-1.5 rounded-lg bg-lime-bright px-4 py-3 text-sm font-semibold text-forest shadow-cta transition-colors hover:bg-moss"
                          : "mt-8 inline-flex items-center justify-center gap-1.5 rounded-lg border border-bone/10 px-4 py-3 text-sm font-semibold text-bone transition-colors hover:bg-bone/5"
                      }
                    >
                      {tier.cta}
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </a>
                    <ul className="mt-8 space-y-3 text-sm text-bone/70">
                      {[...tier.features, ...TIER_EXTRAS[tier.id]].map((f, i) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckIcon
                            className={
                              i % 2 === 0
                                ? "mt-0.5 h-4 w-4 flex-none text-moss-bright"
                                : "mt-0.5 h-4 w-4 flex-none text-honey-bright"
                            }
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Tier rationale row */}
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-honey-bright">
                  Independent — $397
                </p>
                <p className="mt-3 text-sm leading-[1.65] text-bone/60">
                  Built for the solo operator running one truck and one crew.
                  All nine engines on day one — Quote Intercept, Site Memory,
                  Weather Pivot, Referral Radar, Upsell Whisperer, Surplus
                  Yard, Applicator Shield, Client Portal, and Cadence. Email
                  and in-app chat support with a 4-hour weekday response. The
                  same product the $15M-revenue shops use, sized for a
                  one-crew leak rate.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss-bright">
                  Professional — $997
                </p>
                <p className="mt-3 text-sm leading-[1.65] text-bone/60">
                  The tier where the math gets brutal. 2 to 5 crews, priority
                  support with 1-hour weekday response, and a dedicated
                  Customer Success Manager assigned at month 3 once your
                  engines are tuned to your route density and pricing
                  patterns. This is where most operators land and stay. One
                  recovered Quote Intercept payback covers a full year.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-honey-bright">
                  Enterprise — $2,997
                </p>
                <p className="mt-3 text-sm leading-[1.65] text-bone/60">
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
        <section className="border-t border-bone/5 bg-forest-mid py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-honey/30 bg-honey/5 px-3 py-1 text-xs font-medium text-honey-bright">
                  Optional addon
                </p>
                <h2 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                  GladiusBDC for Turf
                </h2>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-serif text-6xl text-bone">
                    ${BDC_ADDON.price}
                  </span>
                  <span className="text-sm text-bone/40">
                    {BDC_ADDON.period}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-bone/40">
                  Per company, not per crew
                </p>
                <a
                  href="/demo?addon=bdc"
                  className="mt-10 inline-flex items-center justify-center gap-1.5 rounded-lg bg-lime-bright px-6 py-3 text-sm font-semibold text-forest shadow-cta transition-colors hover:bg-moss"
                >
                  Add BDC to a pilot
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="md:col-span-7">
                <div className="rounded-2xl border border-honey/30 bg-bone/[0.02] p-8">
                  <p className="text-base leading-[1.65] text-bone/70">
                    A Business Development Center is the inside-sales muscle
                    big operators have always had and small ones never could
                    afford. We rent you ours. The BDC addon plugs into any
                    tier and gives you outbound coverage your competitors
                    aren&apos;t running.
                  </p>
                  <p className="mt-4 text-sm leading-[1.65] text-honey-bright">
                    Cadence (included on every tier) handles the automated
                    follow-up cadences — SMS, email, NOAA-timed seasonal
                    nudges. The BDC addon stacks on top with{" "}
                    <span className="font-semibold">manned weekend phone
                    coverage</span>{" "}
                    and live human dialing. The two are complementary, not
                    redundant: software handles the 80% that automates,
                    humans handle the 20% that closes.
                  </p>
                  <ul className="mt-8 flex flex-col gap-5 text-sm leading-[1.65] text-bone/60">
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-honey-bright" />
                      <span>
                        <span className="font-semibold text-bone">
                          Outbound winter service campaigns.
                        </span>{" "}
                        Snow contracts, holiday lighting, hardscape design
                        consults, dormant tree pruning. We dial your existing
                        customer base in November and book January revenue
                        while your crews are still wrapping fall cleanups.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-honey-bright" />
                      <span>
                        <span className="font-semibold text-bone">
                          Dormant-customer reactivation.
                        </span>{" "}
                        Every shop has 200 to 800 customers who didn&apos;t
                        renew last spring. We work that list with a structured
                        4-touch cadence and book consultations directly into
                        your foreman&apos;s calendar. The reactivation rate
                        averages 18 to 24 percent.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-honey-bright" />
                      <span>
                        <span className="font-semibold text-bone">
                          Manned weekend phone coverage.
                        </span>{" "}
                        Saturday morning is when 31% of new landscaping leads
                        call. Most shops send those calls to a voicemail box
                        nobody checks until Monday. We answer them live,
                        qualify them, and put them on your Monday morning
                        estimate schedule.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckIcon className="mt-1 h-4 w-4 flex-none text-honey-bright" />
                      <span>
                        <span className="font-semibold text-bone">
                          Spring-rush overflow.
                        </span>{" "}
                        March through May, your office gets 4x the call
                        volume. We absorb the spillover so your admin
                        isn&apos;t fielding new-quote calls while a $40,000
                        customer is on hold trying to add an irrigation
                        repair.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI walkthrough */}
        <section className="py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                The math
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                One recovered Quote Intercept payback covers a Professional
                tier for fourteen months.
              </h2>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bone/40">
                  Quote Intercept
                </p>
                <p className="mt-4 font-mono text-5xl text-moss-bright">
                  $14,200
                </p>
                <p className="text-sm text-bone/40">recovered per month</p>
                <p className="mt-6 text-sm leading-[1.65] text-bone/60">
                  Estimates that go cold the moment a customer doesn&apos;t
                  hear back inside 24 hours. SMS routing pulls them back.
                  Average shop sees this in week two.
                </p>
              </div>
              <div className="rounded-2xl border border-honey/40 bg-gradient-to-b from-honey/10 to-transparent p-8 shadow-pop-honey">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-honey-bright">
                  Upsell Whisperer
                </p>
                <p className="mt-4 font-mono text-5xl text-honey-bright">
                  +$38,000
                </p>
                <p className="text-sm text-bone/60">added monthly revenue</p>
                <p className="mt-6 text-sm leading-[1.65] text-bone/70">
                  AI scoring on every visit. The customer who needs aeration,
                  the one ready for a fall fertilization upsell, the one
                  whose irrigation timer is on its last season — flagged for
                  the foreman before they roll.
                </p>
              </div>
              <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bone/40">
                  Referral Radar
                </p>
                <p className="mt-4 font-mono text-5xl text-moss-bright">
                  $180,000
                </p>
                <p className="text-sm text-bone/40">net new annual revenue</p>
                <p className="mt-6 text-sm leading-[1.65] text-bone/60">
                  Neighbor outreach the day your crew is on someone&apos;s
                  lawn. Geo-fenced postcards, SMS intros, satellite-property
                  matching. Highest-LTV channel in landscaping.
                </p>
              </div>
              <div className="rounded-2xl border border-honey/40 bg-gradient-to-b from-honey/10 to-transparent p-8 shadow-pop-honey">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-honey-bright">
                  Cadence · NEW
                </p>
                <p className="mt-4 font-mono text-5xl text-honey-bright">
                  $12,800
                </p>
                <p className="text-sm text-bone/60">
                  recovered per month from late invoices
                </p>
                <p className="mt-6 text-sm leading-[1.65] text-bone/70">
                  Personalized SMS + email reminders that pull on Site Memory
                  context — the gate code, the dog&apos;s name, the back zone.
                  Drives <span className="text-honey-bright">+24% retention</span>.
                  A single Cadence rescue covers the Professional tier{" "}
                  <span className="font-mono">12.8x</span> over.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-16 max-w-3xl">
              <p className="text-base leading-[1.7] text-bone/80">
                Run the numbers for the Professional tier. Two crews at $997
                each is{" "}
                <span className="font-mono text-moss-bright">$1,994</span> per
                month — call it{" "}
                <span className="font-mono text-honey-bright">$23,928</span> a
                year. The Quote Intercept engine alone, at the average{" "}
                <span className="font-mono text-moss-bright">$14,200</span> in
                recovered estimates per month, returns{" "}
                <span className="font-mono text-honey-bright">$170,400</span>{" "}
                annually. That&apos;s a{" "}
                <span className="font-mono text-moss-bright">7.1x</span>{" "}
                payback on the engine that installs itself in week one. Add
                Upsell Whisperer&apos;s $38,000-a-month, Referral Radar&apos;s
                $180,000-a-year, and Cadence&apos;s $12,800-a-month in
                recovered late invoices, and the conversation stops being
                about subscription cost. It becomes a question of how fast
                you can train the foremen to use it.
              </p>
              <p className="mt-6 text-base leading-[1.7] text-bone/80">
                A single recovered $14,200 month covers your Professional
                tier{" "}
                <span className="font-mono text-honey-bright">14x</span> over.
                We&apos;re not pricing this as software. We&apos;re pricing
                it as a percentage of the leak we plug. Anyone charging less
                is selling you a CRM that doesn&apos;t do the work. Anyone
                charging more is selling you ten years of accumulated
                middleware and a sales rep&apos;s commission.
              </p>
              <p className="mt-6 text-sm leading-[1.65] text-bone/40">
                Numbers above are 90-day cohort averages from operators
                running 2–6 crews after engine tuning. Your mileage will
                vary with route density, average ticket size, and how
                disciplined your foremen are about closing tickets in the
                field. We will show you a 30/60/90 model on the demo with
                your route count plugged in.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-bone/5 bg-forest-mid py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
                Pricing FAQ
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                The questions every owner asks before they sign.
              </h2>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 open:border-honey/30 open:bg-honey/[0.03]"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-bone font-medium">
                    <span>{f.q}</span>
                    <span className="mt-1 flex-none text-honey-bright transition-transform group-open:rotate-45">
                      <svg
                        viewBox="0 0 16 16"
                        className="h-4 w-4"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 3v10M3 8h10"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-[1.65] text-bone/60">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA — talk to founders */}
        <section className="relative overflow-hidden border-t border-bone/5 bg-forest-deep py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/5 px-3 py-1 text-xs font-medium text-moss-bright">
              Talk to founders
            </p>
            <h2 className="font-serif text-5xl tracking-[-0.02em] text-bone md:text-7xl">
              Twenty minutes. Zero pressure.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-bone/60 md:text-xl">
              Screen-shared. We&apos;ll plug your route count and average
              ticket into the model and walk you through a 30/60/90 payback.
              No sales rep, no SDR — the founders run every demo until it
              stops scaling, and we&apos;re nowhere close.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-lime-bright px-8 py-4 text-lg font-semibold text-forest shadow-cta transition-colors hover:bg-moss"
              >
                Book the founder demo
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="mailto:founders@gladiusturf.com"
                className="text-base text-bone/60 transition-colors hover:text-bone"
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
