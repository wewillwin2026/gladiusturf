export type BooksModule = {
  slug: string;
  name: string;
  description: string;
  surface: "books" | "payroll" | "retention";
};

/**
 * Twelve modules covering the first-party accounting + payroll + retention
 * surface. Used by /books, /payroll, /retention marketing pages and as a
 * structured source-of-truth for the financial spine of GladiusTurf.
 */
export const BOOKS_MODULES: BooksModule[] = [
  // ─── Books surface ───
  {
    slug: "general-ledger",
    name: "General Ledger",
    description:
      "Real-time double-entry GL. Every paid invoice, every Stripe payout, every Surplus Yard sale, every fuel receipt — posted as a journal entry the moment it happens. No nightly batch. No CSV import. No CPA hand-off email at 11pm.",
    surface: "books",
  },
  {
    slug: "chart-of-accounts",
    name: "Landscape Chart of Accounts",
    description:
      "Pre-built for shops that mow, fert, install hardscape, and plow snow. Eight top-level sections (Service Revenue, Materials, Labor, Equipment, Subcontractors, Vehicle, Office, Other) with sub-accounts your CPA can extend without a developer.",
    surface: "books",
  },
  {
    slug: "expense-brain",
    name: "Expense Brain",
    description:
      "Snap a fuel receipt or a mulch invoice. Claude vision reads it, classifies the line items, matches it to the right job using Field Crew App GPS data, and posts the journal entry. 97% auto-categorized; the remaining 3% queue for a 15-minute weekly review.",
    surface: "books",
  },
  {
    slug: "service-line-pnl",
    name: "P&L by Service Line",
    description:
      "Mowing margin vs hardscape margin vs snow margin — separated automatically. Every dollar of revenue and cost is tagged with its service line so the owner can see, on a phone, which line of business is actually paying the bills.",
    surface: "books",
  },
  {
    slug: "balance-sheet",
    name: "Balance Sheet",
    description:
      "Audit-ready balance sheet on demand. Assets, liabilities, equity. Tied directly to the GL — no spreadsheet bridges, no quarterly reconciliation marathon. Export to PDF with a single click for the bank or the bonding agent.",
    surface: "books",
  },
  // ─── Payroll surface ───
  {
    slug: "gps-time-tracking",
    name: "GPS Time Tracking",
    description:
      "Hours come from the Field Crew App's GPS clock-in / clock-out — not paper time sheets and not the foreman's memory. Disputes end the day they start: the timestamp and the property polygon are right there in the app.",
    surface: "payroll",
  },
  {
    slug: "multi-state-tax",
    name: "Multi-state Tax Engine",
    description:
      "Federal + all 50 state tax tables, plus jurisdictional OT rules (CA daily-OT, NY weekly thresholds, prevailing-wage rates for municipal jobs). Updated quarterly. Audit-ready packets the moment a regulator emails.",
    surface: "payroll",
  },
  {
    slug: "1099-engine",
    name: "1099-NEC Engine",
    description:
      "Subcontractor TIN collection at the first job (no more January scramble). YTD payouts tracked per vendor. 1099-NEC packets prepped by January 15 — e-file directly to the IRS, mailed to vendors, archived in the Books vault.",
    surface: "payroll",
  },
  {
    slug: "direct-deposit",
    name: "Direct Deposit",
    description:
      "Stripe Connect-powered payouts. 1–2 business day landing for crews; same-day available for emergencies. Every paystub auto-generated, signed, and stored — viewable from the Field Crew App so the team never asks 'where's my check?'",
    surface: "payroll",
  },
  // ─── Retention surface ───
  {
    slug: "retention-radar",
    name: "Retention Radar",
    description:
      "Watches every customer for the six churn signals: payment delays, ToneRadar response decay, seasonal lapse, declining service revenue, complaint frequency, and silent gaps. Predicts churn 60 days out with a confidence score before the customer's cancel email.",
    surface: "retention",
  },
  {
    slug: "nrr-dashboard",
    name: "NRR Dashboard",
    description:
      "Net Revenue Retention by segment, by service line, by crew. Cohort survival curves you can defend in a board meeting. The single dashboard the owner opens on Monday morning before the operations huddle.",
    surface: "retention",
  },
  {
    slug: "ltv-ledger",
    name: "LTV Ledger",
    description:
      "Per-customer lifetime value computed from real revenue minus real cost (Job Costing feed). Payback period by acquisition source. Segment ROI: weekly mowing customers vs hardscape one-offs vs fert programs. The first time landscape ops have known what their customers are actually worth.",
    surface: "retention",
  },
];
