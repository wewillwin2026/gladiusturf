import type { Metadata } from "next";
import { ComparisonTable } from "@/components/comparison-table";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Why crews leave Aspire, LMN, Service Autopilot, and Jobber",
  description:
    "An honest, side-by-side comparison of GladiusTurf vs. Aspire, LMN, Service Autopilot, Jobber, and Real Green. Revenue intelligence for landscape crews — not another all-in-one ERP.",
};

type Support = "yes" | "partial" | "no";

type FeatureRow = {
  feature: string;
  detail: string;
  gladius: Support;
  aspire: Support;
  lmn: Support;
  jobber: Support;
  serviceAutopilot: Support;
};

const FEATURES: FeatureRow[] = [
  {
    feature: "Quote Intercept",
    detail: "Routed estimates with hard SLAs and escalation when reps go cold",
    gladius: "yes",
    aspire: "no",
    lmn: "no",
    jobber: "no",
    serviceAutopilot: "no",
  },
  {
    feature: "Upsell Whisperer",
    detail: "AI scans property photos and prior tickets to surface the next job",
    gladius: "yes",
    aspire: "no",
    lmn: "no",
    jobber: "no",
    serviceAutopilot: "no",
  },
  {
    feature: "Referral Radar",
    detail: "Detects neighbor opportunities from active job sites and triggers outreach",
    gladius: "yes",
    aspire: "no",
    lmn: "no",
    jobber: "partial",
    serviceAutopilot: "no",
  },
  {
    feature: "Applicator Shield",
    detail: "State-by-state pesticide compliance with license expiry watch",
    gladius: "yes",
    aspire: "partial",
    lmn: "partial",
    jobber: "no",
    serviceAutopilot: "no",
  },
  {
    feature: "Site Memory",
    detail: "Per-property memory: gate codes, dog names, where the irrigation valve hides",
    gladius: "yes",
    aspire: "partial",
    lmn: "partial",
    jobber: "partial",
    serviceAutopilot: "partial",
  },
  {
    feature: "Weather Pivot",
    detail: "Storm-aware re-routing with automatic client communication",
    gladius: "yes",
    aspire: "no",
    lmn: "no",
    jobber: "no",
    serviceAutopilot: "no",
  },
  {
    feature: "Surplus Yard",
    detail: "Resell leftover sod, mulch, pavers, plants between local crews",
    gladius: "yes",
    aspire: "no",
    lmn: "no",
    jobber: "no",
    serviceAutopilot: "no",
  },
  {
    feature: "AI-native operations",
    detail: "Built on LLMs end to end — not bolted on after the fact",
    gladius: "yes",
    aspire: "partial",
    lmn: "no",
    jobber: "partial",
    serviceAutopilot: "partial",
  },
  {
    feature: "Per-crew pricing",
    detail: "Flat fee per crew, unlimited seats, no per-user surcharge",
    gladius: "yes",
    aspire: "no",
    lmn: "no",
    jobber: "no",
    serviceAutopilot: "no",
  },
  {
    feature: "Switch from spreadsheets in 7 days",
    detail: "Guided import from QuickBooks, Google Sheets, or paper route sheets",
    gladius: "yes",
    aspire: "no",
    lmn: "partial",
    jobber: "yes",
    serviceAutopilot: "partial",
  },
];

type Competitor = {
  name: string;
  positioning: string;
  strengths: string;
  weaknesses: string[];
  migration: string;
};

