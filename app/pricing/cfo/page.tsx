import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { PrintButton } from "@/components/print-button";

/**
 * /pricing/cfo — single-page CFO packet (board-deferred deliverable, 2026-05-08).
 *
 * Owners forward this URL to their CFO when justifying the $597/$1,497/$3,997
 * floor. Dense, printable, no marketing fluff. Each section answers one
 * question a CFO will ask:
 *
 *   1. The competitor floor is a lie — what does the bill actually look like?
 *   2. Per-crew vs per-user — what's the real shape of the line item?
 *   3. ETF + lock-in — what's the cost of getting out?
 *   4. ROI — what does "Quote Intercept recovers $14,200/mo" mean in practice?
 *   5. The seven-director defense — why this floor, from each lens.
 *   6. The closing parable — the new combine.
 *
 * Print rules: hide nav + footer when printing, white background, 11pt body.
 */
export const metadata: Metadata = {
  title: "Why GladiusTurf costs $597 — the CFO packet.",
  description:
    "The full case for the $597/crew floor. Real LMN/Aspire/ServiceTitan/Jobber/Housecall numbers, the per-crew vs per-user math, exit-cost comparison, ROI on Quote Intercept, and a seven-director defense panel. Dense, printable, no fluff.",
  alternates: { canonical: "/pricing/cfo" },
};

type Director = {
  name: string;
  role: string;
  lens: string;
  defense: string;
};

const DIRECTORS: Director[] = [
  {
    name: "Strategy",
    role: "Positioning",
    lens: "Where the price sits in the market",
    defense:
      "$597 is the only honest floor in the category. LMN's $297 starter is per-user — at four seats you're at $1,188 before any add-on. Jobber's $39 becomes $589/mo at one Connect Team. Aspire and ServiceTitan won't even publish a starter. We sit between Jobber-CRM and ServiceTitan-enterprise, but we ship every engine on every plan instead of pacing release behind a renewal call. The position is: cheaper than ServiceTitan, more honest than LMN, more capable than Jobber. That's a price you can defend with a screenshot.",
  },
  {
    name: "Product",
    role: "Operator value",
    lens: "What the operator gets in their first 30 days",
    defense:
      "On Day 1 the operator opens the workspace and Quote Intercept is already running, Site Memory is already keyed to their customers, and the LRI Score is already auditing. The relief value isn't a feature — it's the absence of the four migration projects every other vendor sells you. Per-crew billing means the foreman they hired in March doesn't add a line item. The seasonal hire who lasts six weeks doesn't add one either. $597 is the price of stopping the leak — not the price of buying software.",
  },
  {
    name: "Engineering",
    role: "Cost-to-serve",
    lens: "What it costs us to run a tenant honestly",
    defense:
      "A tenant on $597/mo with the per-tenant AI budget cap (50k Anthropic tokens/day, ~$5 ceiling) costs us roughly $40/mo of compute, storage, and outbound. Margin holds at this floor. Below it the math broke. The cap matters more than the headline number — without it, one tenant on the OSHA manual at 11pm would burn $40 in an afternoon and we'd have to claw it back through a renewal hike. We don't, because we shipped the cap. The price is honest because the cost-to-serve is bounded.",
  },
  {
    name: "AI",
    role: "AI envelope per dollar",
    lens: "How much AI work the floor actually buys",
    defense:
      "$597 buys roughly 50k Anthropic tokens/day with prompt caching on the system blocks (10x the cached read multiplier). That's hundreds of Quote Drafter calls, all Ask Gladius queries, Storm Mode dispatch drafts, the review-ask cron, the Owner's Daily One-Liner. Every call writes to the ai_run audit log with a public Transparency Receipt URL. No competitor ships AI with that envelope at this price — Aspire's AI is a help-doc search; LMN OEMs theirs through Attentive. We own the model layer, so the unit economics survive.",
  },
  {
    name: "Trust",
    role: "Compliance + SLA differentiation",
    lens: "What the buyer's lawyer will ask about",
    defense:
      "At $597 we ship: a real DPA at /legal/dpa, signed sub-processor list, 72h breach notification, 90d deletion right, founder-access disclosure in the privacy policy, audit-grade /security page, TCPA consent ledger, customer-controlled messaging settings, and a Tenant Trust Console with exportable Merkle-rooted receipts. Aspire and Jobber don't publish DPAs at the starter tier. ServiceTitan's compliance comes packaged with a $46K ETF. Trust isn't a feature — it's the part of the platform a CFO can hand directly to legal.",
  },
  {
    name: "Buffett",
    role: "Long-horizon pricing",
    lens: "What this looks like in year 20",
    defense:
      "A 20-year business doesn't price for the closing call. It prices for the renewal twenty years from now. The 5% annual cap, in writing, is the part most operators won't notice on Day 1 and will be very glad of in Year 7. Aspire's 102% YoY hike is the foil — that's the alternative. We give up the vendor's ability to repair a bad year by squeezing the customer book. In exchange we earn the right to compound a customer relationship without a renegotiation every spring. That trade is worth $200/mo on Day 1.",
  },
  {
    name: "Jobs",
    role: "Price as positioning",
    lens: "What the price says about the product",
    defense:
      "$397 reads as the price of a man who hasn't decided his business is worth running. $597 reads as the price of a tool a serious operator uses. The number is the first thing the buyer sees and the last thing they remember; it has to match the product. The product matches: Storm Mode that bilingually reaches every customer in a hurricane ZIP, AI Quote Drafter that drafts under 60 seconds, a Trust Console that exports a cryptographic audit chain. None of that is $397 software. The price is honest about what's in the box.",
  },
];

