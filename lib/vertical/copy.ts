/**
 * Vertical-specific copy for the 7 waitlist pages. Rewritten 2026-05-09
 * per the founders' board memo: trade-grade verbs, named competitors,
 * specific regulators / part numbers / EPA reg numbers, no SaaS marketing
 * abstractions. Each block is camera-ready paste — keep this as the single
 * source of truth and don't drift.
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
    title: "Gladius Pool — LSI math, route density, and Skimmer's gap",
    description:
      "For pool pros who also do landscape, irrigation, or lighting. We track LSI, Pentair/Hayward serials, and CPO renewals — the parts Skimmer skips.",
    h1: "Test the pool, balance the chemistry, bill before the gate closes.",
    subhead:
      "Skimmer is built for the pure-play pool route. We're built for the multi-trade Florida shop that does pools, landscape, and lighting on the same Tuesday.",
    whatsComing: [
      "LSI / Langelier saturation calc with Pentair IntelliChem and Hayward AquaRite serial linkage",
      "Per-pool chemical log — chlorine, cyanuric acid, calcium hardness — with state-required pesticide application records",
      "CPO and Florida 5B-9 chemical applicator license tracker, 90/60/30 day renewal alerts",
      "Equipment service history per pool — pump, filter, salt cell, heater — with photo-attached serial scans",
      "Multi-trade route density: pool stop chained to a landscape stop on the same property without two visit fees",
      "Bilingual EN/ES tech app, glove-friendly, sunlight-readable on a Galaxy A-series in 95°F",
    ],
    primaryPain:
      "Skimmer doesn't follow you into landscape. Aspire doesn't follow you into pool. The shop running both gets to pick the spreadsheet — or pick us.",
    estimatedAvailability:
      "Q3 2026 early access. First 5 FL multi-trade shops get founder-direct setup.",
  },

  irrigation: {
    title: "Gladius Irrigation — Backflow, BSI Online, and 600 spring startups",
    description:
      "For 1-10 truck FL irrigation shops. Per-utility backflow filing for 67 counties, Hunter/Rain Bird/Hydrawise in one map, spring startup mass-route mode.",
    h1: "Backflow filed. Spring startups batched. Controllers in one map.",
    subhead:
      "BSI Online won't bulk-submit. Aspire won't take you under $1M. We auto-file backflow to JEA, Pinellas, Hillsborough, OUC, and Miami-Dade WASD — and push schedules to Hunter Hydrawise, Rain Bird IQ4, and Rachio in the same view.",
    whatsComing: [
      "Backflow Compliance Autopilot — per-utility templates for BSI Online, Aqua Backflow, JEA, Sarasota County, Pinellas, Hillsborough, OUC, Miami-Dade WASD, GRU, Tampa Bay Water",
      "Spring Startup Mass-Route Mode — bulk-batch 200-800 startups into a 4-week window, one-click rain-day push",
      "Cross-brand controller fleet view — Hunter Hydrawise, Rain Bird LNK/IQ4, Rachio, Hydrawise HC — color-coded by signal status",
      "FL watering restriction auto-programmer — derives allowed days from customer address, pushes the schedule to their controller",
      "Snowbird-aware customer record — auto-suspends on departure, summer-monitor as a paid recurring product",
      "DBPR CILB license + CEU tracker, hurricane shutoff/restart playbook with insurance-ready PDF",
    ],
    primaryPain:
      "BSI Online is a portal, not a workflow. ServiceTitan starts at $250/tech/month with a 6-month onboarding. The 1-10 truck FL irrigation shop is structurally underserved — and the per-utility backflow workflow is the moat nobody else will build.",
    estimatedAvailability:
      "Q3 2026 early access. First 5 FL operators get founder-direct setup and locked pilot pricing.",
  },

  landscape: {
    title: "Gladius Landscape — Design, build, bill, without the 7-tool tax",
    description:
      "For $1M-$10M design-build firms stuck between Jobber and Aspire. Blueprint markup, phase scheduling, real job costing on hardscape and softscape.",
    h1: "Bid the design. Build the phase. Close the change order.",
    subhead:
      "Aspire publicly disqualifies you under $1M. Jobber tops out at the solo mower. The design-build shop in between is running LMN, QuickBooks, Asana, and a notebook — we're collapsing that into one workspace.",
    whatsComing: [
      "Blueprint markup with hardscape/softscape line items priced per-square-foot, per-yard, per-pallet",
      "Multi-phase project scheduling — demo, grade, hardscape, plant, irrigation, lighting — with subcontractor handoff and lien-waiver tracking",
      "Real job costing across labor burdens, plant material shrinkage, and dump fees — by phase, not by month",
      "Deposit / mid-phase / final billing with AIA-style draw schedules for higher-end residential",
      "Crew-language field app — bilingual EN/ES, voice-note translation for a Spanish-speaking foreman briefing an English homeowner",
      "Design-to-install handoff — the designer's plant list becomes the install crew's pull sheet, no re-keying",
    ],
    primaryPain:
      "Aspire is built for the $20M+ commercial firm. Jobber is built for the solo operator. We're building the version for the $2M design-build shop that bids in CAD, installs in Spanish, and bills like a contractor.",
    estimatedAvailability: "Q1 2027 early access.",
  },

  "lawn-care": {
    title: "Gladius Lawn Care — Apps, routes, and the EPA reg number",
    description:
      "For 1-10 truck residential lawn ops sick of RealGreen and FieldRoutes. Per-application chemical logs, route density, FL 5B-9 license tracking.",
    h1: "Run the route. Log the application. Renew the license.",
    subhead:
      "RealGreen is 1998 software with 2026 pricing. FieldRoutes belongs to private equity. We're tracking your MSMA, Bifenthrin, and Prodiamine applications by EPA reg number, not by \"lawn treatment.\"",
    whatsComing: [
      "Per-application chemical log — product, EPA reg number, rate, square-footage treated, applicator name, weather at time of application",
      "FL 5B-9 commercial pesticide applicator license + CEU tracker, 90/60/30 day renewal alerts before the state fines you",
      "Route density math that respects gate codes, dog notes, and \"skip if rained in last 24 hrs\"",
      "Recurring billing with prepay-discount handling and the 7-app/8-app/round program model RealGreen botches",
      "Customer churn risk score — based on cancellation pattern, last review, and weather-cancel history",
      "Bilingual EN/ES tech app, offline-first for the back of a Stihl-loaded F-150 with no signal",
    ],
    primaryPain:
      "RealGreen looks like Windows 95. Jobber doesn't track an EPA reg number. The 1-10 truck residential shop is paying $400/month for either the dinosaur or the toy — there is no third option.",
    estimatedAvailability: "Q1 2027 early access.",
  },

  "tree-care": {
    title: "Gladius Tree Care — ANSI A300, climbers, and crane day",
    description:
      "For tree-care ops tired of underbidding storm work. Per-tree job costing, ISA-cert tracking, bucket vs spider lift vs crane pricing — Arborgold's gap.",
    h1: "Bid the tree, not the property. Close before the crane lands.",
    subhead:
      "Arborgold's UI is 2008. ServiceTitan doesn't know what a spider lift costs per hour. We're pricing per-tree by DBH, ANSI A300 Part 1 prune class, and equipment access — the way a real climber bids it.",
    whatsComing: [
      "Per-tree job costing by DBH, height, ANSI A300 Part 1 prune class, and removal vs trim vs PHC",
      "Equipment-specific pricing — bucket truck, spider lift, crane day-rate with operator and rigging time built in",
      "ISA Certified Arborist + TCIA CTSP credential tracker, OSHA 1910.269 fall-protection cert renewal alerts",
      "Plant Health Care recurring contracts — soil injection, deep root fertilization, IPM rounds with EPA reg numbers logged",
      "COI / CGL insurance verification per crew per job — auto-flag when a $2M GL doesn't cover the takedown over a pool",
      "Storm-response triage queue — priority-route Plan members, photo-document for insurance adjusters in one tap",
    ],
    primaryPain:
      "Most CRMs treat tree care like lawn care. The economics are different — a single crane day clears more revenue than a month of mowing, and one OSHA fall fatality ends the company. Software has to know that.",
    estimatedAvailability: "Q2 2027 early access.",
  },

  snow: {
    title: "Gladius Snow — Push contracts, salt math, 2 AM dispatch",
    description:
      "For Northeast and Midwest snow ops. Per-event vs seasonal contract math, weather-trigger dispatch at 2 AM, salt allocation, slip-and-fall site logs.",
    h1: "Trigger the storm. Push the lot. Document the salt.",
    subhead:
      "Aspire Snow charges enterprise. The single-truck plow guy uses a notebook. We're sitting between — weather-trigger dispatch on NWS data, per-site salt allocation, and a slip-and-fall log a defense attorney would respect.",
    whatsComing: [
      "Per-event vs seasonal vs hybrid contract math — auto-bill the right model when 14 inches falls in February",
      "NWS weather-trigger dispatch — auto-page the on-call operator at 2 AM when accumulation crosses contract threshold",
      "Salt and brine allocation per site — track bulk yards drawn, ton-applied, and reorder before the supplier's 4 AM cutoff",
      "Slip-and-fall site log — geotagged push photos, salt application timestamp, signed driver log, photo-documented for litigation defense",
      "Crew dispatch with split routes — push crew, sidewalk crew, salt-only return — across a 14-hour storm window",
      "Push-vs-haul cost modeling for downtown lots where snow has to leave the property",
    ],
    primaryPain:
      "Snow is feast or famine. Six storms a year you bill 60% of revenue, the rest of the year you bill maintenance. Software built for steady recurring lawn ops drops the call at 2 AM — exactly when you need it.",
    estimatedAvailability: "Q3 2026 early access.",
  },

  commercial: {
    title: "Gladius Commercial — COIs, NTEs, and the 40-property GM",
    description:
      "For multi-property HOA, retail, and office contracts. COI auto-renewal, NTE threshold routing, port-call dispatch, board-ready monthly reporting.",
    h1: "Hold the COI. Hit the NTE. Send the board report.",
    subhead:
      "Aspire fits the $20M commercial firm. The $3M-$15M shop running 40 HOA and retail contracts is patching FreshBooks, DocuSign, and a shared Dropbox. We're the layer that holds COIs, enforces NTEs, and routes port-call work in 24 hours.",
    whatsComing: [
      "Multi-property contract management with auto-renewal, escalator clauses, and exhibit-A scope-of-work versioning",
      "Certificate of Insurance auto-tracker — flag COI / CGL / WC / auto expirations 30/60/90 days before the property manager does",
      "NTE (not-to-exceed) threshold routing — port-call work over $X auto-routes to GM approval before the truck rolls",
      "Board-ready monthly report PDF — service log, photos, financials, exception list — branded for HOA delivery",
      "Multi-location property GM portal — one login, 40 properties, exception view first",
      "Tiered pricing across portfolios with master-service-agreement parent + property-level child contracts",
    ],
    primaryPain:
      "Commercial is contract-heavy. The COI lapses, the contract terminates. The NTE blows, the property manager doesn't return your call. Operator-friendly tools weren't built for that — they assume you bill a homeowner, not a portfolio.",
    estimatedAvailability: "Q4 2026 early access.",
  },
};

export const YEARS_IN_BUSINESS = ["<1", "1-3", "4-7", "8-15", "15+"] as const;
export type YearsInBusiness = (typeof YEARS_IN_BUSINESS)[number];

export const CREWS = ["solo", "2-3", "4-10", "10+"] as const;
export type Crews = (typeof CREWS)[number];
