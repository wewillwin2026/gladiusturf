import type { Metadata } from "next";
import { Fragment } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title:
    "Why crews leave Aspire, LMN, Service Autopilot, and Jobber — 33-engine comparison",
  description:
    "An honest, side-by-side comparison of GladiusTurf's 33 engines vs. Aspire, LMN, Service Autopilot, Jobber, and Real Green. Includes the Field Crew App PWA, Client Portal, LRI Score, native Books + Payroll, Retention Radar, and the intelligence engines (Intent Scorer, UrgencySync, WinMemory) competitors don't ship at all.",
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

type FeatureSection = {
  tier: string;
  blurb: string;
  rows: FeatureRow[];
};

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    tier: "Revenue",
    blurb: "How you win the work.",
    rows: [
      {
        feature: "Quote Intercept",
        detail:
          "Routed estimates with hard SLAs and escalation when reps go cold",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "QuickHook",
        detail:
          "60-second auto-reply on every inbound — wins the race against the four other shops",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Upsell Whisperer",
        detail:
          "AI scans property photos and prior tickets to surface the next job",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Referral Radar",
        detail:
          "Detects neighbor opportunities from active job sites and triggers outreach",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "partial",
        serviceAutopilot: "no",
      },
      {
        feature: "VoiceQuote",
        detail:
          "Voice-driven estimates — foreman walks the lawn, the estimate writes itself",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Property Hunter",
        detail:
          "Cold outreach engine — satellite-matched property targeting at street-by-street resolution",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Ghost Recovery",
        detail:
          "Voss-style escalation that reawakens leads everyone else gave up on",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "ServiceMagnet",
        detail:
          "Semantic re-engagement — pulls dormant customers back into upsell windows",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
    ],
  },
  {
    tier: "Lifecycle",
    blurb: "How you keep the customer.",
    rows: [
      {
        feature: "Client Portal",
        detail:
          "White-labeled self-serve portal — schedule, reschedule, and pay without a phone call",
        gladius: "yes",
        aspire: "partial",
        lmn: "no",
        jobber: "partial",
        serviceAutopilot: "no",
      },
      {
        feature: "Cadence",
        detail:
          "NOAA-timed, Site-Memory personalized cadences — not template blasts",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "partial",
        serviceAutopilot: "partial",
      },
      {
        feature: "Site Memory",
        detail:
          "Per-property memory: gate codes, dog names, where the irrigation valve hides",
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
        feature: "ShowRate Max",
        detail:
          "7-touch confirmation cadence — drives appointment-show rate from 64% to 92%",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "partial",
        serviceAutopilot: "no",
      },
      {
        feature: "LifeHook",
        detail:
          "Life-event detection — divorce, baby, retirement, move-in — triggers tuned outreach",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
    ],
  },
  {
    tier: "Intelligence",
    blurb: "How the AI gets smarter every night.",
    rows: [
      {
        feature: "Intent Scorer",
        detail: "Every inbound inquiry scored 1–100 for buying intent",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "UrgencySync",
        detail:
          "Real-time temperature scoring across the funnel — tells your closer who's hot today",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "ToneRadar",
        detail:
          "Stylometric ghost prediction — flags the message that means a customer is about to bail",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "WinMemory",
        detail:
          "Vector store of every won deal — Cortex retrieves the closest analog before your closer types a word",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Market Anchor",
        detail:
          "Pricing intelligence — compares your number against the local market in real time",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "LRI Score",
        detail:
          "Landscaping Revenue Intelligence — nightly 0–100 operational benchmark per shop, crew, property",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
    ],
  },
  {
    tier: "Operations",
    blurb: "How the crews actually execute.",
    rows: [
      {
        feature: "Safety Shield",
        detail:
          "State-by-state pesticide and applicator compliance with license expiry watch",
        gladius: "yes",
        aspire: "partial",
        lmn: "partial",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Quality Radar",
        detail:
          "Photo-based QA on every visit — before/after, missed edges, dead zones, callback risk",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Operator Score",
        detail:
          "Portable crew passport — performance, safety, and customer-satisfaction reputation that travels with the crew",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Field Crew App",
        detail:
          "Offline-first PWA — works on any phone, syncs when signal returns, no app-store gatekeeping",
        gladius: "yes",
        aspire: "partial",
        lmn: "partial",
        jobber: "partial",
        serviceAutopilot: "partial",
      },
      {
        feature: "Job Costing",
        detail:
          "Line-item profitability per ticket — labor, materials, drive time, equipment depreciation",
        gladius: "yes",
        aspire: "yes",
        lmn: "partial",
        jobber: "partial",
        serviceAutopilot: "partial",
      },
    ],
  },
  {
    tier: "Marketplace",
    blurb: "How the network compounds.",
    rows: [
      {
        feature: "Surplus Yard",
        detail:
          "Resell leftover sod, mulch, pavers, plants between local crews",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
      {
        feature: "Knowledge Codex",
        detail:
          "Auto-categorized SOP library — tribal knowledge becomes searchable company memory",
        gladius: "yes",
        aspire: "no",
        lmn: "no",
        jobber: "no",
        serviceAutopilot: "no",
      },
    ],
  },
  {
    tier: "Foundation",
    blurb: "How the business is structured.",
    rows: [
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
        detail:
          "Guided import from QuickBooks, Google Sheets, or paper route sheets — all 33 engines live on day 7",
        gladius: "yes",
        aspire: "no",
        lmn: "partial",
        jobber: "yes",
        serviceAutopilot: "partial",
      },
    ],
  },
];

type Competitor = {
  name: string;
  positioning: string;
  strengths: string;
  weaknesses: string[];
  migration: string;
  tone: "moss" | "honey";
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
      "Customer portal is basic and Aspire-branded, with no native Stripe collection — your clients see a vendor logo, not yours, and your CSR still chases card numbers by phone.",
      "No Intent Scorer or UrgencySync — every inbound is treated the same, so a hot $40K commercial RFP and a curious one-time mow lookup hit the same queue at the same priority.",
      "No Field Crew App PWA — their field tool is online-only, which means a crew at a property with no signal is a crew that types nothing into the system for the rest of the day.",
      "No LRI Score or peer benchmarking — Aspire reports on what already happened, but it cannot tell you whether your win rate is good for your zip code.",
    ],
    migration:
      "We import your Aspire opportunities, work tickets, properties, and YTD revenue in a single ETL pass and run the two systems in parallel for 30 days so your CFO never loses a number.",
    tone: "honey",
  },
  {
    name: "LMN",
    positioning: "Mid-market estimating, scheduling, and time tracking.",
    strengths:
      "LMN is honest about what it is — a strong estimating and scheduling tool with a built-in budgeting workflow that mid-market crews genuinely use. The estimate-to-schedule pipeline is solid, the time-tracking app holds up in the field, and the Mark Bradley training content is some of the best operational education in the industry. Crews that switched to LMN from spreadsheets generally do not regret it.",
    weaknesses: [
      "LMN ends at the schedule. There is no upsell engine, no referral capture, no SLA on dead quotes, no Quote Intercept. The revenue side of the business stays in your head.",
      "No QuickHook auto-reply — if a lead messages your shop at 9pm, they hear back when the office opens, and by then they have already booked with someone else.",
      "No intelligence layer at all — no Intent Scorer, no WinMemory, no ToneRadar — so every closer is starting from scratch on every deal with no AI memory of what worked before.",
      "Pesticide and chemical compliance is logging only. If you run lawn care or tree services in a regulated state, you still maintain a separate paper or Real Green workflow.",
      "No customer portal and no automated follow-up cadence engine — every reschedule, payment reminder, and seasonal renewal still rides on a CSR's task list.",
    ],
    migration:
      "We pull your LMN customers, jobs, estimates, and crew records via their export, normalize them into GladiusTurf, and keep your QuickBooks integration intact.",
    tone: "moss",
  },
  {
    name: "Service Autopilot",
    positioning:
      "Broad field-service platform spanning lawn, cleaning, and pest control.",
    strengths:
      "Service Autopilot is genuinely versatile — it serves lawn maintenance, snow, cleaning, and pest control out of the same platform, and the routing optimization is competent. The marketing automation module (drip campaigns, two-way SMS) is more capable than anything Jobber ships, and the reporting catalog is wide.",
    weaknesses: [
      "Versatility is also the weakness. Because Service Autopilot serves four industries, none of the workflows are tuned for landscape revenue specifically — you bend the tool to fit your business instead of the other way around.",
      "Per-user pricing on top of the base platform fee means a 6-person office and 4 crews quickly crosses $1,000 per month before you have shipped a single estimate.",
      "No Operator Score — there is no portable crew passport, so every time you hire a foreman from a competitor, you are starting their reputation tracking from zero.",
      "No Quality Radar — photo-based QA on every visit is not in the product, so callback risk is a vibe, not a number.",
      "Customer portal is not included with the base platform — it is sold as a separate product, and the cadence module ships templates without AI personalization off Site Memory.",
    ],
    migration:
      "We map Service Autopilot accounts, jobs, services, and route plans into GladiusTurf in 7 days, and keep your existing payment processor connected.",
    tone: "moss",
  },
  {
    name: "Jobber",
    positioning: "Small-business field service — generic across 30+ trades.",
    strengths:
      "Jobber is the easiest software in this category to start using. The setup wizard is excellent, the client experience (online booking, branded quotes, payment links) is genuinely best-in-class, and the support team responds quickly. For a one-truck operation that just needs to look professional and get paid, Jobber is hard to beat.",
    weaknesses: [
      "Jobber serves plumbers, painters, dog groomers, and landscapers from the same template. There is no soil-and-seasonality intelligence, no chemical compliance, no crew-scale routing.",
      "Per-user pricing scales painfully. A 4-crew operation with foremen on the app is paying more for Jobber than they would pay GladiusTurf for the entire revenue layer.",
      "No Property Hunter or VoiceQuote — outbound is whatever the owner manages to do between fielding inbound calls, and estimates still get typed by hand.",
      "No LifeHook — Jobber has no concept of life-event triggers, so a customer who just bought a house is the same customer they were six months ago in the system.",
      "The cadence engine is template-only — no AI personalization off Site Memory, no NOAA-aware timing — so your follow-ups land on the same Tuesday morning regardless of weather, season, or what the property actually needs.",
    ],
    migration:
      "Jobber has a clean export. We import clients, properties, jobs, and invoices in under 48 hours and your team is in production by the next Monday.",
    tone: "honey",
  },
  {
    name: "Real Green",
    positioning:
      "Lawn-care-specific platform with a long history in chemical applications.",
    strengths:
      "Real Green has decades of credibility in the lawn-care vertical. The chemical application workflow, route density tools, and customer-facing service portal are all built around lawn-care economics specifically — which is rare. Established lawn-care operators with 5,000+ customers often have valid reasons to stay.",
    weaknesses: [
      "The interface is genuinely dated and most younger office staff resist using it, which becomes a hiring problem.",
      "Upsell is ad-hoc — service add-ons live in CSRs' heads or paper notes, not in a system that scores accounts and routes the next-best offer.",
      "No WinMemory or ToneRadar — the AI layer that compounds learning across deals does not exist, so the system on day 1,000 is the system on day 1.",
      "No Field Crew App PWA — field tooling assumes always-online, which fails the moment a crew is out of cell coverage in a rural service zone.",
      "Cadence templates are not personalized to property memory — every customer gets the same seasonal email regardless of soil type, last service, or what the foreman noted on the last visit.",
    ],
    migration:
      "We mirror your Real Green customer file, service history, and chemical log into GladiusTurf and stand up Safety Shield with your state's current label library on day one.",
    tone: "honey",
  },
  {
    name: "Spreadsheets, paper, and QuickBooks",
    positioning: "What 60 percent of crews under $3M still actually run on.",
    strengths:
      "Honestly — it works. A disciplined operator with a paper route book, a Google Sheet for estimates, and clean QuickBooks Online can run a profitable two-crew shop and we have seen it. There is no software bill, no per-user fee, no implementation, and the data is yours. For crews under $500K, this is often the right call.",
    weaknesses: [
      "Every quote that does not close lives in a notebook nobody re-reads. We typically find $80K to $180K of stalled estimates within 90 days of import.",
      "The owner is the system. When the owner takes a Friday off, intake stalls, dispatch drifts, and renewals get missed.",
      "No intelligence layer at all — Intent Scorer, UrgencySync, WinMemory, LRI Score do not exist on a spreadsheet, and they are the exact tools that turn a $1M shop into a $5M shop.",
      "There is no portal at all — every reschedule, payment, and seasonal renewal is a phone call, and at scale that becomes a part-time CSR you did not budget for.",
    ],
    migration:
      "We sit with you for one afternoon, ingest your spreadsheets, route sheets, and last 12 months of QuickBooks, and you are running on GladiusTurf inside a week with zero data lost.",
    tone: "moss",
  },
];