const COMPETITORS: Competitor[] = [
  {
    name: "Aspire Software",
    positioning: "Enterprise commercial landscape ERP, owned by ServiceTitan.",
    strengths:
      "Aspire is the most established platform for large commercial landscape contractors. Job costing, work tickets, crew time, equipment depreciation, multi-branch reporting — it does all of it. If you run a $20M+ commercial book with a CFO who lives in pivot tables, Aspire is the safe choice and we will tell you so. The product is mature, the integrations are deep, and the implementation team knows the industry.",
    weaknesses: [
      "Implementation runs three to six months and a five-figure professional services bill before you write a single ticket. Most owner-operators do not have that runway.",
      "The pricing model penalizes growth — every new estimator, foreman, or office admin is another seat fee, which encourages owners to limit access instead of expanding it.",
      "Revenue intelligence is missing. Aspire reports on jobs that already happened. It does not intercept stalled quotes, surface neighbor referrals from active jobs, or scan property photos for upsell. You still run those motions on a whiteboard.",
    ],
    migration:
      "We import your Aspire opportunities, work tickets, properties, and YTD revenue in a single ETL pass and run the two systems in parallel for 30 days so your CFO never loses a number.",
  },
  {
    name: "LMN",
    positioning: "Mid-market estimating, scheduling, and time tracking.",
    strengths:
      "LMN is honest about what it is — a strong estimating and scheduling tool with a built-in budgeting workflow that mid-market crews genuinely use. The estimate-to-schedule pipeline is solid, the time-tracking app holds up in the field, and the Mark Bradley training content is some of the best operational education in the industry. Crews that switched to LMN from spreadsheets generally do not regret it.",
    weaknesses: [
      "LMN ends at the schedule. There is no upsell engine, no referral capture, no SLA on dead quotes, no compliance shield. The revenue side of the business stays in your head.",
      "The UI shows its age — it is a desktop-first product retrofitted for mobile, and crews complain about the field app.",
      "Pesticide and chemical compliance is logging only. If you run lawn care or tree services in a regulated state, you still maintain a separate paper or Real Green workflow.",
    ],
    migration:
      "We pull your LMN customers, jobs, estimates, and crew records via their export, normalize them into GladiusTurf, and keep your QuickBooks integration intact.",
  },
  {
    name: "Service Autopilot",
    positioning: "Broad field-service platform spanning lawn, cleaning, and pest control.",
    strengths:
      "Service Autopilot is genuinely versatile — it serves lawn maintenance, snow, cleaning, and pest control out of the same platform, and the routing optimization is competent. The marketing automation module (drip campaigns, two-way SMS) is more capable than anything Jobber ships, and the reporting catalog is wide.",
    weaknesses: [
      "Versatility is also the weakness. Because Service Autopilot serves four industries, none of the workflows are tuned for landscape revenue specifically — you bend the tool to fit your business instead of the other way around.",
      "The interface is dense and the learning curve is steep. Most shops only use 30 to 40 percent of what they pay for.",
      "Per-user pricing on top of the base platform fee means a 6-person office and 4 crews quickly crosses $1,000 per month before you have shipped a single estimate.",
    ],
    migration:
      "We map Service Autopilot accounts, jobs, services, and route plans into GladiusTurf in 7 days, and keep your existing payment processor connected.",
  },
  {
    name: "Jobber",
    positioning: "Small-business field service — generic across 30+ trades.",
    strengths:
      "Jobber is the easiest software in this category to start using. The setup wizard is excellent, the client experience (online booking, branded quotes, payment links) is genuinely best-in-class, and the support team responds quickly. For a one-truck operation that just needs to look professional and get paid, Jobber is hard to beat.",
    weaknesses: [
      "Jobber serves plumbers, painters, dog groomers, and landscapers from the same template. There is no soil-and-seasonality intelligence, no chemical compliance, no crew-scale routing.",
      "The reporting is shallow. You can see what you billed, but not why your renewal rate dropped in August or which crew leaks the most upsell on stop-three of the route.",
      "Per-user pricing scales painfully. A 4-crew operation with foremen on the app is paying more for Jobber than they would pay GladiusTurf for the entire revenue layer.",
    ],
    migration:
      "Jobber has a clean export. We import clients, properties, jobs, and invoices in under 48 hours and your team is in production by the next Monday.",
  },
  {
    name: "Real Green",
    positioning: "Lawn-care-specific platform with a long history in chemical applications.",
    strengths:
      "Real Green has decades of credibility in the lawn-care vertical. The chemical application workflow, route density tools, and customer-facing service portal are all built around lawn-care economics specifically — which is rare. Established lawn-care operators with 5,000+ customers often have valid reasons to stay.",
    weaknesses: [
      "The interface is genuinely dated and most younger office staff resist using it, which becomes a hiring problem.",
      "Upsell is ad-hoc — service add-ons live in CSRs' heads or paper notes, not in a system that scores accounts and routes the next-best offer.",
      "The platform is built for lawn care only. If you also run hardscape, irrigation, or landscape design, you operate two systems.",
    ],
    migration:
      "We mirror your Real Green customer file, service history, and chemical log into GladiusTurf and stand up Applicator Shield with your state's current label library on day one.",
  },
  {
    name: "Spreadsheets, paper, and QuickBooks",
    positioning: "What 60 percent of crews under $3M still actually run on.",
    strengths:
      "Honestly — it works. A disciplined operator with a paper route book, a Google Sheet for estimates, and clean QuickBooks Online can run a profitable two-crew shop and we have seen it. There is no software bill, no per-user fee, no implementation, and the data is yours. For crews under $500K, this is often the right call.",
    weaknesses: [
      "Every quote that does not close lives in a notebook nobody re-reads. We typically find $80K to $180K of stalled estimates within 90 days of import.",
      "The owner is the system. When the owner takes a Friday off, intake stalls, dispatch drifts, and renewals get missed.",
      "Compliance and crew safety records depend on whoever picks up the clipboard last — and state inspectors do not accept that.",
    ],
    migration:
      "We sit with you for one afternoon, ingest your spreadsheets, route sheets, and last 12 months of QuickBooks, and you are running on GladiusTurf inside a week with zero data lost.",
  },
];

