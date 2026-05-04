/**
 * Vertical-specific copy for the 7 waitlist pages. Lifted verbatim from
 * ~/Downloads/gladius_lighting_prompt.md §"Vertical-Specific Copy".
 *
 * Every visible string for /pool, /irrigation, /landscape, /lawn-care,
 * /tree-care, /snow, /commercial lives here so iteration is one file.
 */

import type { VerticalSlug } from "./types";

export type WaitlistCopy = {
  /** SEO title — used as <title> and og:title. */
  title: string;
  /** Meta description (≤ 160 chars). */
  description: string;
  /** Hero headline. */
  h1: string;
  /** Hero subhead. */
  subhead: string;
  /** 4–6 bullets of what's being built. */
  whatsComing: string[];
  /** One-sentence positioning statement. */
  primaryPain: string;
  /** e.g. "Q3 2026 early access". */
  estimatedAvailability: string;
};

export const WAITLIST_COPY: Record<Exclude<VerticalSlug, "lighting">, WaitlistCopy> = {
  pool: {
    title: "Gladius Pool — Chemistry, routes, and revenue. One app.",
    description:
      "Built for pool pros who do more than skim — and the multi-trade shops Skimmer can't follow into landscape. Currently in private development.",
    h1: "Chemistry, routes, and revenue. One app. No spreadsheets.",
    subhead:
      "Built for pool pros who do more than skim — and the multi-trade shops Skimmer can't follow into landscape. Currently in private development with a select group of operators.",
    whatsComing: [
      "LSI / saturation index calculations",
      "Dosage tracking by chemical type and brand",
      "Equipment service history per pool",
      "Pump and filter replacement reminders",
      "Route density math built for pool service patterns",
      "Integration with Pentair and Hayward equipment IDs",
    ],
    primaryPain:
      "Skimmer doesn't follow you into landscape. Aspire doesn't follow you into pool. We're the operating system that does both.",
    estimatedAvailability: "Q3 2026 early access. Joining the waitlist puts you ahead of public launch.",
  },

  irrigation: {
    title: "Gladius Irrigation — Zone counts from satellite. Blowouts on autopilot.",
    description:
      "Built for irrigation operators tired of running clipboards in the truck and spreadsheets in the office. Currently in private development.",
    h1: "Zone counts from satellite. Blowouts on autopilot. Smart controllers, smart billing.",
    subhead:
      "Built for irrigation operators tired of running clipboards in the truck and spreadsheets in the office. Currently in private development.",
    whatsComing: [
      "Satellite zone-count estimation for new quotes",
      "Blowout season scheduling with weather-trigger dispatch",
      "Smart controller integration (Rain Bird, Hunter, Rachio)",
      "Winterization route batching",
      "Recurring service plans tied to zone count",
    ],
    primaryPain:
      "Real Green owns this category and charges enterprise prices for it. We're building the operator-friendly version.",
    estimatedAvailability: "Q4 2026 early access.",
  },

  landscape: {
    title: "Gladius Landscape — Design, build, and bill — without the seven-tool tax.",
    description:
      "Built for design-build firms doing $1M–$10M in revenue. Currently in private development.",
    h1: "Design, build, and bill — without the seven-tool tax.",
    subhead:
      "Built for design-build firms doing $1M–$10M in revenue. Currently in private development.",
    whatsComing: [
      "Tiered estimate templates with hardscape and softscape line items",
      "Multi-phase project scheduling",
      "Real job costing across labor, materials, and subcontractors",
      "Design-to-install handoff tracking",
      "Deposit and milestone billing",
    ],
    primaryPain:
      "Aspire is built for the $20M+ commercial firm. Jobber is built for the solo operator. We're building the version for the design-build shop in between.",
    estimatedAvailability: "Q1 2027 early access.",
  },

  "lawn-care": {
    title: "Gladius Lawn Care — Stop leaking revenue. Run the route, not the route guess.",
    description:
      "Built for residential lawn maintenance operators running 1–10 trucks. Currently in private development.",
    h1: "Stop leaking revenue. Run the route, not the route guess.",
    subhead:
      "Built for residential lawn maintenance operators running 1–10 trucks. Currently in private development.",
    whatsComing: [
      "Route density math",
      "Recurring billing",
      "Fertilization licensing alerts",
      "Chemical batch tracking",
      "Weather-pivot rescheduling",
      "Customer churn risk scoring",
    ],
    primaryPain:
      "Owner-operators are running seven apps that don't talk to each other. We're collapsing that into one.",
    estimatedAvailability: "Q1 2027 early access.",
  },

  "tree-care": {
    title: "Gladius Tree Care — Arborist work that actually pays.",
    description:
      "Built for tree-care operators tired of underbidding storm work. Currently in private development.",
    h1: "Arborist work that actually pays.",
    subhead:
      "Built for tree-care operators tired of underbidding storm work. Currently in private development.",
    whatsComing: [
      "Tree-by-tree job costing",
      "ISA-certified arborist scheduling",
      "Plant health care recurring contracts",
      "Equipment-specific pricing (bucket truck vs. spider lift vs. crane)",
      "Removal vs. trim vs. plant-health-care service routing",
    ],
    primaryPain:
      "Most CRMs treat tree care like lawn care. The economics are entirely different.",
    estimatedAvailability: "Q2 2027 early access.",
  },

  snow: {
    title: "Gladius Snow — Win the bid, run the storm, send the invoice.",
    description:
      "Built for snow operators in Northeast and Midwest markets. Currently in private development.",
    h1: "Win the bid, run the storm, send the invoice — before the plow stops moving.",
    subhead:
      "Built for snow operators in Northeast and Midwest markets. Currently in private development.",
    whatsComing: [
      "Per-event vs. seasonal contract math",
      "Weather-trigger dispatch",
      "Salt and brine inventory tracking",
      "Storm-window crew scheduling",
      "Push-vs-haul cost modeling",
    ],
    primaryPain:
      "Snow is feast-or-famine. The CRM has to handle both.",
    estimatedAvailability: "Q3 2026 early access.",
  },

  commercial: {
    title: "Gladius Commercial — Built for the contracts you spent five years winning.",
    description:
      "Built for HOA, multi-family, retail, and office property maintenance contracts. Currently in private development.",
    h1: "Built for the contracts you spent five years winning.",
    subhead:
      "Built for HOA, multi-family, retail, and office property maintenance contracts. Currently in private development.",
    whatsComing: [
      "Multi-property contract management",
      "Certificate of insurance tracking",
      "HOA board reporting",
      "Scope-of-work template library",
      "Tiered pricing for property portfolios",
    ],
    primaryPain:
      "Commercial is contract-heavy. The operator-friendly tools weren't built for it.",
    estimatedAvailability: "Q4 2026 early access.",
  },
};

export const YEARS_IN_BUSINESS = ["<1", "1-3", "4-7", "8-15", "15+"] as const;
export type YearsInBusiness = (typeof YEARS_IN_BUSINESS)[number];

export const CREWS = ["solo", "2-3", "4-10", "10+"] as const;
export type Crews = (typeof CREWS)[number];