// MarkCell — `highlight` = the GladiusTurf column (KEEPS moss-bright glow as
// the signature trust marker). Other vendor ✓ marks switch to champagne.
function MarkCell({
  value,
  highlight = false,
}: {
  value: Support;
  highlight?: boolean;
}) {
  if (value === "yes") {
    return (
      <span
        aria-label="Included"
        className={
          highlight
            ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-moss-bright/15 ring-1 ring-moss-bright/40"
            : "inline-flex h-6 w-6 items-center justify-center"
        }
      >
        <Check
          className={
            highlight
              ? "h-4 w-4 text-moss-bright"
              : "h-5 w-5 text-champagne-bright"
          }
          strokeWidth={highlight ? 3 : 2.5}
        />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span
        aria-label="Partial"
        className="inline-flex h-6 w-6 items-center justify-center text-[14px] font-semibold text-champagne-bright/60"
      >
        ~
      </span>
    );
  }
  return (
    <span
      aria-label="Not included"
      className="inline-flex h-6 w-6 items-center justify-center"
    >
      <Minus className="h-5 w-5 text-bone/20" strokeWidth={2} />
    </span>
  );
}

const STEPS = [
  {
    week: "Week 0",
    title: "Discovery and export",
    body: "30-minute call. We pull your export from Aspire, LMN, Jobber, Service Autopilot, Real Green, or your spreadsheets. You give us read-only QuickBooks access. No commitment yet.",
  },
  {
    week: "Week 1",
    title: "Data normalization + all 33 engines live",
    body: "Our import team maps your customers, properties, services, crews, and 12 months of revenue into GladiusTurf. By day 7 every one of the 33 engines is firing on your data — Quote Intercept, the Field Crew App PWA, Intent Scorer, Books, Payroll, Retention Radar, the LRI Score, all of it.",
  },
  {
    week: "Week 2",
    title: "Configuration and training",
    body: "We configure your service catalog, routes, crews, pricing, and compliance rules. Two 60-minute training sessions — one for the office, one for the foremen. Your team logs in and runs a real Monday.",
  },
  {
    week: "Week 3",
    title: "Parallel run",
    body: "You run GladiusTurf and your old system side by side. We reconcile every job and every dollar daily so finance signs off before the cutover. Most crews bail on the old system by day 14 anyway.",
  },
  {
    week: "Week 4",
    title: "Cutover and revenue review",
    body: "Old system goes read-only. We run a revenue intelligence review — stalled quote recovery, upsell opportunities surfaced, Referral Radar set live, Safety Shield on, the LRI Score baselined. You see the first dollar that came back.",
  },
];