function MarkCell({ value }: { value: Support }) {
  if (value === "yes") {
    return (
      <span
        aria-label="Included"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-moss text-[14px] font-medium text-forest"
      >
        +
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span
        aria-label="Partial"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-forest/30 text-[12px] font-medium text-forest"
      >
        ~
      </span>
    );
  }
  return (
    <span
      aria-label="Not included"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone/30 text-[14px] font-medium text-stone"
    >
      −
    </span>
  );
}

const STEPS = [
  {
    day: "Day 0",
    title: "Discovery and export",
    body:
      "30-minute call. We pull your export from Aspire, LMN, Jobber, Service Autopilot, Real Green, or your spreadsheets. You give us read-only QuickBooks access. No commitment yet.",
  },
  {
    day: "Days 1–3",
    title: "Data normalization",
    body:
      "Our import team maps your customers, properties, services, crews, and 12 months of revenue into GladiusTurf. We surface duplicates, stalled quotes, and missing service addresses while we are in there.",
  },
  {
    day: "Days 4–7",
    title: "Configuration and training",
    body:
      "We configure your service catalog, routes, crews, pricing, and compliance rules. Two 60-minute training sessions — one for the office, one for the foremen. Your team logs in and runs a real Monday.",
  },
  {
    day: "Days 8–21",
    title: "Parallel run",
    body:
      "You run GladiusTurf and your old system side by side. We reconcile every job and every dollar daily so finance signs off before the cutover. Most crews bail on the old system by day 14 anyway.",
  },
  {
    day: "Days 22–30",
    title: "Cutover and revenue review",
    body:
      "Old system goes read-only. We run a revenue intelligence review — stalled quote recovery, upsell opportunities surfaced, referral radar set live, applicator shield on. You see the first dollar that came back.",
  },
];

