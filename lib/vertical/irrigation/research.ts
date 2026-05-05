/**
 * Irrigation OS field research — May 2026.
 *
 * Source: ~/Downloads/light fix.pdf (22-page operator-side research dump
 * across LawnSite, Rachio Community, Capterra/G2/SoftwareAdvice, BBB,
 * FL utility pages, Hindsite/FieldCentral marketing, ServiceTitan reviews,
 * Hunter Hydrawise / Rain Bird LNK / Rachio Pro contractor threads).
 *
 * This file is the canonical source of truth for the Irrigation vertical's
 * marketing copy + the eventual Irrigation OS build prompt. The waitlist
 * page at /irrigation reads selected wedges from here. When we ship the
 * Irrigation OS workspace per VERTICAL_TEMPLATE.md, this drives the
 * VerticalConfig (marketing.problem_cards, marketing.solution_cards,
 * faq, killer_subcategory, etc.).
 *
 * Confidence ratings from the research:
 *   - HIGH: top 5 wished-for features + wedges 1, 2, 3, 4, 6, 8
 *   - MEDIUM: wedges 9 (buried-valve mapping), 11 (voice quoting)
 *
 * The Florida-specific moat (per-utility backflow submission templates
 * for 67 FL counties + 30 municipal water utilities) is the strongest
 * competitive asset — Jobber/ServiceTitan structurally won't copy it.
 */

export type Wedge = {
  id: number;
  name: string;
  oneLine: string;
  complaint: string; // verbatim where possible
  feature: string;
  complexity: "low" | "low-medium" | "medium" | "medium-high" | "high";
  flSpecific: boolean;
  hardestToCopy: string;
  confidence: "high" | "medium";
};

