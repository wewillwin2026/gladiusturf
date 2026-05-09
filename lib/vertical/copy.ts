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

export type WaitlistFAQ = { q: string; a: string };

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
  /** Optional industry-specific FAQ. When present, renders an accordion +
   *  emits FAQPage JSON-LD on the page (free SEO win — Google snippets
   *  pull from this). 4-5 entries per vertical recommended. */
  faq?: WaitlistFAQ[];
};

export const WAITLIST_COPY: Record<Exclude<VerticalSlug, "lighting">, WaitlistCopy> = {
  pool: {
    faq: [
      {
        q: "What about Skimmer? Isn't that the standard for pool service?",
        a: "Skimmer is the standard for pure-play pool routes. If pool is the only thing you do, Skimmer works — and we're not asking you to switch. We're built for the multi-trade FL shop that does pools AND landscape AND lighting on the same property. Skimmer doesn't follow you off the pool deck. We do.",
      },
      {
        q: "You haven't shipped Pool yet — why should I trust the waitlist?",
        a: "Because the platform underneath ships every week, and you can see it. Lighting is live with a real Sarasota operator running it daily. The pool engines bolt onto the same workspace, customer table, billing layer, and AI primitives — we're adding pool-specific records (chemistry, equipment serials, CPO licensing), not building a CRM from scratch.",
      },
      {
        q: "How does FL 5B-9 chemical applicator licensing work in your tool?",
        a: "Every chemical application logs the operator's 5B-9 number, the EPA reg number of the product, the rate, the square footage treated, the time, and the weather. That's what FL Department of Agriculture audits. CPO and 5B-9 renewals get 90/60/30-day alerts before the state fines you.",
      },
      {
        q: "Will it talk to Pentair IntelliChem and Hayward AquaRite?",
        a: "Equipment serial linkage ships in the v1 pool surface. Photo-attached scans for service history, replacement reminders pulled off the manufacturer's expected lifespan curves. Direct API integrations with Pentair / Hayward come in v1.5 once we're live with 3+ FL pool ops.",
      },
    ],
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
    faq: [
      {
        q: "BSI Online already exists — what's different?",
        a: "BSI Online is a portal — a website to log into and submit one assembly at a time. We're a workflow. Auto-generate annual filings for every assembly under contract, batch-submit to the right county portal (BSI / Aqua / JEA / Sarasota / Pinellas / Hillsborough / OUC / Miami-Dade WASD / GRU / Tampa Bay Water), photo-attach test results, and route the test tag back to the customer's record. The portal isn't the gap. The 80 hours of admin between portals is the gap.",
      },
      {
        q: "How is this different from ServiceTitan or Aspire?",
        a: "ServiceTitan starts at $250-500/tech/month with a 6-12 month onboarding — built for $5M+ HVAC enterprises. Aspire publicly disqualifies you under $1M revenue. The 1-10 truck FL irrigation contractor is structurally underserved — and per-utility backflow is the workflow neither will build because it's a Florida-specific moat.",
      },
      {
        q: "You haven't built it. Why should I sign up?",
        a: "Because the platform underneath ships every week, and you can see it. Lighting is live with a real operator. Irrigation tables (assemblies, controllers, schedules) are already in the schema. Onboarding your first 50 customers is the same CSV importer + customer detail pages we're using on lighting today.",
      },
      {
        q: "Does it talk to Hunter Hydrawise, Rain Bird LNK/IQ4, and Rachio?",
        a: "Cross-brand controller fleet view ships in the v1 irrigation surface — read access first (signal status, last-run history, faults), schedule push in v1.5 once we have a paying op willing to test. Manufacturer APIs are documented; the wire-up is real engineering, not vapor.",
      },
    ],
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
    faq: [
      {
        q: "What about LMN? Isn't that built for design-build?",
        a: "LMN is built around budgeting and a buggy crew app (2.7 stars on Google Play). Estimating is its strength. The 6 things you're doing AROUND the LMN estimate — phase scheduling, subcontractor handoff, lien-waiver tracking, design-to-install pull sheets, AIA draw billing, real job costing across burdens — that's where we live. You can keep LMN for budgeting and bolt us on top, or migrate fully when you're ready.",
      },
      {
        q: "You haven't shipped Landscape — why now?",
        a: "We're not shipping it now — Q1 2027 is the target. The waitlist is for design-build firms who want founder-direct setup and locked pilot pricing when it's ready. Lighting is the proof the platform works; landscape is the next vertical to graduate off the lighting foundation.",
      },
      {
        q: "How does the bilingual EN/ES handoff work?",
        a: "Customer-facing copy renders in the customer's preferred language. Crew-facing copy renders in the foreman's. Voice-note translation runs Spanish-to-English on the install crew's morning briefing so the homeowner's English notes from the designer arrive translated for the foreman, and the foreman's Spanish field notes arrive translated for the office.",
      },
      {
        q: "Will it handle AIA-style draw billing for high-end residential?",
        a: "Yes — deposit / mid-phase / final with G702/G703-style schedules. Lien waivers tracked alongside subcontractor payments. Build-it-and-bill-it shops doing $500K+ projects need this; the smaller landscape CRMs don't ship it because their customer doesn't ask.",
      },
    ],
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
    faq: [
      {
        q: "What about RealGreen? It's the lawn-care standard.",
        a: "RealGreen is the standard if you're OK with 1998-era UI at 2026-era pricing. The product was acquired by WorkWave in 2018 — pricing has gone up, the UI hasn't moved. Operators in the 1-10 truck residential segment are paying $400/month for software their techs can barely use on a phone. That's the gap.",
      },
      {
        q: "Are you replacing FieldRoutes too?",
        a: "FieldRoutes belongs to ServiceTitan / Roper Technologies / private equity now. Their pricing trajectory mirrors what happened to Aspire — predictable PE-driven hikes between renewals. We're per-crew not per-tech, capped 5% YoY in writing. Different math, different incentive.",
      },
      {
        q: "Why log every chemical application by EPA reg number?",
        a: "Because the FL Department of Agriculture audits commercial pesticide applicators. They want product, EPA reg number, rate per 1000 sq ft, area treated, applicator's 5B-9 license, weather at time of application, and the customer signature. Generic 'lawn treatment' notes won't survive an audit. We built the log to match the audit form, not the marketing brief.",
      },
      {
        q: "Lawn-care isn't shipped yet. What do I get on the waitlist?",
        a: "Founder-direct setup when it's ready (Q1 2027), locked pilot pricing for the first 5 ops in each metro, and the option to be a design partner — your real applications, your real routes, your real billing patterns drive what gets built first. Bright Lights got founder-direct setup for lighting in May 2026; you'd get the same for lawn-care.",
      },
    ],
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
    faq: [
      {
        q: "What about Arborgold? They've been in tree-care for decades.",
        a: "Arborgold's UI is straight out of 2008. Operators we've talked to keep it because of muscle memory and inertia, not because they love it. Climbers and ground crews who grew up on iPhones are losing patience with desktop-only flows and 3-click workflows that should be 1-click. We're betting the next generation of tree-care owners switch on UX alone.",
      },
      {
        q: "Why does ANSI A300 matter so much in your design?",
        a: "Because the price difference between a Class I structural prune and a Class III hazard-clean prune is 4x — and the liability if you don't document which class was bid is real. Generic CRMs treat 'tree trimming' as one line item. Real tree-care economics need DBH, crown class, prune class, and equipment access (bucket vs spider lift vs crane) priced separately or you bleed margin.",
      },
      {
        q: "Tree-care isn't shipped yet. Why the waitlist?",
        a: "Q2 2027 is the target. The waitlist puts you ahead of public launch and gets you founder-direct setup when it's ready. Lighting is live today — the platform underneath (customer records, scheduling, billing, audit chain, Trust Console) all extends to tree-care without rebuilding from scratch.",
      },
      {
        q: "How does the COI / CGL verification work?",
        a: "Per-crew per-job. Upload your CGL once with limits — when a takedown over a pool gets bid, the system flags if your $2M GL doesn't cover the property's required $5M. Property owner's COI requirements get stored as a constraint; bids that violate them surface a warning before they go out the door. One OSHA fall fatality + an inadequate COI ends the company — software has to know that.",
      },
    ],
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
    faq: [
      {
        q: "What about Aspire Snow? Doesn't that exist?",
        a: "Aspire Snow is the enterprise tier of an enterprise product. If you're a $20M+ commercial firm with a dedicated dispatcher, Aspire Snow works. The single-truck plow guy who runs 12 push contracts and salts 8 lots is using a notebook, a phone, and the NWS site refreshing every 30 minutes. We sit between — built for the 1-5 truck snow op the enterprise tier doesn't talk to.",
      },
      {
        q: "Snow ops fire at 2 AM. Does your dispatch hold up at that hour?",
        a: "Yes — that's exactly the design constraint. NWS data triggers the page when accumulation crosses your contract threshold. The on-call rotation auto-pages the next operator if the first doesn't acknowledge in 5 minutes. Salt allocation per site updates as bulk yards get drawn. The slip-and-fall log captures geotagged photos with timestamps a defense attorney will actually use.",
      },
      {
        q: "Why is the slip-and-fall log so prominent?",
        a: "Because one slip-and-fall lawsuit settled at $50K can wipe out a season's profit. Insurance carriers and defense attorneys both want timestamped, geotagged photo evidence that the lot was pushed and salted on a defensible cadence. Generic CRMs don't capture this; the spreadsheet shop captures it badly. It has to be one tap from the cab.",
      },
      {
        q: "Snow isn't shipped yet — when?",
        a: "Q3 2026 early access for FL — wait, no, snow doesn't happen in FL. Northeast and Midwest target. The waitlist puts you ahead of public launch and gets you founder-direct setup. Realistically: lighting is live in Sarasota now, snow ships when we have a Northeast operator willing to be the design partner.",
      },
    ],
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
    faq: [
      {
        q: "What about Aspire? Aren't they the commercial standard?",
        a: "Aspire is built for the $20M+ commercial firm with a finance department. The shop doing $3M-$15M running 40 HOA + retail + office contracts is patching FreshBooks + DocuSign + a shared Dropbox + Google Drive + a notebook of NTE thresholds. We're the layer that holds COIs, enforces NTEs, routes port-call work in 24 hours, and ships board-ready monthly reports.",
      },
      {
        q: "How does the NTE (not-to-exceed) routing actually work?",
        a: "Each contract has an NTE per port-call (e.g. $500 self-approve, anything over goes to GM approval). Field tech reports a tree-down or pipe-leak from the cab; system checks the contract NTE; if over, it routes to the GM (in-app + email + SMS) before the truck rolls. GM approves or counter-offers; tech proceeds. Every step audit-logged with timestamp + actor.",
      },
      {
        q: "Commercial isn't shipped yet. Q4 2026 is far away.",
        a: "It is. The waitlist is for portfolio operators who want the founder-direct setup when it ships — and who have COI/NTE/board-report patterns we can design against. We'd rather build the commercial workflows with 3 real portfolio operators than guess. If you're running 20+ contracts and willing to be a design partner, the conversation is 30 minutes with the founders.",
      },
      {
        q: "What about Yardbook or BOSS LM?",
        a: "Yardbook is free and built for solo lawn ops — different segment. BOSS LM is solid for the $1-3M commercial shop but the contract-management depth (auto-renewal, escalator clauses, exhibit-A versioning, COI tracking, NTE enforcement) isn't there. We're going deeper on the contract layer because that's where commercial operators actually leak revenue.",
      },
    ],
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