export default function ComparePage() {
  return (
    <>
      <Nav />
      <main className="bg-paper">
        <section className="border-b border-[rgba(15,61,46,0.12)]">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Compare
            </p>
            <h1 className="max-w-5xl font-serif text-display-md text-forest md:text-display-lg">
              Why crews leave Aspire, LMN, Service Autopilot, and Jobber for GladiusTurf.
            </h1>
            <div className="mt-10 grid max-w-3xl gap-6 text-[18px] leading-[1.6] text-stone">
              <p>
                GladiusTurf is not another all-in-one landscaping ERP. We are
                not trying to replace Aspire&apos;s job-costing engine,
                LMN&apos;s estimating module, or QuickBooks&apos; general
                ledger. Those tools work — and for plenty of established crews,
                they will keep working.
              </p>
              <p>
                What we are is the revenue intelligence layer that sits on top
                of (or in place of) the legacy stack. We watch every quote,
                every property, every route, every chemical application, and
                every customer interaction, and we surface the dollars your
                crew is leaving in the grass — stalled estimates, missed
                upsells, neighbor referrals on active job sites, surplus
                materials sitting in the yard, compliance lapses that turn
                into fines. The incumbents report on what already happened.
                GladiusTurf intervenes before the dollar walks.
              </p>
            </div>
          </div>
        </section>

        <ComparisonTable />

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Honest competitor reviews
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              What each platform does well — and where the revenue leaks out.
            </h2>
            <p className="mt-6 max-w-3xl text-[16px] leading-[1.6] text-stone">
              We have helped operators leave every platform on this page. The
              assessments below are written by people who have done the
              imports, not by a marketing team trying to win a bake-off.
            </p>

            <div className="mt-12 grid gap-10 md:gap-12">
              {COMPETITORS.map((c) => (
                <article
                  key={c.name}
                  className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-paper p-8 md:p-10"
                >
                  <p className="text-sm uppercase tracking-tagline text-stone">
                    {c.positioning}
                  </p>
                  <h3 className="mt-3 font-serif text-h2-md text-forest">
                    {c.name}
                  </h3>
                  <p className="mt-6 max-w-3xl text-[16px] leading-[1.65] text-forest">
                    {c.strengths}
                  </p>

                  <p className="mt-8 text-sm uppercase tracking-tagline text-stone">
                    Where GladiusTurf is the better fit
                  </p>
                  <ul className="mt-4 grid gap-3">
                    {c.weaknesses.map((w) => (
                      <li
                        key={w}
                        className="flex gap-3 text-[16px] leading-[1.6] text-forest"
                      >
                        <span
                          aria-hidden
                          className="mt-[10px] inline-block h-[6px] w-[6px] flex-shrink-0 rounded-full bg-moss"
                        />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 rounded-[8px] bg-bone px-5 py-4">
                    <p className="text-[12px] uppercase tracking-tagline text-stone">
                      Migration path
                    </p>
                    <p className="mt-2 text-[15px] leading-[1.6] text-forest">
                      {c.migration}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-paper">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              Feature by feature
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              The capabilities that change a crew&apos;s revenue, side by side.
            </h2>
            <p className="mt-6 max-w-3xl text-[16px] leading-[1.6] text-stone">
              Plus sign means shipped and supported. Tilde means partial — the
              platform technically does it, but not at the depth a serious
              landscape operator needs. Minus sign means not available.
            </p>

            <div className="mt-12 overflow-x-auto rounded-[12px] border border-[rgba(15,61,46,0.12)]">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="bg-bone text-left text-[12px] uppercase tracking-[0.12em] text-stone">
                    <th className="px-4 py-4 font-medium">Capability</th>
                    <th className="px-4 py-4 text-center font-medium text-forest">
                      GladiusTurf
                    </th>
                    <th className="px-4 py-4 text-center font-medium">Aspire</th>
                    <th className="px-4 py-4 text-center font-medium">LMN</th>
                    <th className="px-4 py-4 text-center font-medium">Jobber</th>
                    <th className="px-4 py-4 text-center font-medium">
                      Service Autopilot
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-t border-[rgba(15,61,46,0.08)] align-top"
                    >
                      <td className="px-4 py-5">
                        <p className="text-[14px] font-medium text-forest">
                          {row.feature}
                        </p>
                        <p className="mt-1 text-[13px] leading-[1.5] text-stone">
                          {row.detail}
                        </p>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <MarkCell value={row.gladius} />
                      </td>
                      <td className="px-4 py-5 text-center">
                        <MarkCell value={row.aspire} />
                      </td>
                      <td className="px-4 py-5 text-center">
                        <MarkCell value={row.lmn} />
                      </td>
                      <td className="px-4 py-5 text-center">
                        <MarkCell value={row.jobber} />
                      </td>
                      <td className="px-4 py-5 text-center">
                        <MarkCell value={row.serviceAutopilot} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(15,61,46,0.12)] bg-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-stone">
              30-day switch
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md text-forest md:text-h2-lg">
              You will be running on GladiusTurf inside a month. Most crews are running on it inside two weeks.
            </h2>
            <p className="mt-6 max-w-3xl text-[16px] leading-[1.6] text-stone">
              Switching software is the most common reason crews stay on a
              platform they have already outgrown. We have built the import
              and parallel-run process so the cost of leaving your current
              system is genuinely smaller than the cost of staying another
              quarter. We pay your overlap month if it takes longer than 30
              days — that has not happened yet.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-5">
              {STEPS.map((s) => (
                <div
                  key={s.day}
                  className="rounded-[12px] border border-[rgba(15,61,46,0.12)] bg-paper p-6"
                >
                  <p className="font-mono text-[12px] uppercase tracking-tagline text-stone">
                    {s.day}
                  </p>
                  <h3 className="mt-3 font-serif text-[20px] leading-[1.25] text-forest">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-stone">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-forest text-bone">
          <div className="mx-auto max-w-content px-6 py-20 md:py-section">
            <p className="mb-6 text-sm uppercase tracking-tagline text-moss">
              See it on your data
            </p>
            <h2 className="max-w-3xl font-serif text-h2-md md:text-h2-lg">
              Free 30-minute demo. We&apos;ll run it on your customers, your routes, your numbers.
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.6] text-bone/80">
              Send us a CSV from Aspire, LMN, Jobber, Service Autopilot, Real
              Green, or a Google Sheet — anything. We will load it before the
              call and walk you through the stalled quotes, missed upsells,
              and referral opportunities sitting in your own book of business.
              No slides. No sales script. Your data, your dollars.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="/demo"
                className="inline-flex items-center rounded-[8px] bg-moss px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/90"
              >
                Book a 30-minute demo
              </a>
              <a
                href="/pricing"
                className="text-sm font-medium text-bone underline underline-offset-4 hover:text-moss"
              >
                See per-crew pricing →
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
