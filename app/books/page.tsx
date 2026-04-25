import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Coins,
  FileText,
  Receipt,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BOOKS_MODULES } from "@/content/books-modules";

export const metadata: Metadata = {
  title:
    "Books · First-party accounting built for landscape ops",
  description:
    "Real-time general ledger, AI-categorized expenses, P&L by service line, audit-ready balance sheet. Every paid invoice, every Stripe payout, every fuel receipt — one ledger, zero double-entry.",
};

type ChartSection = {
  number: string;
  name: string;
  description: string;
  examples: string[];
  accent: "moss" | "honey" | "champagne";
};

const CHART_OF_ACCOUNTS: ChartSection[] = [
  {
    number: "4000",
    name: "Service Revenue",
    description:
      "Every dollar your crew earns, broken out by service line so the owner sees which work is actually paying the bills.",
    examples: ["Mowing", "Fertilization", "Hardscape", "Snow & Ice", "Irrigation"],
    accent: "champagne",
  },
  {
    number: "5100",
    name: "Materials",
    description:
      "Sod, seed, mulch, fert, paver, stone, plant. Every receipt photographed in the field is matched to the job that consumed it.",
    examples: ["Sod & Seed", "Mulch", "Fertilizer", "Plants", "Pavers & Stone"],
    accent: "champagne",
  },
  {
    number: "5200",
    name: "Labor",
    description:
      "Crew wages flow in directly from Payroll — no double entry. Tagged by service line and by job for true margin reporting.",
    examples: ["Wages", "Payroll Taxes", "Workers' Comp", "Bonus & OT"],
    accent: "champagne",
  },
  {
    number: "5300",
    name: "Subcontractors",
    description:
      "Tree-removal crews, dumpster vendors, irrigation specialists. TINs collected at the first job; 1099-NEC issued by January 15.",
    examples: ["Tree Removal", "Specialty Plant", "Hauling", "Repair Crews"],
    accent: "moss",
  },
  {
    number: "6100",
    name: "Equipment",
    description:
      "Mowers, aerators, trailers, blowers. Capital purchases depreciate on a schedule; consumables expense in the month consumed.",
    examples: ["Mowers", "Hand Tools", "Trailers", "Repair & Maintenance"],
    accent: "champagne",
  },
  {
    number: "6200",
    name: "Vehicle & Fuel",
    description:
      "Per-vehicle mileage logs auto-generated from GPS. Fuel receipts photographed and matched to the truck that bought them.",
    examples: ["Fuel", "Insurance", "Mileage", "Tolls & Parking"],
    accent: "champagne",
  },
  {
    number: "6300",
    name: "Office & Admin",
    description:
      "Software, phone, marketing, professional fees. The boring overhead that quietly eats six points of margin.",
    examples: ["Software", "Marketing", "Insurance", "Professional Fees"],
    accent: "champagne",
  },
  {
    number: "9000",
    name: "Other",
    description:
      "The rest — interest income, gain on sale, owner draws, charitable contributions. Everything has a home; nothing lands in a 'misc' bucket.",
    examples: ["Interest", "Gain/Loss", "Owner Draws", "Charity"],
    accent: "champagne",
  },
];

type Report = {
  name: string;
  blurb: string;
  bullets: string[];
  icon: typeof FileText;
  accent: "moss" | "honey" | "champagne";
};