export const WEDGES: Wedge[] = [
  {
    id: 1,
    name: "Backflow Compliance Autopilot",
    oneLine: "Talks to BSI Online, Aqua Backflow, JEA, Sarasota County, etc. automatically.",
    complaint:
      "Florida operators maintain side-spreadsheets of biennial assemblies, due dates, FDEP-required test forms, and per-utility submission addresses. No green-industry CRM does this. The closest tool, BSI Online, is a purveyor-side database — it doesn't run the contractor's business.",
    feature:
      "Asset record per backflow (make/model/serial, install date, fixed test due date), per-customer-address utility lookup, FDEP-compliant PDF generation, auto-submit to BSI Online / Aqua Backflow / JEA / Sarasota / Pinellas / Hillsborough / OUC / Miami-Dade WASD / GRU / Tampa Bay Water portals, route-builder that batches 'due in 60 days' assemblies into optimal half-day routes.",
    complexity: "medium",
    flSpecific: true,
    hardestToCopy:
      "Jobber, ServiceTitan — they would have to build per-utility submission templates for ~67 FL counties + 30+ municipal utilities. They won't.",
    confidence: "high",
  },
  {
    id: 2,
    name: "Spring Startup / Storm Surge Mass-Route Mode",
    oneLine: "Bulk-batch 200-800 startups into a 4-6 week window with one-click rain-day push.",
    complaint:
      "Hindsite testimonial: 'It used to take us three months to get through our startups. This year it took us only two.' LawnSite Jobber complaint: 'At that time they didn't have the ability to bulk edit the schedule. Say you had a rain day and you needed to move all the stops to another day. You had to do it one by one. Deal breaker.'",
    feature:
      "Map-based mass-batch scheduling: select 200 customers, set a 4-week window, system auto-generates daily routes by zip + truck + skill. One-click 'rain day push' to bump entire day +1 with auto-customer notification. Storm-mode pre-builds the post-storm route from existing Snowbird/Coastal/HOA flags.",
    complexity: "medium",
    flSpecific: false,
    hardestToCopy:
      "Jobber and Service Autopilot have proven they can't drag-drop or bulk-reschedule efficiently. FieldCentral has it but is server-based, expensive, and requires office staff.",
    confidence: "high",
  },
  {
    id: 3,
    name: "Cross-Brand Smart Controller Fleet View",
    oneLine: "Hydrawise + Rachio + Rain Bird LNK/IQ4 in one map, color-coded by status.",
    complaint:
      "Verbatim Rachio Community (40-year veteran, 5 techs, 2 commercial golf courses): 'I have 5 techs and I never know which one is going to have to deal with a rachio timer. I can't ask a customer to share with all of them... With a Hydrawise I send the customer an email that explains how to connect the timer to their wifi. From there I can see the timer in the Hydrawise app. I can see everyone of my customers on a single page of the app... None of that is available in the Rachio app.'",
    feature:
      "Single map of every customer controller — Hydrawise, Rachio, Rain Bird LNK/IQ4, Weathermatic, Centralus — color-coded by status. Onboarding flyer auto-generated per customer with QR code that walks the homeowner through granting team access (not single-tech). Aggregated flow/electrical alerts. Suspend-all and run-zone proxies. 'Controller-on-property doesn't match expected brand' warnings during scheduling.",
    complexity: "high",
    flSpecific: false,
    hardestToCopy:
      "Hunter and Rachio themselves — they'll never feature the competition in their own apps. ServiceTitan/Jobber don't think about controllers at all.",
    confidence: "high",
  },
  {
    id: 4,
    name: "Snowbird-Aware Customer Record",
    oneLine: "Knows when a customer is in town vs. up north; auto-suspends controllers during absence.",
    complaint:
      "Florida property-management literature explicitly markets 'snowbird services' because no general CRM understands the cycle. Operators with 30%+ snowbird customer bases manage in/out dates manually.",
    feature:
      "Per-customer 'in town' / 'out of town' cycles with start/end months; auto-adjusts service cadence; 'summer monitor' recurring product (drive-by photo + rain-sensor check); auto-suspend customer's smart controller during away period; auto-text owner pre-arrival; pause invoicing or auto-bill snowbird.",
    complexity: "low-medium",
    flSpecific: true,
    hardestToCopy: "Jobber would have to add a whole customer-state model. They won't.",
    confidence: "high",
  },
  {
    id: 5,
    name: "Hurricane Response Mode",
    oneLine: "Pre-storm controller shutoff + post-storm photo ticket + insurance-ready PDF.",
    complaint:
      "FL irrigation contractors (Sunrise Irrigation, Green Bird Irrigation re Hurricane Ian) describe ad-hoc post-storm processes. 'Joel came the same day and was able to fix things quickly... The pressure from the water ended breaking the back flow valve outside so water was rushing out to the streets.'",
    feature:
      "'Storm Watch' toggle pre-storm — pulls every customer in the cone, batches a pre-storm controller-shutoff job and post-storm walkthrough job. Storm Damage Assessment template per property (broken heads, exposed wires, debris in valve box, salt intrusion); generates an insurance-ready PDF with photos and GPS-tagged annotations. 'We will respond' auto-text to all customers in cone.",
    complexity: "medium",
    flSpecific: true,
    hardestToCopy: "Nobody. None of the national tools have this concept.",
    confidence: "high",
  },
  {
    id: 6,
    name: "FL Watering Restriction Auto-Programmer",
    oneLine: "From customer address, derives allowed days/hours and pushes schedule to their controller.",
    complaint:
      "Counties have wildly different rules. SWFWMD Modified Phase III (April 2026) cut watering to 12:01-4 AM or 8-11:59 PM, properties under 1 acre only one window. Sarasota Resolution 2022-234 by last digit of address. Pinellas: even = Saturday, odd = Wednesday. Orange County: 2-day-DST, 1-day-EST. Reclaimed water 24/7 in Hillsborough, restricted in Pinellas. No CRM does this.",
    feature:
      "From customer address, system derives the active utility, current restriction phase, allowed days, allowed hours, sod-establishment exemption status (and tracks the 30/30 timeline), reclaimed/well/potable source. One-click pushes this schedule to the customer's smart controller. Auto-printed homeowner card with their watering days. Compliance receipt.",
    complexity: "medium",
    flSpecific: true,
    hardestToCopy:
      "Hunter Hydrawise and Rachio could do this for their controllers — but they won't go cross-utility.",
    confidence: "high",
  },
  {
    id: 7,
    name: "DBPR CILB License & CEU Tracker",
    oneLine: "Track FL CILB Irrigation Specialty license expiration + 14 CEU progress.",
    complaint:
      "'Thousands of contractor licenses enter delinquent status each renewal cycle — most often due to missed deadlines.' (mycontractorexam.com). Aug 31 even years. 14 CEU breakdown rules.",
    feature:
      "Track owner's & employees' FL CILB Irrigation Specialty license, expiration, CEU progress against the 14-hour requirement broken down by category, link to DBPR-approved CE providers, auto-remind 90/60/30 days. Plus track Backflow Tester certification (TREEO/ASSE/Kruger) per tech, with calibration date per gauge — required by BSI Online for tester registration.",
    complexity: "low",
    flSpecific: true,
    hardestToCopy: "Universal CRMs won't build state-specific license tracking.",
    confidence: "high",
  },
  {
    id: 8,
    name: "Bilingual Field App That Works in the Sun",
    oneLine: "EN/ES toggle, offline-first, glove-friendly, voice-note translations.",
    complaint:
      "Jobber reviews: 'As technician this app is, on average, the worst part of my day. It's slow, clunky, unintuitive and even if I have nearly full bars and 5G it often won't connect.' Multiple Verde Property irrigation tech listings in Spanish only. LMN markets bilingual Crew app — but LMN is landscape-construction-first, not irrigation-service-first.",
    feature:
      "Full Spanish/English toggle for tech app. Offline-first by default (queue everything, sync later). Big tap targets, glove-friendly. Sunlight-readable high-contrast mode. Voice-note translations EN↔ES per job. Photo-first job ticketing (less typing). Spanish-language voice prompts walking less-experienced techs through a backflow test sequence.",
    complexity: "medium",
    flSpecific: false,
    hardestToCopy:
      "Jobber's app is acknowledged-broken offline; ServiceTitan's mobile is 'slow on older devices.' LMN does Spanish but is a different industry.",
    confidence: "high",
  },
  {
    id: 9,
    name: "Buried-Valve Memory & On-Property GPS Notes",
    oneLine: "GPS-pinned valve/head/backflow/controller location map per property.",
    complaint:
      "'6 full 8 hour days to find that solenoid box, buried under 9\" of gravelly dirt and 2\" of an asphalt parking pad.' Vu-Flow et al. explain valve-box-under-mulch is 'the biggest pain in residential service.'",
    feature:
      "GPS-pinned valve/head/backflow/controller location map per property, with depth/sleeve notes, photos, and 'as-found vs as-built' layers. First tech on a property earns time bonus to map; subsequent techs get 5x productivity. Sketch-on-aerial overlay (Google Maps + freehand). Optional QR-coded valve-box stickers tied to a record.",
    complexity: "low-medium",
    flSpecific: false,
    hardestToCopy:
      "No green-industry CRM has a real on-property asset map — Jobber/ServiceTitan treat the property as a single point.",
    confidence: "medium",
  },
  {
    id: 10,
    name: "Controller-Share Onboarding",
    oneLine: "3-tap controller-share onboarding flyer per smart-controller brand.",
    complaint:
      "Rachio thread, verbatim: 'Most of the time the homeowner isn't home. They give me access to their garage code... I created a rachio account that I and my other 5 techs all use. If any of us show up at a customers house and they have installed a rachio timer, we leave a printer flyer on their door with instructions for them how to share their account.'",
    feature:
      "From a customer record, generate a one-page printed leave-behind / SMS / email that walks a homeowner through granting access to all of the contractor's techs in 3 taps, per smart-controller brand (Rachio, Hydrawise, Rain Bird, Weathermatic). Status indicator: 'Access pending / granted / revoked.'",
    complexity: "low",
    flSpecific: false,
    hardestToCopy:
      "Manufacturer apps are siloed by brand and won't standardize. Generic CRMs aren't aware of controller access models.",
    confidence: "high",
  },
  {
    id: 11,
    name: "Storm/Spring Estimating with Photo-First Voice Quotes",
    oneLine: "On-property 'talk-to-quote' mode; AI parses voice into priced line items.",
    complaint:
      "'I can't quote a sprinkler repair from the truck without standing there for 20 minutes typing into a tiny iPhone keyboard.' Jobber: 'It lacks the depth required for complex projects, such as crew-based estimating, real-time job costing.' SatQuote/QuoteIQ are aerial-only; not designed for in-yard repair quotes.",
    feature:
      "On-property 'talk-to-quote' mode: tech says 'two K-Rain RPS heads, one PVC riser, 2 hours labor' → AI parses into line items from a price book pre-loaded with contractor's true costs from SiteOne / Ewing / FIS Outdoor / Heritage. Customer signs in seconds; deposit captured. Link to 'good-better-best' for upsells (smart controller, drip conversion, salt-resistant heads).",
    complexity: "medium",
    flSpecific: false,
    hardestToCopy:
      "Jobber/Housecall Pro have generic templates; nobody has irrigation-part-specific voice quoting.",
    confidence: "medium",
  },
  {
    id: 12,
    name: "Snowbird-Hurricane Insurance Packet",
    oneLine: "Per-property Storm Damage Inspection digital form → carrier-ready PDF.",
    complaint:
      "Post-Hurricane Ian, contractors describe walking 100+ properties in a week; insurance carriers demand standardized photo evidence with timestamps and damage classifications.",
    feature:
      "Per-property 'Storm Damage Inspection' digital form: GPS-stamped photos, pre-populated damage taxonomy (head sheared, valve box flooded, controller water-intrusion, mainline break, salt corrosion), parts cost estimate with carrier-friendly line items, generates one PDF per property formatted for FL homeowner insurance carriers. Bulk-export to email / shared with homeowners' adjusters.",
    complexity: "low",
    flSpecific: true,
    hardestToCopy: "No national tool has a damage-template approach.",
    confidence: "high",
  },
];

