export type Competitor = {
  slug: string;
  name: string;
  tier: 1 | 2 | 3;
  killHeadline: string;
  whySwitch: string[]; // 3 bullets
  weaknessKeywords: string[]; // for matrix
  migrationDays: number;
};

export const COMPETITORS: Competitor[] = [
  // ─── Tier 1: Direct competitors ───
  {
    slug: "aspire",
    name: "Aspire Software",
    tier: 1,
    killHeadline:
      "Aspire takes 6 months to deploy. GladiusTurf compounds revenue in 14 days.",
    whySwitch: [
      "33 engines live day one vs. modules that unlock over 6 months",
      "Per-crew pricing ($397–$2,997) replaces per-revenue extortion (102% YoY hikes documented)",
      "Native AI — Quote Intercept, Ghost Recovery, Upsell Whisperer — not a 2027 roadmap",
    ],
    weaknessKeywords: [
      "6-month onboarding",
      "opaque revenue-tied pricing",
      "predatory billing",
      "dense mobile UI",
      "ServiceTitan-owned",
    ],
    migrationDays: 30,
  },
  {
    slug: "lmn",
    name: "LMN (Landscape Management Network)",
    tier: 1,
    killHeadline: "LMN built the budgeting tool. GladiusTurf builds the revenue.",
    whySwitch: [
      "Crew app that doesn't delete job cards (offline-first PWA, 4.8★ vs LMN's 2.7★)",
      "33 engines vs. estimating + a basic CRM",
      "Native AI (Cadence, Ghost Recovery, Upsell Whisperer) where LMN has none",
    ],
    weaknessKeywords: [
      "buggy crew app",
      "deletes job cards",
      "weak CRM",
      "no AI",
      "2.7-star mobile",
    ],
    migrationDays: 14,
  },
  {
    slug: "service-autopilot",
    name: "Service Autopilot",
    tier: 1,
    killHeadline: "Service Autopilot punishes growth. GladiusTurf rewards it.",
    whySwitch: [
      "Per-crew pricing — your seasonal hires are free (no per-user math)",
      "Native Claude AI in 19 of 33 engines, not 'Genius' marketing copy",
      "Real customer support — direct founder line on Enterprise tier",
    ],
    weaknessKeywords: [
      "per-user pricing",
      "weak support",
      "tiered pricing removed",
      "expensive upgrades",
      "PE-owned",
    ],
    migrationDays: 10,
  },
  {
    slug: "jobber",
    name: "Jobber",
    tier: 1,
    killHeadline: "Jobber serves every trade. GladiusTurf serves yours.",
    whySwitch: [
      "Landscape-native: Weather Pivot, Safety Shield, NOAA cadences, applicator compliance",
      "Offline-first PWA — works in dead zones where Jobber's app dies",
      "Per-crew pricing — no surprise $589 bill when your team grew",
    ],
    weaknessKeywords: [
      "no offline mode",
      "per-user fees compound",
      "QuickBooks sync drops line items",
      "no crew profitability",
      "generic home services",
    ],
    migrationDays: 7,
  },
  {
    slug: "realgreen",
    name: "RealGreen / Service Assistant",
    tier: 1,
    killHeadline: "RealGreen got bought. GladiusTurf got built.",
    whySwitch: [
      "No payment-processor lock-in — Stripe Connect, your money, your terms",
      "Native compliance (Safety Shield) — OSHA + state fines avoided in real time",
      "App that doesn't freeze on mow day (no 5–15 logoffs daily)",
    ],
    weaknessKeywords: [
      "annual price hikes",
      "payment processor lock-in",
      "app freezes",
      "Workwave decay",
      "1-in-10 support competence",
    ],
    migrationDays: 14,
  },
  {
    slug: "arborgold",
    name: "Arborgold",
    tier: 1,
    killHeadline: "Arborgold loses your invoices to spam. We don't.",
    whySwitch: [
      "Verified-domain email stack — invoices land in inbox, not spam folder",
      "Mobile-first PWA — full estimating, invoicing, deposits in the field",
      "33 engines for $397/crew vs. Arborgold's $119+/mo with 3.1★ Capterra rating",
    ],
    weaknessKeywords: [
      "email deliverability broken",
      "3.1-star Capterra",
      "buggy updates",
      "no mobile invoicing",
      "highest-cost niche",
    ],
    migrationDays: 10,
  },
  {
    slug: "singleops",
    name: "SingleOps",
    tier: 1,
    killHeadline: "SingleOps charges $200/user. We charge $0/user, $397/crew.",
    whySwitch: [
      "Per-crew pricing kills $200/user math at 5+ crews",
      "PWA that doesn't crash or drain battery while creating estimates",
      "Stripe Connect — payments process fast, not 'slow'",
    ],
    weaknessKeywords: [
      "field app crashes",
      "battery drain",
      "data loss",
      "$200/user pricing",
      "slow payments",
    ],
    migrationDays: 10,
  },
  {
    slug: "hindsite",
    name: "HindSite Software",
    tier: 1,
    killHeadline: "HindSite can't take payment in the field. We do — tap to pay.",
    whySwitch: [
      "Stripe Connect tap-to-pay built into the Field Crew App",
      "33 engines vs. an irrigation legacy with missing modern features",
      "Real-time support, not 'charges a fee for help'",
    ],
    weaknessKeywords: [
      "no in-app payment",
      "buggy updates",
      "support fee",
      "missing features",
      "irrigation-only legacy",
    ],
    migrationDays: 7,
  },
  {
    slug: "clipitc",
    name: "CLIPitc / CLIP",
    tier: 1,
    killHeadline: "CLIP forced you into their cloud. We give you a real one.",
    whySwitch: [
      "Cloud-native from day one — no surprise migrations, no $530 penalties",
      "Modern PWA your 20-year-veteran office manager will actually use",
      "33 engines vs. legacy 'rounds' workflow",
    ],
    weaknessKeywords: [
      "forced cloud migration",
      "cancelled features",
      "penalty charges",
      "buggy updates",
      "office staff refuses",
    ],
    migrationDays: 10,
  },

  // ─── Tier 2: Adjacent verticals ───
  {
    slug: "servicetitan",
    name: "ServiceTitan",
    tier: 2,
    killHeadline:
      "ServiceTitan charges $46,170 to leave. We charge $0 to start.",
    whySwitch: [
      "No early termination fees, no $5K–$50K implementation",
      "Built for landscape — not HVAC bolted onto green",
      "Onboard in 14 days, not 6–12 months",
    ],
    weaknessKeywords: [
      "$46K early termination",
      "6–12 month onboarding",
      "$245–$398/tech",
      "data export needs lawyers",
      "not optimized for <3 techs",
    ],
    migrationDays: 30,
  },
  {
    slug: "fieldroutes",
    name: "FieldRoutes",
    tier: 2,
    killHeadline: "FieldRoutes does pest. GladiusTurf does turf + pest in one.",
    whySwitch: [
      "Safety Shield handles pest + lawn applicator licenses + drift logs natively",
      "One platform for crossover shops (lawn + pest)",
      "Stripe Connect, no quote-required pricing games",
    ],
    weaknessKeywords: [
      "single-vertical lock",
      "multi-service confusion",
      "weak support",
      "ServiceTitan-owned",
      "quote-only pricing",
    ],
    migrationDays: 14,
  },
  {
    slug: "workwave",
    name: "Workwave (PestPac)",
    tier: 2,
    killHeadline: "Workwave got rolled up. We answer the phone.",
    whySwitch: [
      "Founder-led — direct line to the founder on Enterprise",
      "No 18-month linked-document bugs, no card-on-file lock-in",
      "Modern stack — no PE-driven price hikes baked into roadmap",
    ],
    weaknessKeywords: [
      "PE rollup decay",
      "BBB complaints",
      "every module costs extra",
      "year contract lock-in",
      "linked-document bugs",
    ],
    migrationDays: 14,
  },
  {
    slug: "housecall-pro",
    name: "Housecall Pro",
    tier: 2,
    killHeadline:
      "Housecall Pro nickel-and-dimes you. We give you all 33 engines.",
    whySwitch: [
      "All 33 engines included — no add-on creep, no surprise upgrades",
      "Landscape-native rhythms (NOAA, applicator, seasonal) Housecall doesn't get",
      "Per-crew pricing — Housecall MAX is $299 + $35/user before add-ons",
    ],
    weaknessKeywords: [
      "add-on cost creep",
      "feature gating",
      "3.2/5 Trustpilot",
      "generic home services",
      "mobile bugs",
    ],
    migrationDays: 7,
  },

  // ─── Tier 3: Point solutions ───
  {
    slug: "method-crm",
    name: "Method:CRM",
    tier: 3,
    killHeadline: "Method:CRM stores customers. GladiusTurf compounds them.",
    whySwitch: [
      "33 revenue engines vs. a QuickBooks-bolted CRM",
      "Landscape-native (weather, chemical, seasonal) — Method is generic",
      "$397/crew vs. $28/user that scales painfully",
    ],
    weaknessKeywords: [
      "QuickBooks-only",
      "steep learning curve",
      "weak support",
      "no landscape rhythm",
      "no AI",
    ],
    migrationDays: 7,
  },
  {
    slug: "quickbooks",
    name: "QuickBooks + Spreadsheets",
    tier: 3,
    killHeadline: "Stop running your $1.2M shop on a spreadsheet.",
    whySwitch: [
      "Ghost Recovery alone (+51% on dead leads) pays for the platform in week 1",
      "Site Memory replaces every sticky-note, group-text, and post-it",
      "33 engines, $397/crew — costs less than the time you waste reconciling",
    ],
    weaknessKeywords: [
      "manual reconciliation",
      "no automation",
      "no AI",
      "lost quotes",
      "no revenue compounding",
    ],
    migrationDays: 7,
  },
];