const REPORTS: Report[] = [
  {
    name: "P&L by Service Line",
    blurb:
      "Mowing margin vs hardscape margin vs snow margin — broken out automatically. Filter by crew, by month, by ZIP.",
    bullets: [
      "Drill-down from a service-line total to the underlying jobs",
      "Compare same-month-last-year on every row",
      "Export to PDF or hand to your CPA in QBO format",
    ],
    icon: BarChart3,
    accent: "champagne",
  },
  {
    name: "Balance Sheet",
    blurb:
      "Audit-ready balance sheet on demand. Assets, liabilities, equity — tied directly to the GL with zero reconciliation.",
    bullets: [
      "Current vs long-term breakouts ready for a banker",
      "AR aging buckets (0-30, 31-60, 61-90, 90+)",
      "Equipment depreciation schedule auto-maintained",
    ],
    icon: Wallet,
    accent: "champagne",
  },
  {
    name: "Cash Flow Statement",
    blurb:
      "Operating, investing, financing — the cash story your bonding agent and your bank actually want to see.",
    bullets: [
      "Indirect method by default; direct method on request",
      "Seasonal cash burn projected six weeks out",
      "Surplus Yard sales surfaced as a recurring cash source",
    ],
    icon: TrendingUp,
    accent: "moss",
  },
  {
    name: "1099 Prep Packet",
    blurb:
      "Every subcontractor's YTD payout, with TIN already collected. E-file directly or mail by January 15.",
    bullets: [
      "Auto-generated from the subcontractor cohort",
      "Mismatched TIN warnings before you e-file",
      "Past-year archives kept for the IRS' 4-year window",
    ],
    icon: Receipt,
    accent: "champagne",
  },
  {
    name: "Schedule C / Schedule E",
    blurb:
      "End-of-year tax summary in the format your accountant already lives in. No more April 8 panic.",
    bullets: [
      "Schedule C for sole props, Schedule E for rental property",
      "Auto-tagged personal vs business mileage",
      "Quarterly estimate reminders mailed to the owner",
    ],
    icon: Calculator,
    accent: "champagne",
  },
  {
    name: "Sales Tax Filing",
    blurb:
      "Sales tax calculated on every invoice by jurisdiction. Filing-ready packets per state, per county, per quarter.",
    bullets: [
      "Stripe Tax integrated for every county the crew touches",
      "Hardscape vs service taxability handled per state rules",
      "Voucher-style export for jurisdictions still on paper",
    ],
    icon: Coins,
    accent: "champagne",
  },
];