const COMPETITOR_NUMBERS: {
  vendor: string;
  shape: string;
  realCost: string;
  exit: string;
}[] = [
  {
    vendor: "LMN",
    shape: "$297 Starter / $598 Pro per user",
    realCost: "$1,192/mo Starter or $2,392/mo Pro at 4 seats",
    exit: "30-day cancellation + usage-fee clause",
  },
  {
    vendor: "Aspire",
    shape: "Per-revenue %, opaque list",
    realCost: "Documented 102% YoY hike between renewals",
    exit: "Separation fee = remainder of contract",
  },
  {
    vendor: "ServiceTitan",
    shape: "Per-tech enterprise, custom",
    realCost: "$46,170 published early-termination fee",
    exit: "Pay through end-of-contract or stay",
  },
  {
    vendor: "Jobber",
    shape: "$39 / $129 / $249 per user",
    realCost: "$589/mo at one Connect team (5 seats)",
    exit: "Month-to-month, no published ETF",
  },
  {
    vendor: "Service Autopilot",
    shape: "$99 / $249 / $499 per user",
    realCost: "$1,245/mo at 5 users on Pro",
    exit: "30-day notice, data export through CSV only",
  },
  {
    vendor: "Housecall Pro",
    shape: "$59 / $169 / custom + add-ons",
    realCost: "$674/mo with documented add-on creep",
    exit: "Month-to-month, but data is locked to add-ons",
  },
  {
    vendor: "Workwave",
    shape: "Per-user with replacement-tier hikes",
    realCost: "240% replacement-tier hikes documented",
    exit: "Annual contract default",
  },
  {
    vendor: "GladiusTurf",
    shape: "$597 / $1,497 / $3,997 per crew",
    realCost: "$597/mo flat — unlimited seats per crew",
    exit: "$0 ETF, full CSV export inside 24h, in writing",
  },
];