/**
 * Top 5 "wished-for" features per the research executive summary.
 * These are operator quotes synthesized from forum complaint volume + intensity.
 */
export const TOP_5_WISHED_FOR = [
  "A backflow-assembly compliance autopilot that talks to FL utility tracking portals (BSI Online, Aqua Backflow / TrackMyBackflow, JEA, Sarasota County, etc.) automatically.",
  "A spring-startup / post-storm 'mass route mode' — operators repeatedly say their normal scheduling tool collapses under 200-800 startups in a 4-6 week window.",
  "A real 'contractor mode' for Hunter Hydrawise + Rachio + Rain Bird LNK that aggregates customer controllers under one tech-fleet view, with on-property winterization/manual run without begging the homeowner.",
  "A bilingual (EN/ES) field app that works offline, in gloves, in Florida sun, and that doesn't crash mid-job.",
  "A snowbird- and hurricane-aware customer record that knows when a customer is in town vs. up north, prepares pre-storm shut-off lists, and produces post-storm damage assessments and insurance-ready PDF reports automatically.",
] as const;

/**
 * 4-week MVP build sketch per §7 of the research, "If you only had time to build 5".
 */
export const FOUR_WEEK_BUILD = [
  {
    week: 1,
    focus: "Backflow Compliance Autopilot (Wedge 1)",
    detail:
      "Plus the underlying customer-property-asset data model. Single most-defended FL moat. Ship the asset record, due-date math (biennial + 60-day out-of-cycle window), FDEP PDF generation, BSI Online submission via email/portal POST for at least the top 5 FL utility populations (Fort Lauderdale, JEA, Sarasota, Pinellas, Hillsborough). Demo: contractor uploads spreadsheet of 600 assemblies → system schedules and auto-generates submissions.",
  },
  {
    week: 2,
    focus: "Cross-Brand Smart Controller Fleet (Wedge 3)",
    detail:
      "With Hydrawise + Rachio. Map view of all customer controllers, alert aggregation, suspend-all on storm, run-zone proxy. The killer micro-feature: a 3-tap controller-share onboarding flyer (Wedge 10) per brand. The Rachio/Hydrawise contractor pain is so loud that this immediately differentiates Gladius from every competitor on day 1.",
  },
  {
    week: 3,
    focus: "Spring/Storm Mass-Route Mode + Bilingual Offline Field App (Wedge 2 + 8)",
    detail:
      "Map-based bulk-batch routing, drag-day-bump for rain, Spanish/English toggle, offline queue, photo-first job ticket, voice-note transcription. The operator-meets-tech wedge — solves both sides of the operator/crew complaint divide simultaneously.",
  },
  {
    week: 4,
    focus: "FL Watering Restriction Auto-Programmer + Snowbird Customer Cycle (Wedge 6 + 4)",
    detail:
      "Address-to-utility-and-day lookup (start with the 8 biggest FL utilities: SWFWMD's Hillsborough/Pinellas/Pasco/Sarasota/Manatee, SJRWMD's Orange/Lake/Volusia/St-Johns, plus JEA & OUC), push-schedule-to-controller via Hydrawise/Rachio, snowbird in/out-cycle suspend, customer leave-behind card.",
  },
  {
    week: "5 (if room)",
    focus: "DBPR/CEU Tracker (Wedge 7)",
    detail:
      "Low-effort, high-stickiness, renews biennially in lockstep with backflow assemblies — anchors the contractor to the platform every 2 years.",
  },
] as const;

/**
 * Integration priority order from §6 of the research. Drives the eventual
 * Irrigation OS workspace's third-party integration sequencing.
 */
export const INTEGRATIONS_PRIORITY = [
  "BSI Online (bsionline.com / bsionlinetracking.com) — required for ~half of FL utilities",
  "Aqua Backflow / TrackMyBackflow.com — Dania Beach + others",
  "JEA backflow program portal",
  "Sarasota County, Pinellas, Hillsborough, Orange/OUC, Miami-Dade WASD, GRU, Tampa Bay Water utility submission paths (start with email-PDF where direct API not available)",
  "Hunter Hydrawise Customer API",
  "Rachio Public API (read-only is fine for MVP)",
  "Rain Bird LNK/IQ4",
  "DBPR MyFloridaLicense renewal lookup",
  "QuickBooks Online (universal expectation)",
  "Stripe + ACH (LawnSite operators repeatedly criticize Jobber's PayPal-only flow)",
  "SiteOne / Ewing / Heritage FIS Outdoor parts catalogs (for voice-quote price book)",
  "Google Maps / Mapbox for property aerial layer",
  "Twilio for bilingual SMS",
] as const;