export default function ComparePage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* Hero — pitch black stage */}
        <section className="border-b border-bone/10 bg-pitch">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <Eyebrow tone="champagne" className="mb-6">
              Compare · 33 engines
            </Eyebrow>
            <h1 className="max-w-5xl font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-6xl">
              Why crews are leaving Aspire, LMN, Service Autopilot, and Jobber.
            </h1>
            <div className="mt-10 grid max-w-3xl gap-6 text-lg leading-[1.6] text-bone/60 md:text-xl">
              <p>
                GladiusTurf is not another all-in-one landscaping ERP. We do
                not try to replace Aspire&apos;s job-costing engine, LMN&apos;s
                estimating module, or QuickBooks&apos; general ledger. Those
                tools work — and for plenty of established crews, they will
                keep working.
              </p>
              <p>
                What we are is the 33-engine revenue and operations layer that
                sits on top of (or in place of) the legacy stack. That includes
                the Field Crew App PWA, a white-labeled Client Portal, the LRI
                Score nightly benchmark, and a full intelligence tier — Intent
                Scorer, UrgencySync, ToneRadar, WinMemory — that competitors
                do not ship at all. The incumbents report on what already
                happened. GladiusTurf intervenes before the dollar walks.
              </p>
            </div>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="border-b border-bone/10 bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-3">
                Feature by feature
              </Eyebrow>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                Thirty-three engines, organized into five tiers, against the
                legacy stack.
              </h2>
              <p className="mt-4 text-lg text-bone/60">
                Moss check in the GladiusTurf column means shipped and
                supported. Champagne check in a vendor column means they have
                it too. Tilde means partial — the platform technically does
                it, but not at the depth a serious landscape operator needs.
                Dim minus means not available.
              </p>
            </div>

            <div className="relative mt-14 rounded-2xl border border-bone/10 bg-obsidian p-6 md:p-8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead>
                    <tr className="border-b border-bone/10">
                      <th className="py-5 pr-6 text-left text-xs font-semibold uppercase tracking-[0.14em] text-bone/40">
                        Capability
                      </th>
                      <th className="relative py-5 text-center">
                        <div
                          aria-hidden
                          className="absolute inset-x-2 inset-y-0 -z-10 rounded-t-xl bg-gradient-to-b from-moss-bright/15 to-transparent"
                        />
                        <div className="font-serif text-lg font-semibold text-moss-bright">
                          GladiusTurf
                        </div>
                        <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-moss-bright/70">
                          33-engine layer
                        </div>
                      </th>
                      <th className="py-5 text-center">
                        <div className="text-sm font-semibold text-bone">
                          Aspire
                        </div>
                        <div className="mt-1 text-[10px] text-bone/40">
                          Enterprise ERP
                        </div>
                      </th>
                      <th className="py-5 text-center">
                        <div className="text-sm font-semibold text-bone">
                          LMN
                        </div>
                        <div className="mt-1 text-[10px] text-bone/40">
                          Estimate &amp; schedule
                        </div>
                      </th>
                      <th className="py-5 text-center">
                        <div className="text-sm font-semibold text-bone">
                          Jobber
                        </div>
                        <div className="mt-1 text-[10px] text-bone/40">
                          Generic field service
                        </div>
                      </th>
                      <th className="py-5 text-center">
                        <div className="text-sm font-semibold text-bone">
                          Service Autopilot
                        </div>
                        <div className="mt-1 text-[10px] text-bone/40">
                          Multi-trade
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_SECTIONS.map((section, sectionIdx) => {
                      // Even sections lead champagne, odd sections moss —
                      // tier section headers get champagne tinted backgrounds.
                      const useChampagne = sectionIdx % 2 === 0;
                      const headerCls = useChampagne
                        ? "text-[10px] font-semibold uppercase tracking-crest text-champagne-bright"
                        : "text-[10px] font-semibold uppercase tracking-crest text-moss-bright";
                      const headerBg = useChampagne
                        ? "bg-champagne/[0.05]"
                        : "bg-bone/[0.05]";
                      return (
                        <Fragment key={section.tier}>
                          <tr className={`border-b border-bone/10 ${headerBg}`}>
                            <td colSpan={6} className="py-3 pr-6">
                              <div className="flex items-baseline gap-3">
                                <span className={headerCls}>
                                  {section.tier} tier
                                </span>
                                <span className="text-[11px] text-bone/40">
                                  {section.blurb}
                                </span>
                              </div>
                            </td>
                          </tr>
                          {section.rows.map((row, i) => (
                            <tr
                              key={`${section.tier}-${row.feature}`}
                              className={`border-b border-bone/5 align-top ${
                                i % 2 === 0 ? "" : "bg-bone/[0.015]"
                              }`}
                            >
                              <td className="py-4 pr-6">
                                <p className="text-sm font-medium text-bone">
                                  {row.feature}
                                </p>
                                <p className="mt-1 text-[13px] leading-[1.5] text-bone/60">
                                  {row.detail}
                                </p>
                              </td>
                              <td className="relative py-4">
                                <div
                                  aria-hidden
                                  className="absolute inset-x-2 inset-y-0 -z-10 bg-moss-bright/[0.04]"
                                />
                                <div className="flex justify-center text-bone/80">
                                  <MarkCell value={row.gladius} highlight />
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="flex justify-center text-bone/80">
                                  <MarkCell value={row.aspire} />
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="flex justify-center text-bone/80">
                                  <MarkCell value={row.lmn} />
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="flex justify-center text-bone/80">
                                  <MarkCell value={row.jobber} />
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="flex justify-center text-bone/80">
                                  <MarkCell value={row.serviceAutopilot} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile scroll affordance */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-6 right-6 w-12 rounded-r-2xl bg-gradient-to-l from-obsidian to-transparent md:hidden"
              />
            </div>
            <p className="mt-3 text-center text-xs text-bone/40 md:hidden">
              Swipe the table to compare →
            </p>
          </div>
        </section>

        {/* Beyond the matrix — left card moss (signature), right card
            champagne (heritage halo). */}
        <section className="border-b border-bone/10 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-3">
                Beyond the matrix
              </Eyebrow>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                What a feature checkbox doesn&apos;t capture.
              </h2>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-moss/30 bg-gradient-to-b from-moss/10 to-transparent p-8">
                <Eyebrow tone="moss" className="mb-4">
                  We invented new categories
                </Eyebrow>
                <h3 className="font-serif text-2xl font-semibold text-bone">
                  We don&apos;t just match competitors — we invented new
                  engines.
                </h3>
                <p className="mt-4 text-base leading-[1.65] text-bone/70">
                  Intent Scorer, UrgencySync, ToneRadar, WinMemory, the LRI
                  Score, Operator Score, Property Hunter, Ghost Recovery,
                  LifeHook — these are not features the legacy stack ships
                  poorly. They are categories that did not exist in landscaping
                  software until we built them. The feature checkbox above is
                  an undercount because the columns to the right of GladiusTurf
                  do not have these rows on their roadmap.
                </p>
              </div>
              <div className="rounded-2xl border border-champagne/30 bg-gradient-to-b from-champagne/10 to-transparent p-8 shadow-pop-champagne">
                <Eyebrow tone="champagne" className="mb-4">
                  Compounding intelligence
                </Eyebrow>
                <h3 className="font-serif text-2xl font-semibold text-bone">
                  Our AI gets smarter every night. Theirs is the same on day
                  1,000 as day 1.
                </h3>
                <p className="mt-4 text-base leading-[1.65] text-bone/70">
                  Cortex runs autonomous hypothesis tests against your closed
                  deals every night. ResponseOptimizer A/B tests every cadence
                  message in production and ships the winner. WinMemory pulls
                  the closest analog from your own win history before your
                  closer types a word. The legacy stack does not have any of
                  this. Every quote starts from scratch. Every closer
                  re-learns. Every season is a coin flip.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Honest competitor reviews — alternating sections.
            Per-competitor accents alternate champagne / moss through the
            6 competitors (champagne lead). */}
        <section className="border-b border-bone/10 bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-3">
                Honest competitor reviews
              </Eyebrow>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                What each platform does well — and where the revenue leaks out.
              </h2>
              <p className="mt-4 text-lg text-bone/60">
                We have helped operators leave every platform on this page. The
                assessments below are written by people who have done the
                imports, not by a marketing team trying to win a bake-off.
              </p>
            </div>
          </div>
        </section>

        {COMPETITORS.map((c, idx) => {
          const isAlt = idx % 2 === 1;
          // Champagne / moss / champagne / moss / champagne / moss
          // through the six competitors (index drives, not legacy tone).
          const useChampagne = idx % 2 === 0;
          const migrationEyebrow = useChampagne
            ? "text-champagne-bright"
            : "text-moss-bright";
          const advantageBorder = useChampagne
            ? "border-champagne/30 bg-gradient-to-b from-champagne/5 to-transparent"
            : "border-moss/30 bg-gradient-to-b from-moss/5 to-transparent";
          const advantageEyebrow = useChampagne
            ? "text-champagne-bright"
            : "text-moss-bright";
          const checkColor = useChampagne
            ? "text-champagne-bright"
            : "text-moss-bright";
          return (
            <section
              key={c.name}
              className={`border-b border-bone/10 ${
                isAlt ? "bg-slate-deep" : "bg-obsidian"
              }`}
            >
              <div className="mx-auto max-w-7xl px-6 py-28">
                <div className="grid gap-10 md:grid-cols-2 md:gap-16">
                  {/* Left: competitor strengths */}
                  <div className={isAlt ? "md:order-2" : ""}>
                    <p className="text-xs font-semibold uppercase tracking-crest text-bone/40">
                      {c.positioning}
                    </p>
                    <h3 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.01em] text-bone md:text-4xl">
                      {c.name}
                    </h3>
                    <p className="mt-6 text-base leading-[1.7] text-bone/60 md:text-lg">
                      {c.strengths}
                    </p>

                    <div className="mt-8 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-crest ${migrationEyebrow}`}
                      >
                        Migration path
                      </p>
                      <p className="mt-2 text-sm leading-[1.6] text-bone/80">
                        {c.migration}
                      </p>
                    </div>
                  </div>

                  {/* Right: GladiusTurf advantages */}
                  <div className={isAlt ? "md:order-1" : ""}>
                    <div
                      className={`rounded-2xl border ${advantageBorder} p-6 md:p-8`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-crest ${advantageEyebrow}`}
                      >
                        Where GladiusTurf is the better fit
                      </p>
                      <h4 className="mt-4 font-serif text-2xl font-semibold text-bone">
                        Thirty-three engines the legacy stack does not ship.
                      </h4>
                      <ul className="mt-6 grid gap-4">
                        {c.weaknesses.map((w) => (
                          <li
                            key={w}
                            className="flex gap-3 text-sm leading-[1.65] text-bone/80 md:text-base"
                          >
                            <Check
                              aria-hidden
                              className={`mt-1 h-4 w-4 flex-shrink-0 ${checkColor}`}
                              strokeWidth={3}
                            />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* 30-day switch timeline — alternate champagne / moss */}
        <section className="border-b border-bone/10 bg-obsidian">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-3">
                30-day switch
              </Eyebrow>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                All 33 engines live by day 7. Most crews on GladiusTurf inside
                two weeks.
              </h2>
              <p className="mt-4 text-lg text-bone/60">
                Switching software is the most common reason crews stay on a
                platform they have already outgrown. We have built the import
                and parallel-run process so the cost of leaving your current
                system is genuinely smaller than the cost of staying another
                quarter. We pay your overlap month if it takes longer than 30
                days — that has not happened yet.
              </p>
            </div>

            <div className="mt-14 flex flex-col gap-6 md:flex-row md:gap-4">
              {STEPS.map((s, i) => {
                const useChampagne = i % 2 === 0;
                const dotCls = useChampagne
                  ? "bg-champagne-bright/15 text-champagne-bright ring-champagne-bright/30"
                  : "bg-moss-bright/15 text-moss-bright ring-moss-bright/30";
                const labelCls = useChampagne
                  ? "text-champagne-bright"
                  : "text-moss-bright";
                return (
                  <div
                    key={s.week}
                    className="relative flex-1 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:p-8"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ${dotCls}`}
                      >
                        {i + 1}
                      </span>
                      <p
                        className={`font-mono text-[11px] font-semibold uppercase tracking-crest ${labelCls}`}
                      >
                        {s.week}
                      </p>
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-semibold leading-[1.25] text-bone">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.6] text-bone/60">
                      {s.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="champagne" className="mb-3">
                See it on your data
              </Eyebrow>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                30 minutes. Founders run the call.
              </h2>
              <p className="mt-6 text-lg leading-[1.6] text-bone/60">
                Send us a CSV from Aspire, LMN, Jobber, Service Autopilot, Real
                Green, or a Google Sheet — anything. We will load it before the
                call and walk you through the stalled quotes, missed upsells,
                and referral opportunities sitting in your own book of
                business. No slides. No sales script. Your data, your dollars.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                <a
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-lg bg-lime-bright px-6 py-3 text-sm font-semibold text-forest-deep transition-colors hover:bg-lime-bright/90"
                >
                  Book a 30-minute demo
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-lg border border-champagne-bright/40 px-6 py-3 text-sm font-semibold text-champagne-bright transition-colors hover:bg-champagne/10"
                >
                  Or see pricing →
                </a>
                <a
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-lg border border-moss/40 px-6 py-3 text-sm font-semibold text-moss-bright transition-colors hover:bg-moss/10"
                >
                  Browse all 33 engines →
                </a>
              </div>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