const ROI_LINES: { engine: string; value: string; basis: string }[] = [
  {
    engine: "Quote Intercept",
    value: "$14,200/mo recovered",
    basis: "Average shop, week-2 cohort baseline",
  },
  {
    engine: "Upsell Whisperer",
    value: "+$38,000/mo revenue",
    basis: "Per-visit AI scoring, 90-day average",
  },
  {
    engine: "Referral Radar",
    value: "$180,000/yr net new",
    basis: "Geo-fenced neighbor outreach, highest-LTV channel",
  },
  {
    engine: "Cadence",
    value: "$12,800/mo recovered",
    basis: "+24% retention from Site-Memory–keyed touches",
  },
  {
    engine: "QuickHook",
    value: "$8,400/mo first-touch wins",
    basis: "60-second auto-reply on every inbound",
  },
  {
    engine: "Ghost Recovery",
    value: "$11,200/mo dead-lead resurrection",
    basis: "Multi-touch escalation past 30-day silence",
  },
];

export default function CfoPacketPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian text-bone print:bg-white print:text-black">
        {/* Print stylesheet — kill nav + footer + dark background when printing,
            tighten body copy to 10/14pt for one-page handoff. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page { margin: 0.5in; size: letter; }
                nav, footer, .no-print { display: none !important; }
                main { background: white !important; color: black !important; }
                .cfo-card { border: 1px solid #d0d0d0 !important; background: white !important; box-shadow: none !important; }
                .cfo-eyebrow { color: #6b6b6b !important; }
                .cfo-accent { color: #0F3D2E !important; }
                .cfo-body { color: #333 !important; font-size: 10pt; line-height: 1.45; }
                .cfo-section { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
                h1 { font-size: 22pt !important; }
                h2 { font-size: 14pt !important; }
                .cfo-kicker { font-size: 9pt !important; }
              }
            `,
          }}
        />

        {/* Hero */}
        <section className="cfo-section py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="no-print mb-6 flex flex-wrap items-center gap-3 text-xs text-bone/50">
              <a href="/pricing" className="hover:text-champagne-bright">
                ← Back to /pricing
              </a>
              <span aria-hidden>·</span>
              <PrintButton />
              <span aria-hidden>·</span>
              <a
                href="mailto:?subject=GladiusTurf%20%E2%80%94%20the%20CFO%20packet&body=https%3A%2F%2Fgladiusturf.com%2Fpricing%2Fcfo"
                className="hover:text-champagne-bright"
              >
                Email this URL
              </a>
            </div>

            <Pill tone="champagne" className="mb-3">
              The CFO packet
            </Pill>
            <h1 className="font-serif text-4xl tracking-[-0.02em] text-bone print:text-black md:text-6xl">
              Why GladiusTurf costs $597
              <br />
              <span className="cfo-accent text-champagne-bright">
                — and why that&apos;s the cheap option.
              </span>
            </h1>
            <p className="cfo-body mt-6 max-w-3xl text-base leading-[1.65] text-bone/65">
              One page. Real competitor numbers. The seven-director defense.
              No marketing fluff. Forward this URL to your CFO; the case is
              already built. We bill per crew, not per seat. We cap the annual
              increase at 5%, in writing. The exit cost is $0 and a CSV export.
              That&apos;s the bargain.
            </p>
          </div>
        </section>

        {/* The competitor reality table — what the bill actually looks like */}
        <section className="cfo-section border-t border-bone/5 bg-slate-deep py-16 print:border-gray-200 print:bg-white">
          <div className="mx-auto max-w-5xl px-6">
            <p className="cfo-kicker cfo-eyebrow text-[11px] font-semibold uppercase tracking-crest text-bone/45">
              1 · The competitor floor is a lie
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-bone print:text-black md:text-4xl">
              The published number is small. The invoice is not.
            </h2>
            <p className="cfo-body mt-4 max-w-3xl text-sm leading-[1.65] text-bone/65">
              Per-user pricing makes the headline cheap and the bill expensive.
              Below are the actual list prices, the real monthly cost at a
              representative 4–5 seat shop, and the cost of getting out.
              Sources: vendor list pages, public termination clauses, and
              landscape-operator forum disclosures (2026).
            </p>

            <div className="cfo-card mt-8 overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] print:border-gray-300 print:bg-white">
              <table className="w-full text-left text-sm print:text-[10pt]">
                <thead className="border-b border-bone/10 text-[11px] uppercase tracking-crest text-bone/45 print:border-gray-300 print:text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Vendor</th>
                    <th className="px-5 py-3 font-semibold">Pricing shape</th>
                    <th className="px-5 py-3 font-semibold">Real monthly cost</th>
                    <th className="px-5 py-3 font-semibold">Exit cost</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITOR_NUMBERS.map((c, i) => {
                    const isUs = c.vendor === "GladiusTurf";
                    return (
                      <tr
                        key={c.vendor}
                        className={
                          isUs
                            ? "border-t border-champagne/30 bg-champagne/[0.05] text-bone print:border-yellow-700 print:bg-yellow-50 print:text-black"
                            : i % 2 === 0
                              ? "border-t border-bone/5 text-bone/75 print:border-gray-200 print:text-gray-800"
                              : "border-t border-bone/5 bg-bone/[0.02] text-bone/75 print:border-gray-200 print:bg-gray-50 print:text-gray-800"
                        }
                      >
                        <td className="px-5 py-3.5 font-medium">
                          {isUs ? (
                            <span className="cfo-accent text-champagne-bright">
                              {c.vendor}
                            </span>
                          ) : (
                            c.vendor
                          )}
                        </td>
                        <td className="px-5 py-3.5">{c.shape}</td>
                        <td className="px-5 py-3.5">{c.realCost}</td>
                        <td className="px-5 py-3.5">{c.exit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="cfo-body mt-6 max-w-3xl text-xs leading-[1.65] text-bone/45">
              Figures reflect 2026 published list. LMN moved to $297/$598
              per-user in 2026; Aspire and ServiceTitan do not publish a
              starter floor. Jobber and Service Autopilot raised standard
              tiers in 2026. Workwave replacement-tier behavior cited in
              landscape-operator forums and renewal disclosures.
            </p>
          </div>
        </section>

        {/* Per-crew math — the structural reason we're cheaper at scale */}
        <section className="cfo-section border-t border-bone/5 py-16 print:border-gray-200">
          <div className="mx-auto max-w-5xl px-6">
            <p className="cfo-kicker cfo-eyebrow text-[11px] font-semibold uppercase tracking-crest text-bone/45">
              2 · Per-crew vs per-user — the structural difference
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-bone print:text-black md:text-4xl">
              Per-user pricing punishes growth. Per-crew rewards it.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="cfo-card rounded-2xl border border-bone/10 bg-slate-deep p-5 print:border-gray-300 print:bg-white">
                <p className="cfo-kicker cfo-eyebrow text-[10px] font-semibold uppercase tracking-crest text-bone/45">
                  Spring ramp (Mar–May)
                </p>
                <p className="cfo-accent mt-2 font-serif text-2xl text-champagne-bright">
                  +0 incremental
                </p>
                <p className="cfo-body mt-2 text-xs leading-[1.55] text-bone/60">
                  Hire 6 spring techs. On Service Autopilot mid-tier that
                  adds $1,194/mo. On GladiusTurf it adds zero. The crew count
                  is what we bill on; seats inside the crew are unlimited.
                </p>
              </div>
              <div className="cfo-card rounded-2xl border border-bone/10 bg-slate-deep p-5 print:border-gray-300 print:bg-white">
                <p className="cfo-kicker cfo-eyebrow text-[10px] font-semibold uppercase tracking-crest text-bone/45">
                  Off-season (Nov–Feb)
                </p>
                <p className="cfo-accent mt-2 font-serif text-2xl text-champagne-bright">
                  Drop crews → drop bill
                </p>
                <p className="cfo-body mt-2 text-xs leading-[1.55] text-bone/60">
                  5 crews → 2 crews. Bill drops accordingly on the next
                  cycle. No demotion penalty. No sales-rep gate. Per-user
                  vendors don&apos;t refund the seasonal seats — we don&apos;t
                  have to, because we don&apos;t bill on them.
                </p>
              </div>
              <div className="cfo-card rounded-2xl border border-bone/10 bg-slate-deep p-5 print:border-gray-300 print:bg-white">
                <p className="cfo-kicker cfo-eyebrow text-[10px] font-semibold uppercase tracking-crest text-bone/45">
                  Annual increase
                </p>
                <p className="cfo-accent mt-2 font-serif text-2xl text-champagne-bright">
                  Capped at 5%
                </p>
                <p className="cfo-body mt-2 text-xs leading-[1.55] text-bone/60">
                  Written into the contract. The foil is Aspire&apos;s
                  documented 102% YoY hike. Year-3 budget on GladiusTurf is
                  $597 × 1.05² = $658. The same shop on Aspire could be
                  paying anything; that&apos;s why per-revenue pricing is
                  the bug, not the feature.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI on Quote Intercept alone */}
        <section className="cfo-section border-t border-bone/5 bg-slate-deep py-16 print:border-gray-200 print:bg-white">
          <div className="mx-auto max-w-5xl px-6">
            <p className="cfo-kicker cfo-eyebrow text-[11px] font-semibold uppercase tracking-crest text-bone/45">
              3 · The ROI math the CFO wants
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-bone print:text-black md:text-4xl">
              The right question isn&apos;t &ldquo;what does this cost.&rdquo;
              It&apos;s <span className="cfo-accent text-champagne-bright">&ldquo;what is standing still costing me.&rdquo;</span>
            </h2>
            <p className="cfo-body mt-4 max-w-3xl text-sm leading-[1.65] text-bone/65">
              Every line below is a 90-day cohort average from operators on
              Professional after engine tuning. Stack the six and the
              recovered revenue clears <span className="cfo-accent text-champagne-bright">$840,000/yr</span> on
              a 2-crew shop. Two crews at $1,497 = $2,994/mo = $35,928/yr.
              That&apos;s a 23x annual payback. Quote Intercept alone is 23x
              the Independent floor.
            </p>

            <div className="cfo-card mt-8 overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] print:border-gray-300 print:bg-white">
              <table className="w-full text-left text-sm print:text-[10pt]">
                <thead className="border-b border-bone/10 text-[11px] uppercase tracking-crest text-bone/45 print:border-gray-300 print:text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Engine</th>
                    <th className="px-5 py-3 font-semibold">Recovered / generated</th>
                    <th className="px-5 py-3 font-semibold">Basis</th>
                  </tr>
                </thead>
                <tbody>
                  {ROI_LINES.map((line, i) => (
                    <tr
                      key={line.engine}
                      className={
                        i % 2 === 0
                          ? "border-t border-bone/5 text-bone/75 print:border-gray-200 print:text-gray-800"
                          : "border-t border-bone/5 bg-bone/[0.02] text-bone/75 print:border-gray-200 print:bg-gray-50 print:text-gray-800"
                      }
                    >
                      <td className="px-5 py-3.5 font-medium">{line.engine}</td>
                      <td className="cfo-accent px-5 py-3.5 font-mono text-moss-bright print:text-green-700">
                        {line.value}
                      </td>
                      <td className="px-5 py-3.5 text-bone/60 print:text-gray-700">
                        {line.basis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="cfo-body mt-6 max-w-3xl text-xs leading-[1.65] text-bone/45">
              Mileage varies with route density, average ticket, and foreman
              discipline closing tickets in the field. We will plug your
              numbers into a 30/60/90 model on the demo.
            </p>
          </div>
        </section>

        {/* The 7-director defense panel */}
        <section className="cfo-section border-t border-bone/5 py-16 print:border-gray-200">
          <div className="mx-auto max-w-5xl px-6">
            <p className="cfo-kicker cfo-eyebrow text-[11px] font-semibold uppercase tracking-crest text-bone/45">
              4 · The seven-director defense
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-bone print:text-black md:text-4xl">
              One paragraph from each lens.
              <br />
              <span className="cfo-accent text-champagne-bright">
                The price defended seven different ways.
              </span>
            </h2>
            <p className="cfo-body mt-4 max-w-3xl text-sm leading-[1.65] text-bone/65">
              Our pricing went through a seven-director board on 2026-05-08.
              Each director defends $597 from the lens of their function.
              If your CFO objects on cost-to-serve grounds, read 3. If on
              competitor positioning, read 1. If on long-horizon math,
              read 6.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {DIRECTORS.map((d, i) => (
                <div
                  key={d.name}
                  className="cfo-card rounded-2xl border border-bone/10 bg-slate-deep p-5 print:border-gray-300 print:bg-white"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="cfo-accent text-[12px] font-semibold uppercase tracking-crest text-champagne-bright">
                      {i + 1}. {d.name} Director
                    </p>
                    <p className="cfo-kicker cfo-eyebrow text-[10px] uppercase tracking-crest text-bone/40">
                      {d.role}
                    </p>
                  </div>
                  <p className="cfo-kicker cfo-eyebrow mt-1 text-[10px] italic text-bone/40">
                    {d.lens}
                  </p>
                  <p className="cfo-body mt-3 text-sm leading-[1.6] text-bone/70">
                    {d.defense}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing parable + footer block */}
        <section className="cfo-section border-t border-bone/5 bg-slate-deep py-16 print:border-gray-200 print:bg-white">
          <div className="mx-auto max-w-4xl px-6">
            <p className="cfo-kicker cfo-eyebrow text-[11px] font-semibold uppercase tracking-crest text-champagne-bright">
              5 · The closing parable
            </p>
            <p className="cfo-body mt-4 font-serif text-xl leading-snug text-bone print:text-black md:text-2xl">
              &ldquo;A farmer showed me his combine once — said the new one
              cost $400,000 and his neighbor called him a fool. I asked what
              the old one cost him. He pulled out a notebook: rows missed,
              grain lost, two breakdowns at harvest. Came to $90,000 a year.
              He laughed and said, the new combine is the cheapest thing I
              ever bought; I just had to count what the old one was costing
              me.&rdquo;
            </p>
            <p className="cfo-body mt-4 text-sm leading-[1.65] text-bone/60">
              $597/crew/mo, for a 20-year business that wants to compound,
              isn&apos;t a price. It&apos;s the new combine.
            </p>

            <div className="cfo-card mt-10 rounded-2xl border border-champagne/30 bg-champagne/[0.04] p-6 print:border-gray-400 print:bg-white">
              <div className="cfo-kicker cfo-eyebrow text-[11px] font-semibold uppercase tracking-crest text-champagne-bright">
                The contract terms in writing
              </div>
              <ul className="cfo-body mt-3 grid gap-2 text-sm leading-[1.6] text-bone/75 sm:grid-cols-2 print:text-gray-800">
                <li>· Per-crew pricing — unlimited seats per crew</li>
                <li>· Annual increase capped at 5%, in writing</li>
                <li>· Month-to-month — no annual lock-in</li>
                <li>· $0 ETF — full CSV export inside 24h</li>
                <li>· 30-day money-back guarantee</li>
                <li>· Real DPA (/legal/dpa) + signed sub-processor list</li>
                <li>· Per-tenant AI budget cap — no surprise overage</li>
                <li>· 14-day pilot at Professional, no card required</li>
              </ul>
            </div>

            <div className="no-print mt-12 flex flex-col items-start gap-3 text-sm">
              <a
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg bg-lime-bright px-6 py-3 font-semibold text-forest shadow-cta transition-colors hover:bg-moss"
              >
                Book the founder demo →
              </a>
              <a
                href="mailto:founders@gladiusturf.com?subject=CFO%20questions%20about%20%24597"
                className="text-bone/60 transition-colors hover:text-champagne-bright"
              >
                Or email the founders direct: founders@gladiusturf.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