export default function BooksPage() {
  const booksModules = BOOKS_MODULES.filter((m) => m.surface === "books");

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-bone/10 bg-obsidian py-28 md:py-36">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(127,226,122,0.10),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <Eyebrow tone="champagne">Books · First-party</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h1 className="mt-4 max-w-5xl font-serif text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-bone md:text-7xl">
                QuickBooks integration is reactive.{" "}
                <span className="text-champagne-bright">
                  We built ours offensive.
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="mt-8 max-w-3xl space-y-5 text-lg text-bone/60 md:text-xl">
                <p>
                  Landscape shops have lived in QuickBooks hell for twenty
                  years. Every dollar double-entered: once in the dispatch
                  board, once in the books. Every receipt photographed twice:
                  once for the job folder, once for the bookkeeper. Every
                  reconciliation a Sunday-night drag while the rest of the
                  family eats dinner. The result is a P&amp;L that&apos;s six
                  weeks stale, a tax season that triggers a panic, and an owner
                  who couldn&apos;t tell you whether mowing is more profitable
                  than hardscape if you put a gun to his head.
                </p>
                <p>
                  Books ends it. A first-party general ledger, built for shops
                  that cut, fertilize, install, and plow. Every paid invoice,
                  every Stripe payout, every Surplus Yard sale, every fuel
                  receipt flows in the moment it happens — into a real chart
                  of accounts, with audit-ready trails, and a P&amp;L that&apos;s
                  current to the minute. Your CPA can still close the books in
                  QBO if she wants to. Most stop wanting to within the first
                  quarter.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <CtaButton href="/demo" variant="primary" size="lg">
                  See Books on a 30-min demo
                </CtaButton>
                <CtaButton href="#data-spine" variant="ghost-champagne" withArrow>
                  Read the architecture
                </CtaButton>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Pill tone="champagne">Engine 28 · Books</Pill>
                <Pill tone="champagne">Engine 29 · Expense Brain</Pill>
                <Pill tone="moss">Engine 31 · Tax Engine</Pill>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Data spine */}
        <section
          id="data-spine"
          className="border-b border-bone/10 bg-slate-deep py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">The data spine</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Every paid invoice. Every Surplus sale.{" "}
                  <span className="text-champagne-bright">Every fuel receipt.</span>{" "}
                  <span className="text-bone/55">One ledger.</span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  The reason shops live in QuickBooks hell is that the data
                  enters the system three days late, in a CSV, after a human
                  re-keys it from a paper invoice. Books inherits the events
                  from the platform underneath — the moment Stripe settles, the
                  moment the Surplus buyer pays, the moment the crew chief
                  photographs a fuel receipt — and writes the journal entry
                  before the human even thinks about it.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8 md:p-12">
                <svg
                  viewBox="0 0 1000 360"
                  className="w-full"
                  role="img"
                  aria-label="Data flow diagram showing inputs feeding the ledger and outputs flowing back out"
                >
                  <defs>
                    <linearGradient id="bk-flow-l" x1="0" x2="1">
                      <stop offset="0" stopColor="rgba(127,226,122,0)" />
                      <stop offset="1" stopColor="rgba(127,226,122,0.55)" />
                    </linearGradient>
                    <linearGradient id="bk-flow-r" x1="0" x2="1">
                      <stop offset="0" stopColor="rgba(245,191,89,0.55)" />
                      <stop offset="1" stopColor="rgba(245,191,89,0)" />
                    </linearGradient>
                  </defs>

                  {/* Inputs */}
                  {[
                    { y: 30, label: "Stripe payouts" },
                    { y: 90, label: "Client Portal invoices" },
                    { y: 150, label: "Surplus Yard sales" },
                    { y: 210, label: "Cadence late-pay recovery" },
                    { y: 270, label: "Receipt photos · vendor bills" },
                  ].map((row) => (
                    <g key={row.label}>
                      <rect
                        x="20"
                        y={row.y}
                        width="240"
                        height="44"
                        rx="10"
                        fill="rgba(127,226,122,0.06)"
                        stroke="rgba(127,226,122,0.32)"
                      />
                      <text
                        x="140"
                        y={row.y + 28}
                        textAnchor="middle"
                        fontFamily="ui-sans-serif, system-ui"
                        fontSize="14"
                        fill="rgba(244,243,238,0.85)"
                      >
                        {row.label}
                      </text>
                      <line
                        x1="262"
                        y1={row.y + 22}
                        x2="412"
                        y2="180"
                        stroke="url(#bk-flow-l)"
                        strokeWidth="1.4"
                      />
                    </g>
                  ))}

                  {/* Ledger core */}
                  <rect
                    x="412"
                    y="120"
                    width="176"
                    height="120"
                    rx="14"
                    fill="rgba(245,191,89,0.10)"
                    stroke="rgba(245,191,89,0.55)"
                  />
                  <text
                    x="500"
                    y="170"
                    textAnchor="middle"
                    fontFamily="ui-serif, Georgia"
                    fontSize="18"
                    fontWeight="600"
                    fill="rgba(244,243,238,0.95)"
                  >
                    GENERAL LEDGER
                  </text>
                  <text
                    x="500"
                    y="195"
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui"
                    fontSize="12"
                    fill="rgba(244,243,238,0.55)"
                  >
                    double-entry · audit-trail
                  </text>
                  <text
                    x="500"
                    y="215"
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui"
                    fontSize="12"
                    fill="rgba(244,243,238,0.55)"
                  >
                    posted in real time
                  </text>

                  {/* Outputs */}
                  {[
                    { y: 30, label: "P&L by service line" },
                    { y: 90, label: "Balance sheet" },
                    { y: 150, label: "Cash flow statement" },
                    { y: 210, label: "Sales tax filing" },
                    { y: 270, label: "1099-NEC packets" },
                  ].map((row) => (
                    <g key={row.label}>
                      <line
                        x1="588"
                        y1="180"
                        x2="738"
                        y2={row.y + 22}
                        stroke="url(#bk-flow-r)"
                        strokeWidth="1.4"
                      />
                      <rect
                        x="740"
                        y={row.y}
                        width="240"
                        height="44"
                        rx="10"
                        fill="rgba(245,191,89,0.06)"
                        stroke="rgba(245,191,89,0.32)"
                      />
                      <text
                        x="860"
                        y={row.y + 28}
                        textAnchor="middle"
                        fontFamily="ui-sans-serif, system-ui"
                        fontSize="14"
                        fill="rgba(244,243,238,0.85)"
                      >
                        {row.label}
                      </text>
                    </g>
                  ))}
                </svg>

                <div className="mt-10 grid gap-6 border-t border-bone/10 pt-8 text-sm text-bone/65 md:grid-cols-3">
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-moss-bright">
                      Inputs
                    </span>
                    <p className="mt-2">
                      Native event hooks, not nightly imports. Stripe webhooks,
                      Surplus Yard checkouts, Cadence collections, vendor bill
                      OCR — all post journal entries the moment they fire.
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne-bright">
                      Ledger
                    </span>
                    <p className="mt-2">
                      Double-entry GL with companyId-scoped row-level security.
                      Every entry is sourced from a domain event with a stable
                      ID. Reversing entries are a thirty-second action with a
                      reason field.
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne-bright">
                      Outputs
                    </span>
                    <p className="mt-2">
                      Reports are queries — not exports. Every dashboard
                      regenerates against the live GL the moment you load it.
                      No cached numbers, no &quot;as of last Tuesday.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Chart of accounts */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Chart of accounts</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Pre-built for the way{" "}
                  <span className="text-champagne-bright">landscape shops</span>{" "}
                  actually book a dollar.
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Eight top-level sections, ninety-six sub-accounts, and the
                  ability for your CPA to extend any of them without a
                  developer involved. The defaults reflect what we&apos;ve
                  learned watching real landscape books — the QBO templates
                  most shops inherit are a mess inside a week.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {CHART_OF_ACCOUNTS.map((s, i) => {
                const accentText =
                  s.accent === "honey"
                    ? "text-honey-bright"
                    : s.accent === "moss"
                      ? "text-moss-bright"
                      : "text-champagne-bright";
                const accentBorder =
                  s.accent === "honey"
                    ? "border-honey/30"
                    : s.accent === "moss"
                      ? "border-moss/30"
                      : "border-champagne/30";
                const accentDot =
                  s.accent === "honey"
                    ? "bg-honey-bright"
                    : s.accent === "moss"
                      ? "bg-moss-bright"
                      : "bg-champagne-bright";
                return (
                  <ScrollReveal key={s.number} delay={(i % 4) * 0.05}>
                    <article
                      className={`flex h-full flex-col rounded-2xl border ${accentBorder} bg-bone/[0.02] p-6`}
                    >
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase tracking-crest ${accentText}`}
                      >
                        {s.number}
                      </span>
                      <h3 className="mt-2 font-serif text-xl font-semibold tracking-tight text-bone">
                        {s.name}
                      </h3>
                      <p className="mt-3 text-[13px] leading-[1.65] text-bone/60">
                        {s.description}
                      </p>
                      <ul className="mt-5 space-y-1.5 border-t border-bone/10 pt-4 text-[12px] text-bone/70">
                        {s.examples.map((e) => (
                          <li key={e} className="flex items-center gap-2">
                            <span className={`h-1 w-1 rounded-full ${accentDot}`} />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI expense categorization */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Expense Brain · Engine 29</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Snap a receipt.{" "}
                  <span className="text-champagne-bright">
                    Categorized in three seconds.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  The four-hour weekly bookkeeping huddle becomes a fifteen-minute
                  review. Crew chief photographs a fuel receipt at the pump.
                  Expense Brain reads it (Claude vision), classifies the line
                  items, matches it to the right job using GPS data, and posts
                  the journal entry. The clerk only ever sees the 3% of edge
                  cases.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                {/* Mock UI */}
                <div className="rounded-2xl border border-bone/10 bg-obsidian/60 p-6 shadow-pop md:p-8">
                  <div className="flex items-center gap-3 border-b border-bone/10 pb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    <div className="ml-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
                      Books · expense intake
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-[140px_1fr] gap-5">
                    {/* Receipt image stand-in */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-bone/15 bg-bone/[0.04]">
                      <div className="absolute inset-0 flex flex-col gap-1.5 p-3 font-mono text-[8px] leading-[1.3] text-bone/45">
                        <div className="font-bold text-bone/75">SHELL #4421</div>
                        <div>1287 OAK RIDGE PIKE</div>
                        <div>RALEIGH NC 27607</div>
                        <div className="my-1 h-px bg-bone/15" />
                        <div>04/24/26 · 07:14 AM</div>
                        <div>PUMP 03 · UNL</div>
                        <div className="mt-1.5 flex justify-between">
                          <span>14.220 GAL</span>
                          <span>3.299/G</span>
                        </div>
                        <div className="mt-1.5 flex justify-between text-bone/75">
                          <span>TOTAL</span>
                          <span>$46.91</span>
                        </div>
                        <div className="my-1 h-px bg-bone/15" />
                        <div className="text-bone/35">VISA ****4118</div>
                        <div className="text-bone/35">APPROVED 78421</div>
                      </div>
                    </div>

                    {/* Parsed output */}
                    <div className="space-y-3 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                          Vendor
                        </span>
                        <span className="text-bone/85">Shell #4421</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                          Amount
                        </span>
                        <span className="text-bone/85">$46.91</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                          Account
                        </span>
                        <span className="rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 font-mono text-[10px] text-moss-bright">
                          6210 · Vehicle Fuel
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                          Vehicle
                        </span>
                        <span className="text-bone/85">Truck-04 (F-250)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                          Job
                        </span>
                        <span className="text-bone/85">
                          MOW-1882 · Henderson Property
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-bone/40">
                          Confidence
                        </span>
                        <span className="rounded-full border border-honey/30 bg-honey/5 px-2 py-0.5 font-mono text-[10px] text-honey-bright">
                          98.4%
                        </span>
                      </div>
                      <div className="mt-3 rounded-lg border border-bone/10 bg-bone/[0.03] p-3 font-mono text-[10px] text-bone/55">
                        DR · 6210 Vehicle Fuel ........ $46.91
                        <br />
                        CR · 1010 Cash · Operating ... $46.91
                        <br />
                        <span className="text-moss-bright">
                          ✓ Posted to GL · 2.7s after capture
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      h: "Reads the photo",
                      b: "Claude vision parses vendor, total, line items, date, payment method. Works on crumpled, blurry, or partially-folded receipts the way real ones arrive.",
                    },
                    {
                      h: "Matches the job",
                      b: "Cross-references GPS clock-ins from the Field Crew App. Knows the truck was at the Henderson property at 7:14 AM — so the fuel purchase ten minutes earlier on the route gets matched to that job's cost.",
                    },
                    {
                      h: "Posts the entry",
                      b: "Writes a double-entry journal posting in three seconds. The clerk reviews only the 3% of receipts where confidence dropped below 90% — the four-hour huddle becomes a fifteen-minute scan.",
                    },
                  ].map((row, i) => (
                    <div
                      key={row.h}
                      className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-honey/30 bg-honey/5 font-mono text-[11px] font-semibold text-honey-bright">
                          {i + 1}
                        </span>
                        <h3 className="font-serif text-xl font-semibold tracking-tight text-bone">
                          {row.h}
                        </h3>
                      </div>
                      <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                        {row.b}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Reports & exports */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Reports &amp; exports</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Every report your CPA wants.{" "}
                  <span className="text-champagne-bright">Live, not stale.</span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Reports are queries against the GL — not exports prepared
                  monthly by a clerk. Every dashboard regenerates against the
                  live ledger the moment you load it. The number on the screen
                  is the number, today.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {REPORTS.map((r, i) => {
                const accentText =
                  r.accent === "honey"
                    ? "text-honey-bright"
                    : r.accent === "moss"
                      ? "text-moss-bright"
                      : "text-champagne-bright";
                const accentBorder =
                  r.accent === "honey"
                    ? "border-honey/30"
                    : r.accent === "moss"
                      ? "border-moss/30"
                      : "border-champagne/30";
                const accentDot =
                  r.accent === "honey"
                    ? "bg-honey-bright"
                    : r.accent === "moss"
                      ? "bg-moss-bright"
                      : "bg-champagne-bright";
                const Icon = r.icon;
                return (
                  <ScrollReveal key={r.name} delay={(i % 3) * 0.05}>
                    <article
                      className={`flex h-full flex-col rounded-2xl border ${accentBorder} bg-bone/[0.02] p-7`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentBorder} bg-bone/[0.03] ${accentText}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-bone">
                        {r.name}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                        {r.blurb}
                      </p>
                      <ul className="mt-5 space-y-2 border-t border-bone/10 pt-4 text-[12.5px] text-bone/70">
                        {r.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1 w-1 flex-none rounded-full ${accentDot}`}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Audit trail */}
        <section className="border-b border-bone/10 bg-slate-deep py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <ScrollReveal>
                <div>
                  <Eyebrow tone="champagne">Audit trail</Eyebrow>
                  <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                    Every entry sourced.{" "}
                    <span className="text-champagne-bright">
                      Every entry auditable.
                    </span>
                  </h2>
                  <p className="mt-5 text-lg text-bone/60">
                    Every journal entry carries a stable ID linking it back to
                    the domain event that created it — the Stripe charge, the
                    Surplus Yard checkout, the receipt photo, the manual
                    correction. Click any line in any report and trace it to
                    the source. The auditor calls; you have the answer in two
                    clicks.
                  </p>
                  <ul className="mt-8 space-y-3 text-[14px] text-bone/70">
                    {[
                      "Reversing entries require a reason field — the why is part of the record",
                      "Soft-delete on every row · nothing is ever truly removed",
                      "Period locks per fiscal quarter · prior periods are read-only by default",
                      "User-level audit logs · who changed what, when, from which IP",
                      "Seven-year cold-storage retention by default",
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <Shield className="mt-0.5 h-4 w-4 flex-none text-champagne-bright" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl border border-bone/10 bg-obsidian/60 p-6 shadow-pop md:p-8">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/45">
                    Audit log · MOW-1882
                  </div>
                  <ol className="mt-5 space-y-4 border-l border-bone/10 pl-5 font-mono text-[12px]">
                    {[
                      {
                        t: "07:14 AM",
                        c: "Fuel receipt photographed · crew_id=04 · Truck-04",
                        tone: "champagne" as const,
                      },
                      {
                        t: "07:14:02",
                        c: "Expense Brain parsed · Shell #4421 · $46.91 · 98.4%",
                        tone: "champagne" as const,
                      },
                      {
                        t: "07:14:03",
                        c: "JE-44218 posted · DR 6210 · CR 1010 · job=MOW-1882",
                        tone: "moss" as const,
                      },
                      {
                        t: "11:42 AM",
                        c: "Job-cost rollup updated · Henderson margin=37.4%",
                        tone: "champagne" as const,
                      },
                      {
                        t: "Apr 30",
                        c: "Period close · Q2-2026 GL frozen · approver=R.Gamon",
                        tone: "champagne" as const,
                      },
                    ].map((row) => {
                      const dot =
                        row.tone === "moss"
                          ? "bg-moss-bright"
                          : "bg-champagne-bright";
                      const text =
                        row.tone === "moss"
                          ? "text-moss-bright/90"
                          : "text-champagne-bright/90";
                      return (
                        <li key={row.t} className="relative">
                          <span
                            className={`absolute -left-[26px] top-1.5 h-2 w-2 rounded-full ${dot}`}
                          />
                          <div className="text-bone/45">{row.t}</div>
                          <div className={`mt-0.5 ${text}`}>{row.c}</div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Modules grid (from books-modules.ts, books surface) */}
        <section className="border-b border-bone/10 bg-obsidian py-28">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-3xl">
                <Eyebrow tone="champagne">Books modules</Eyebrow>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
                  Five modules.{" "}
                  <span className="text-champagne-bright">One ledger.</span>
                </h2>
                <p className="mt-5 text-lg text-bone/60">
                  Books ships as one engine, but the surface is broken into
                  modules so the team running the books can specialize without
                  duplicating data.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {booksModules.map((m, i) => (
                <ScrollReveal key={m.slug} delay={(i % 3) * 0.05}>
                  <article className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
                    <h3 className="font-serif text-xl font-semibold tracking-tight text-bone">
                      {m.name}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.65] text-bone/65">
                      {m.description}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.2}>
              <div className="mt-12 text-center">
                <Link
                  href="/payroll"
                  className="inline-flex items-center gap-1.5 text-sm text-lime-bright transition-colors hover:text-lime"
                >
                  See Payroll · GPS-verified hours
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
