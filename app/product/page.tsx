import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { CtaButton } from "@/components/cta-button";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pill } from "@/components/pill";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TopographicBg } from "@/components/topographic-bg";
import { ENGINE_TIERS, type EngineTier } from "@/content/engine-tiers";

export const metadata: Metadata = {
  title:
    "Product · 33 engines, 5 tiers, one operating system for landscaping",
  description:
    "GladiusTurf is the first landscaping platform built like a CRM and a BDC stack — 33 AI-orchestrated engines across Revenue, Lifecycle, Intelligence, Operations and Marketplace. Retire your other six tools by month two.",
};

// ─── Engine data (33 engines tagged by tier) ───────────────────────
//
// This data is intentionally co-located with the deep-dive copy this
// page renders. Sister agent maintains the canonical short-form list
// in /content/engines.ts and the tier definitions in
// /content/engine-tiers.ts; we import the tier shells from there.

type ProductEngine = {
  number: string;
  slug: string;
  name: string;
  outcome: string;
  tier: EngineTier["slug"];
  description: string;
  features: string[];
};

const ENGINES_FULL: ProductEngine[] = [
  // ───── Revenue (8) ─────
  {
    number: "01",
    slug: "quote-intercept",
    name: "Quote Intercept",
    outcome: "$14,200/mo saved deals",
    tier: "revenue",
    description:
      "Eighty percent of estimates are won or lost in the first sixty minutes. Intercept watches every channel — web, Google LSA, Angi, voicemail, ServiceTitan, and the foreman's truck-cab photo — funnels each request into one queue with one owner and a hard SLA, and re-prices it against your last twelve months of margin data inside ninety seconds.",
    features: [
      "Twelve-month margin model auto-prices mow, hardscape, irrigation and tree work",
      "Live e-sign proposals replace PDF chains and phone tag",
      "SLA escalations route rep → foreman → owner with auditable timestamps",
      "Lost-deal autopsy flags pricing or response gaps before they pattern",
    ],
  },
  {
    number: "02",
    slug: "quickhook",
    name: "QuickHook",
    outcome: "47% inbound-to-booked rate",
    tier: "revenue",
    description:
      "The first reply that doesn't sound like a robot. QuickHook fires within twelve seconds of any inbound — text, web form, missed call — with a property-aware opener that names the street, references the request, and offers two real time slots from your live calendar. Most shops convert almost half of cold inbounds before a human ever picks up.",
    features: [
      "Twelve-second first response across SMS, web, missed-call, LSA",
      "Property-aware openers reference street, lawn size and last service",
      "Two-tap booking from your live crew calendar",
      "Hands the warm handoff to a human at the right friction point",
    ],
  },
  {
    number: "03",
    slug: "upsell-whisperer",
    name: "Upsell Whisperer",
    outcome: "$38,000/mo unbooked revenue",
    tier: "revenue",
    description:
      "Every existing property is a continuous inspection target. Whisperer fuses satellite imagery, soil-temperature data, irrigation leak logs, mow history and crew photo notes into a per-property weekly upsell list — pre-priced, photo-backed, and crew-readable. The foreman walks the homeowner outside, points, and the proposal is texted before the truck pulls away.",
    features: [
      "Satellite + soil + irrigation + crew-photo fusion per property",
      "Pre-priced add-ons for aeration, overseed, mulch, drainage, tree, irrigation",
      "Photo-backed text proposals signed in the driveway",
      "Crew-readable scripts so foremen pitch without a sales manager",
    ],
  },
  {
    number: "04",
    slug: "referral-radar",
    name: "Referral Radar",
    outcome: "$180,000/yr recovered",
    tier: "revenue",
    description:
      "Every premium hardscape, install, or full-renovation is a billboard your software is failing to monetize. Radar maps every active property to its neighbors, HOAs and historical referral lineage, then fires same-day postcards, HOA texts and doorhanger queues the afternoon a marquee job wraps. It also publishes a Referral Health score per crew so you can see which foremen quietly burn the silent leak.",
    features: [
      "Geo-graph of every property, neighbor and HOA tied to referral revenue",
      "Same-day postcard, text and doorhanger campaigns on job completion",
      "Per-crew and per-rep Referral Health scoring with leak alerts",
      "Yard-sign-to-revenue attribution so you know what marketing actually worked",
    ],
  },
  {
    number: "05",
    slug: "voicequote",
    name: "VoiceQuote",
    outcome: "70% of voicemails quoted",
    tier: "revenue",
    description:
      "The dead voicemail folder is a graveyard of $1,800 tickets. VoiceQuote transcribes every inbound voicemail, extracts the address, parses the service request, runs a margin-priced quote against satellite + last-mile data, and sends a text-back proposal with two time slots — usually before the homeowner has poured their morning coffee.",
    features: [
      "Transcribes voicemail in under thirty seconds, extracts address + intent",
      "Pulls satellite imagery and lot data for an instant scope estimate",
      "Sends a real proposal via SMS — not a callback request",
      "Routes ambiguous requests to a human only when the model isn't sure",
    ],
  },
  {
    number: "06",
    slug: "property-hunter",
    name: "Property Hunter",
    outcome: "12 conquest leads/wk",
    tier: "revenue",
    description:
      "Outbound that doesn't feel like outbound. Hunter scrapes new-mover records, MLS sales, permit pulls and aerial-anomaly data (uncut lawns next to cut ones) inside your service radius, then drops a property-specific text or postcard the same day. Every lead carries lot size, last-known service, and a pre-priced opening offer — your reps stop cold-calling and start triaging warm property cards.",
    features: [
      "New-mover, MLS, permit and aerial-anomaly feeds inside your zip ring",
      "Lot-size and last-mile data attached to every lead card",
      "Pre-priced opening offers — postcards, SMS and door drops",
      "Conquest scoring against your existing route density",
    ],
  },
  {
    number: "07",
    slug: "ghost-recovery",
    name: "Ghost Recovery",
    outcome: "$9,400/mo resurrected",
    tier: "revenue",
    description:
      "Every CRM has a graveyard — quotes that never closed, cancelled contracts, customers who quietly drifted to the cheaper guy. Ghost Recovery wakes them up. It clusters dead leads by reason-lost, drops the right re-engagement (price reset, new service, seasonal trigger, neighborhood reference) and books the call before the homeowner remembers why they ghosted you.",
    features: [
      "Reason-lost clustering across ninety, one-eighty and three-sixty day cohorts",
      "Re-engagement playbooks tuned by season and original lost-reason",
      "Neighborhood-reference messaging for cancelled-contract win-backs",
      "Auto-quiet on do-not-contact and bankruptcy filings",
    ],
  },
  {
    number: "08",
    slug: "servicemagnet",
    name: "ServiceMagnet",
    outcome: "+19% attach rate",
    tier: "revenue",
    description:
      "The on-property attach engine. When a crew is on-site for one service, Magnet reads the property card, the season, the weather window and your inventory and surfaces the next two add-ons the homeowner is statistically most likely to say yes to. The crew gets a one-line pitch, the office gets the quote in their queue, the homeowner gets the proposal before the truck leaves the curb.",
    features: [
      "Real-time on-site attach scoring against season, weather and inventory",
      "One-line crew pitches written for the foreman, not the sales floor",
      "Auto-routes signed proposals into the schedule — no double-entry",
      "Per-crew attach leaderboard so the right foremen earn the bonus pool",
    ],
  },

  // ───── Lifecycle (6) ─────
  {
    number: "09",
    slug: "client-portal",
    name: "Client Portal",
    outcome: "73% fewer status calls",
    tier: "lifecycle",
    description:
      "A branded self-serve portal where homeowners reschedule visits, pay invoices, approve change orders, sign waivers and book new services without ever picking up the phone. Your crew's logo, your colors, your photos. Stripe handles the money. SMS and email close the loop. The phone stops ringing for status updates and your office staff stops drowning in reschedule emails on Monday morning.",
    features: [
      "Self-serve scheduling against your live crew availability",
      "One-tap invoice payment via Stripe — ACH plus card",
      "Change-order approvals, waivers and add-on requests in one flow",
      "White-labeled with your logo, colors and crew photos",
    ],
  },
  {
    number: "10",
    slug: "cadence",
    name: "Cadence",
    outcome: "+24% retention · $12.8K/mo recovered",
    tier: "lifecycle",
    description:
      "The intelligent follow-up brain. Six-hour post-service feedback prompts. Late-payment cadences that warm up before they escalate (Day 3 friendly, Day 7 reminder, Day 14 firmer, then human handoff). Seasonal reminders timed to NOAA. Every message personalized from Site Memory — the dog's name, the gate code, the back zone they hate weeds in.",
    features: [
      "Six-hour post-service feedback fires while the lawn still looks fresh",
      "Day 3 / 7 / 14 late-pay warm-up before any human gets involved",
      "Seasonal reminders timed to NOAA forecasts, not calendar guesses",
      "Dormant-customer reactivation — quiet for 90 days? We surface them.",
    ],
  },
  {
    number: "11",
    slug: "site-memory",
    name: "Site Memory",
    outcome: "6mo → 6wk new-hire onboarding",
    tier: "lifecycle",
    description:
      "Every shop loses tribal knowledge to turnover. The gate code on Henderson Way. The boxer that bites only when the gate is left open. The sprinkler zone miswired since the pool install. The slope that flips a 36-inch zero-turn. Memory captures all of it on every visit — text, photo, voice memo — and indexes it against the property so any new hire can search it from their phone in three seconds.",
    features: [
      "Per-property knowledge graph: codes, pets, irrigation maps, slopes, prefs",
      "Crew handoff capture on every visit — text, photo, voice memo",
      "Searchable from the foreman's phone in under three seconds",
      "Site Health score surfaces issues, upsells and risks before renewal",
    ],
  },
  {
    number: "12",
    slug: "weather-pivot",
    name: "Weather Pivot",
    outcome: "zero storm-day complaints",
    tier: "lifecycle",
    description:
      "Weather breaks every landscaping schedule and every shop manages it the same broken way. Pivot watches a rolling seven-day forecast against every scheduled visit, reshuffles by service type and crew skill when a storm shifts, holds chemical-sensitive applications until wind drops, and texts every affected client a new arrival window before they wonder. Snow ops mode generates per-storm invoices against NOAA-verified depths.",
    features: [
      "Rolling seven-day model against every scheduled visit",
      "Auto-reshuffle by service type, crew skill and chemical-safe windows",
      "Client-facing arrival-window texts and post-service photo proofs",
      "Snow ops mode with NOAA-verified depths and auto-generated invoices",
    ],
  },
  {
    number: "13",
    slug: "showrate-max",
    name: "ShowRate Max",
    outcome: "92% on-site show rate",
    tier: "lifecycle",
    description:
      "The booked-but-no-one-home tax kills four-truck shops. ShowRate Max ladders confirmation reminders against the homeowner's actual response history — some get a soft text the night before, some need a morning-of confirm, some need a live-call from the foreman ten minutes out. The model learns each customer's pattern and stops the no-shows at their root.",
    features: [
      "Per-customer reminder ladder tuned to historical show behavior",
      "Foreman ten-minutes-out live-call queue for high-risk visits",
      "Auto-rescheduling when the homeowner replies 'not today' before dispatch",
      "Per-crew show-rate scoring so dispatchers stop guessing",
    ],
  },
  {
    number: "14",
    slug: "lifehook",
    name: "LifeHook",
    outcome: "11% of new revenue",
    tier: "lifecycle",
    description:
      "Customers move, get married, list their house, refinance, get divorced. Every life event is an inflection where loyalty resets. LifeHook ingests public-records signals — moves, sales, permits, marriages — for every customer in your book and fires the right outreach (move-in welcome, listing-prep package, post-renovation refresh) on the day the event lands.",
    features: [
      "Public-records ingest: move, sale, permit, marriage, refi",
      "Event-specific playbooks — listing prep, move-in welcome, post-reno",
      "Quiets automatically on bereavement and bankruptcy signals",
      "Tracks LifeHook revenue separately so you can prove the lift",
    ],
  },

  // ───── Intelligence (8) ─────
  {
    number: "15",
    slug: "intent-scorer",
    name: "Intent Scorer",
    outcome: "3.2x close-rate on top quartile",
    tier: "intelligence",
    description:
      "Not every quote request is a quote. Intent Scorer reads every inbound — words used, time of day, channel, address quality, repeat-visitor flag — and scores the request 0–100 against your historical close patterns. Your reps stop spending forty minutes on a tire-kicker and twelve minutes on the homeowner who's ready to sign by Thursday.",
    features: [
      "Per-request 0–100 score from historical close patterns",
      "Channel, time-of-day, language, address-quality and repeat-visitor signals",
      "Auto-routes top quartile to your senior closer, low quartile to the bot",
      "Calibrates monthly against your shop's actual closes — not a generic model",
    ],
  },
  {
    number: "16",
    slug: "urgencysync",
    name: "UrgencySync",
    outcome: "+38% same-week close",
    tier: "intelligence",
    description:
      "Most quote responses are written in the same flat tone whether the homeowner needs the work this Friday or thinks they might do it 'sometime this fall.' UrgencySync reads urgency cues — language, season, complaint history, neighborhood weather pattern — and matches your reply tempo and discount posture to the actual heat of the request.",
    features: [
      "Per-quote urgency score from language, season and weather signals",
      "Adjusts response tempo, follow-up cadence and discount posture",
      "Flags fake-urgency tire-kickers so you stop discounting needlessly",
      "Feeds back into Intent Scorer — the models compound nightly",
    ],
  },
  {
    number: "17",
    slug: "toneradar",
    name: "ToneRadar",
    outcome: "67% fewer escalations",
    tier: "intelligence",
    description:
      "Every customer message — text, email, portal note — gets read for sentiment, frustration, and churn risk before your office sees it. A frustrated message from a six-year customer routes straight to the owner. A neutral request routes to the rotation. The angry customer who's about to write a review gets a human reply in nine minutes instead of nine hours.",
    features: [
      "Per-message sentiment, frustration and churn-risk scoring",
      "Auto-escalation when high-LTV customers turn cold",
      "Office triage queue sorted by emotional heat, not arrival time",
      "Privacy-preserving — runs on your tenant, never trains a public model",
    ],
  },
  {
    number: "18",
    slug: "winmemory",
    name: "WinMemory",
    outcome: "+21% rep performance",
    tier: "intelligence",
    description:
      "Every closed deal is a recipe. WinMemory captures the full thread of every winning quote — the language, the photos used, the price posture, the response cadence, the discount logic — and serves the closest historical match to your rep when the next similar lead lands. New reps close like ten-year veterans because they're standing on a decade of institutional memory.",
    features: [
      "Indexed library of every won deal, searchable by service, season, lot type",
      "Suggests language, photos and price posture for the live lead",
      "Highlights the rep who closed the closest historical match",
      "Compounds as your shop grows — better in year three than year one",
    ],
  },
  {
    number: "19",
    slug: "market-anchor",
    name: "Market Anchor",
    outcome: "+9pts gross margin",
    tier: "intelligence",
    description:
      "Most shops price by gut. Anchor benchmarks every service-by-service quote against the broader Gladius shop network in your radius — without ever exposing competitor identities — so you know when you're leaving margin on the floor and when you're priced out of the market. Pricing decisions stop being a religion and start being a number.",
    features: [
      "Anonymized regional benchmarks per service, lot size and season",
      "Per-quote 'leaving money / priced out' indicator",
      "Margin-floor enforcement so reps can't price below shop policy",
      "Quarterly market drift report your CFO can actually use",
    ],
  },
  {
    number: "20",
    slug: "lri-score",
    name: "LRI Score",
    outcome: "predicts churn 60 days out",
    tier: "intelligence",
    description:
      "The Lawn Relationship Index. A single 0–100 number per customer that fuses payment cadence, complaint history, response latency, attach rate, NPS and Site Health into one churn-risk signal. When LRI drops twenty points in thirty days, your office gets a save-call queue before the customer cancels — because by the time they call to cancel, it's already too late.",
    features: [
      "Per-customer 0–100 score updated nightly",
      "Save-call queue triggered on twenty-point drops",
      "Per-crew LRI roll-up — which foremen quietly burn relationships",
      "Feeds Cadence and Referral Radar so retention compounds",
    ],
  },
  {
    number: "32",
    slug: "retention-radar",
    name: "Retention Radar",
    outcome: "churn predicted 60 days out · +18% NRR",
    tier: "intelligence",
    description:
      "Retention Radar watches every customer for the early signals of churn — payment delays, response-time decay (ToneRadar feed), seasonal lapse, declining service revenue, increasing complaint count — and predicts churn sixty days out with a confidence score. The moment a customer drifts into the at-risk band, Cadence fires a personalized save play and the foreman's queue surfaces a save call before the customer ever picks up the phone to cancel.",
    features: [
      "Sixty-day churn forecast per customer with confidence score",
      "Auto-fires Cadence save plays the moment the at-risk band trips",
      "Per-crew save queue surfaces the live calls foremen should make today",
      "Net Revenue Retention dashboard — the only metric we obsess over",
    ],
  },
  {
    number: "33",
    slug: "ltv-ledger",
    name: "LTV Ledger",
    outcome: "true LTV per customer · payback by segment",
    tier: "intelligence",
    description:
      "Per-customer lifetime value computed from real revenue minus real cost — not a marketing-deck average. LTV Ledger pulls from Job Costing for true cost-of-service, runs cohort analysis (Q2 2025 vs Q2 2026 customers), and segments ROI by service line (weekly mowing vs hardscape one-offs vs fert programs) and acquisition source. The first time landscape ops have known what their customers are actually worth.",
    features: [
      "Per-customer true LTV from real revenue minus real cost (Job Costing feed)",
      "Cohort analysis — quarter-over-quarter customer-cohort comparisons",
      "Per-service-line ROI: mowing, hardscape, fert, snow, irrigation",
      "Payback period by acquisition source — finally measurable, finally honest",
    ],
  },

  // ───── Operations (9) ─────
  {
    number: "21",
    slug: "safety-shield",
    name: "Safety Shield",
    outcome: "avoid $25K+ in state fines",
    tier: "operations",
    description:
      "State pesticide licensing, drift logs, weather-hold windows, REI hold periods, sensitive-site setbacks, renewal CEUs. Shield watches every applicator, every chemical, every spray ticket against real-time wind and humidity. Try to log a 2,4-D application on a windy Thursday next to a school zone? Shield blocks the ticket. Inspector calls? You produce a complete spray-and-license audit pack in five minutes.",
    features: [
      "Live license tracking with auto-renewal queues per applicator and state",
      "Per-product registration, REI and sensitive-site rules at ticket creation",
      "Real-time weather and wind blocks for drift-risk applications",
      "One-click inspector audit pack — every spray, every license, every CEU",
    ],
  },
  {
    number: "22",
    slug: "quality-radar",
    name: "Quality Radar",
    outcome: "44% fewer redo visits",
    tier: "operations",
    description:
      "Every visit ends with a crew photo. Quality Radar runs computer-vision diffs against the last visit and the property's baseline — uncut strip, scalped corner, bad mulch line, missing edge — and either auto-flags the redo before the truck leaves the property or quietly rolls it into the next visit if it's marginal. Customers see the result, not the rework.",
    features: [
      "Computer-vision diff against last visit and property baseline",
      "On-site redo prompt while the crew is still in the driveway",
      "Quality score per crew, per foreman, per service",
      "Auto-rolls marginal misses into next visit instead of escalating",
    ],
  },
  {
    number: "23",
    slug: "operator-score",
    name: "Operator Score",
    outcome: "objective foreman ranking",
    tier: "operations",
    description:
      "Most shops promote the foreman who shouts the loudest in the morning huddle. Operator Score ranks every crew lead on the only metrics that matter — quality score, attach rate, on-time, redo rate, complaint rate, referral generation, retention. The bonus pool stops being political and the right people start getting the trucks they've earned.",
    features: [
      "Composite per-foreman ranking across seven outcome metrics",
      "Bonus-pool calculator your accountant can run in one click",
      "Identifies coaching gaps before they show up in churn",
      "Anonymized peer benchmarks across the Gladius network",
    ],
  },
  {
    number: "24",
    slug: "field-crew-app",
    name: "Field Crew App",
    outcome: "works without signal",
    tier: "operations",
    description:
      "The PWA your crews actually open. Route, property cards, gate codes, irrigation maps, on-site upsells, change-order capture, photo logging, voice memos, payment collection, time-and-materials clock — all of it runs offline and syncs the moment the truck hits a tower. No more 'the app crashed' on the back-forty property the office can't reach by phone.",
    features: [
      "Full offline mode — route, property cards, photo logging, payment",
      "Background sync the moment a tower comes back",
      "Voice memos transcribed into Site Memory automatically",
      "Time-and-materials clock that survives a dropped phone",
    ],
  },
  {
    number: "25",
    slug: "job-costing",
    name: "Job Costing",
    outcome: "+11% net per job",
    tier: "operations",
    description:
      "Most landscaping shops can't tell you which services make money and which ones quietly bleed. Job Costing fuses crew-hours, materials, fuel, equipment depreciation, overhead allocation and on-site GPS dwell into a per-job, per-service, per-crew P&L. The unprofitable services get re-priced or retired before the year-end statement makes you find out the hard way.",
    features: [
      "Per-job P&L: hours, materials, fuel, equipment, overhead",
      "Per-service margin curve so you know which ones to retire",
      "Per-crew profitability — labor, drive time, redo cost",
      "Plays back into Quote Intercept's pricing engine in real time",
    ],
  },
  {
    number: "28",
    slug: "books",
    name: "Books",
    outcome: "real-time P&L · zero double-entry",
    tier: "operations",
    description:
      "First-party general ledger built for landscape ops — not a QuickBooks bolt-on. Every paid invoice, every Stripe payout, every Surplus Yard sale, every fuel receipt flows into a real chart of accounts in real time. AI categorizes expenses from a photo of the receipt, no clerk needed. P&L by service line (mowing / fert / hardscape / snow), per-crew, per-property. Audit-ready balance sheet on demand.",
    features: [
      "Native general ledger — not a sync, not a bolt-on",
      "Real-time P&L by service line, crew, and property",
      "Receipt-photo to journal-entry in under twenty seconds",
      "Audit-ready balance sheet, cash flow, and accrual reports",
    ],
  },
  {
    number: "29",
    slug: "expense-brain",
    name: "Expense Brain",
    outcome: "97% auto-categorized · 4-hr admin/wk reclaimed",
    tier: "operations",
    description:
      "Photograph a fuel receipt, mulch invoice, or equipment repair bill — Expense Brain reads it (Claude vision), categorizes it (Fuel / Materials / Equipment / Subcontractor), matches it to the right job (Job Costing knows which crew was where), and posts the journal entry. The four-hour weekly bookkeeping huddle becomes a fifteen-minute review. Your office manager goes home on Friday.",
    features: [
      "Claude-vision receipt parsing — vendor, amount, line items",
      "Auto-matches receipts to jobs via crew GPS + timestamp",
      "Per-category, per-vendor, per-crew expense rollups",
      "97% auto-categorization — humans review only the unsure ones",
    ],
  },
  {
    number: "30",
    slug: "payroll",
    name: "Payroll",
    outcome: "GPS-verified hours · W-2 + 1099 ready",
    tier: "operations",
    description:
      "Crew hours pulled from Field Crew App GPS clock-in / clock-out — no more paper time sheets, no more 'I was there at 7' disputes. Multi-state tax tables, OT calc, prevailing-wage rules for municipal jobs. W-2 export for full-time crews, 1099-NEC for subcontractors with vendor TIN collection on first job. The shop owner who used to spend Sunday night reconciling timecards gets Sunday night back.",
    features: [
      "GPS-verified hours from Field Crew App clock-in / clock-out",
      "Multi-state tax tables, OT, and prevailing-wage rules",
      "W-2 + 1099-NEC export with vendor TIN collection",
      "Direct deposit, paystub portal, and end-of-year packets",
    ],
  },
  {
    number: "31",
    slug: "tax-engine",
    name: "Tax Engine",
    outcome: "sales tax by ZIP · mileage log · 1099-NEC",
    tier: "operations",
    description:
      "Sales tax calculated on every invoice by jurisdiction (Stripe Tax integrated, every county). Per-vehicle mileage log auto-generated from GPS data. Schedule C and Schedule E summaries on demand. 1099-NEC packets for the subcontractor cohort prepped by January 15. The first time landscape shops have not dreaded April.",
    features: [
      "Per-jurisdiction sales tax (Stripe Tax) on every invoice",
      "Per-vehicle GPS-driven mileage log — IRS-ready",
      "Schedule C / E summaries available on demand",
      "1099-NEC packets prepped and dispatched by Jan 15",
    ],
  },

  // ───── Marketplace (2) ─────
  {
    number: "26",
    slug: "surplus-yard",
    name: "Surplus Yard",
    outcome: "$20K–$60K/yr recaptured",
    tier: "marketplace",
    description:
      "Every shop runs a graveyard out back: leftover sod, three skids of unwanted mulch, a stack of returned pavers, two used Stihls. The yard guy calls it Tuesday. Surplus Yard is the marketplace that closes the loop. List a pallet, a tree, a tool, a load. Other Gladius shops in your radius see it instantly, pay through the platform and pick up. Three percent rail fee. Same-day movement.",
    features: [
      "Multi-shop marketplace for sod, mulch, stone, plants, trees, equipment",
      "Stripe Connect rails with automatic 1099 tracking",
      "Geo-radius listings so material moves locally — same-day pickup",
      "Inventory write-offs reclassified to revenue line",
    ],
  },
  {
    number: "27",
    slug: "knowledge-codex",
    name: "Knowledge Codex",
    outcome: "tribal knowledge → company memory",
    tier: "marketplace",
    description:
      "Every shop in the Gladius network contributes anonymized playbooks — the upsell scripts that close, the late-pay sequences that recover, the foreman scripts that don't sound like a robot, the tree-removal pricing that survived a hailstorm. Codex distills the network's hard-won wisdom into a per-shop coaching feed. You stop being one shop guessing alone and start being one shop standing on a thousand.",
    features: [
      "Anonymized playbook library across the Gladius network",
      "Per-shop coaching feed tuned to your services and region",
      "Contributors earn rev-share when their playbook closes for someone else",
      "Compounds nightly — every shop's wins make every other shop sharper",
    ],
  },
];

const TIER_ENGINE_COUNTS: Record<string, number> = ENGINES_FULL.reduce(
  (acc, e) => {
    acc[e.tier] = (acc[e.tier] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

// ─── Architecture spine — engine-by-step mapping ───────────────────

const SPINE_STEPS: { step: string; engines: string[] }[] = [
  { step: "Quote", engines: ["Quote Intercept", "QuickHook", "VoiceQuote", "Intent Scorer"] },
  { step: "Schedule", engines: ["Weather Pivot", "ShowRate Max", "Field Crew App"] },
  { step: "Crew", engines: ["Site Memory", "Safety Shield", "Quality Radar", "Operator Score"] },
  { step: "Invoice", engines: ["Job Costing", "Cadence", "Client Portal"] },
  { step: "Review", engines: ["Cadence", "ToneRadar", "LRI Score"] },
  { step: "Upsell", engines: ["Upsell Whisperer", "ServiceMagnet", "Market Anchor"] },
  { step: "Loop", engines: ["Referral Radar", "Ghost Recovery", "LifeHook", "WinMemory", "Surplus Yard", "Knowledge Codex"] },
];

const PRIMITIVES: { name: string; line: string }[] = [
  {
    name: "Multi-tenant auth",
    line: "Clerk · per-shop isolation, SSO-ready, role-aware from rep to owner.",
  },
  {
    name: "Type-safe API",
    line: "tRPC + Zod · one schema, end-to-end types, no contract drift between server and crew app.",
  },
  {
    name: "Stripe Connect",
    line: "Card-on-file, ACH, Surplus Yard rails, per-shop payouts. PCI scope stays out of your shop.",
  },
  {
    name: "Twilio SMS + voice",
    line: "A2P 10DLC handled, voicemail transcription, ringless drops, per-tenant numbers.",
  },
  {
    name: "Resend",
    line: "Transactional email — quotes, receipts, change orders — with deliverability we monitor for you.",
  },
  {
    name: "AI orchestration",
    line: "Anthropic Claude · property-aware prompts, retrieval over Site Memory, model fallback per call.",
  },
];

// ─── Inline icons (RSC-safe) ───────────────────────────────────────

type IconProps = { className?: string };

function IconChevronRight({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// ─── Local helpers ─────────────────────────────────────────────────

// Heritage palette tier rotation: champagne → moss → champagne → moss → champagne
// across the five tiers in display order (Revenue, Lifecycle, Intelligence,
// Operations, Marketplace).
const TIER_ROTATION: Record<EngineTier["slug"], "champagne" | "moss"> = {
  revenue: "champagne",
  lifecycle: "moss",
  intelligence: "champagne",
  operations: "moss",
  marketplace: "champagne",
};

function tierTone(slug: EngineTier["slug"]): "champagne" | "moss" {
  return TIER_ROTATION[slug];
}

function tierAccentText(slug: EngineTier["slug"]) {
  return tierTone(slug) === "champagne"
    ? "text-champagne-bright"
    : "text-moss-bright";
}

function tierBg(slug: EngineTier["slug"]) {
  // Heritage: alternate true black with warm charcoal. Lifecycle + Operations
  // get the warm charcoal "stage" so the layout still rhythm-shifts visually.
  return slug === "lifecycle" || slug === "operations"
    ? "bg-slate-deep"
    : "bg-obsidian";
}

// ─── Page ──────────────────────────────────────────────────────────

export default function ProductPage() {
  return (
    <>
      <Nav />
      <main className="bg-obsidian">
        {/* 1. Hero — true black stage for the crest */}
        <section className="relative overflow-hidden border-b border-bone/5 bg-pitch">
          <TopographicBg />
          <div className="relative mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Pill tone="champagne">The product</Pill>
              <h1 className="mt-6 max-w-5xl font-serif text-5xl tracking-[-0.02em] text-bone md:text-7xl">
                Thirty-three engines.{" "}
                <span className="text-moss-bright">Five tiers.</span>{" "}
                <span className="text-bone/40">One operating system.</span>
              </h1>
              <p className="mt-8 max-w-3xl text-lg leading-[1.55] text-bone/60 md:text-xl">
                GladiusTurf is the first landscaping platform built like
                Gladius CRM and Gladius BDC — AI-orchestrated, self-improving,
                and deep enough to retire your other six tools by month two.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <CtaButton href="/demo" variant="primary" size="lg">
                  Book a demo
                </CtaButton>
                <CtaButton href="/pricing" variant="ghost-champagne" size="lg">
                  See pricing →
                </CtaButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Tier overview band */}
        <section className="border-b border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <Eyebrow tone="champagne">Five tiers</Eyebrow>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                Engines aren&rsquo;t features.{" "}
                <span className="text-bone/40">They&rsquo;re a vertical.</span>
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-[1.6] text-bone/60">
                Five tiers, thirty-three engines, one shared data spine. Every
                quote, every schedule, every crew note, every invoice, every
                review, every payment feeds the next loop. There is no
                double-entry. There is no &ldquo;export to CSV.&rdquo; There is
                one revenue brain.
              </p>
            </ScrollReveal>

            <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-5">
              {ENGINE_TIERS.map((tier, idx) => {
                const tone = tierTone(tier.slug);
                const isChampagne = tone === "champagne";
                const accentBorder = isChampagne
                  ? "hover:border-champagne/40"
                  : "hover:border-moss/40";
                return (
                  <ScrollReveal key={tier.slug} delay={idx * 0.05}>
                    <a
                      href={`#tier-${tier.slug}`}
                      className={`block h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-5 transition-colors ${accentBorder}`}
                    >
                      <p
                        className={`font-mono text-[10px] uppercase tracking-crest ${tierAccentText(tier.slug)}`}
                      >
                        {String(idx + 1).padStart(2, "0")} ·{" "}
                        {TIER_ENGINE_COUNTS[tier.slug] ?? 0} engines
                      </p>
                      <h3 className="mt-3 font-serif text-2xl tracking-tight text-bone">
                        {tier.name}
                      </h3>
                      <p className="mt-2 text-sm leading-[1.5] text-bone/60">
                        {tier.tagline}
                      </p>
                    </a>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Per-tier deep-dive sections */}
        {ENGINE_TIERS.map((tier) => {
          const tierEngines = ENGINES_FULL.filter((e) => e.tier === tier.slug);
          const bg = tierBg(tier.slug);
          const tone = tierTone(tier.slug);
          const accentTextCls = tierAccentText(tier.slug);
          // Each tier eyebrow rotates per the spec; within the tier the engines
          // alternate champagne/moss starting from the tier's lead tone.
          const tierEyebrowTone: "champagne" | "moss" = tone;
          return (
            <section
              key={tier.slug}
              id={`tier-${tier.slug}`}
              aria-label={`${tier.name} tier`}
              className={`scroll-mt-24 border-b border-bone/5 ${bg}`}
            >
              <div className="mx-auto max-w-7xl px-6 py-28">
                <ScrollReveal>
                  <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div>
                      <Eyebrow tone={tierEyebrowTone}>
                        {tier.name} tier
                      </Eyebrow>
                      <h2 className="mt-4 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                        {tier.tagline}
                      </h2>
                      <p
                        className={`mt-4 font-mono text-[11px] uppercase tracking-crest ${accentTextCls}`}
                      >
                        {tierEngines.length}{" "}
                        {tierEngines.length === 1 ? "engine" : "engines"}
                      </p>
                    </div>
                    <p className="text-lg leading-[1.6] text-bone/60 md:col-span-2">
                      {tier.blurb}
                    </p>
                  </div>
                </ScrollReveal>

                <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {tierEngines.map((engine, i) => {
                    // Within the tier, even-index = tier's lead tone,
                    // odd-index = the other tone.
                    const useTierTone = i % 2 === 0;
                    const useChampagne =
                      (tone === "champagne" && useTierTone) ||
                      (tone === "moss" && !useTierTone);
                    const engineAccentCls = useChampagne
                      ? "text-champagne-bright"
                      : "text-moss-bright";
                    const dotChampagne = "bg-champagne-bright";
                    const dotMoss = "bg-moss-bright";
                    return (
                      <ScrollReveal key={engine.slug} delay={i * 0.04}>
                        <article
                          id={engine.slug}
                          className="flex h-full scroll-mt-24 flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 md:p-8"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span
                              className={`font-mono text-3xl tracking-tight md:text-4xl ${engineAccentCls}`}
                              style={{ opacity: 0.4 }}
                            >
                              {engine.number}
                            </span>
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] ${
                                useChampagne
                                  ? "border-champagne/30 bg-champagne/5 text-champagne-bright"
                                  : "border-moss/30 bg-moss/5 text-moss-bright"
                              }`}
                            >
                              {engine.outcome}
                            </span>
                          </div>
                          <h3 className="mt-5 font-serif text-3xl tracking-tight text-bone md:text-4xl">
                            {engine.name}
                          </h3>
                          <p className="mt-4 text-base leading-[1.65] text-bone/60">
                            {engine.description}
                          </p>
                          <ul className="mt-6 space-y-3">
                            {engine.features.map((f, fi) => {
                              // Even = champagne, odd = moss (heritage default)
                              const dotChamp = fi % 2 === 0;
                              return (
                                <li
                                  key={f}
                                  className="flex items-start gap-3 text-sm text-bone/70"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                                      dotChamp ? dotChampagne : dotMoss
                                    }`}
                                  />
                                  <span>{f}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </article>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* 4. Architecture spine band — engines grid main h2 accent KEEPS moss */}
        <section
          id="architecture"
          className="border-b border-bone/5 bg-obsidian"
        >
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="moss">Architecture</Eyebrow>
                <h2 className="mt-4 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                  Thirty-three engines.{" "}
                  <span className="text-moss-bright">One spine.</span>
                </h2>
                <p className="mt-6 text-lg leading-[1.6] text-bone/60">
                  The same property record feeds every screen. The same
                  customer identity follows every touch. Every engine reads
                  from one truth and writes back to it. Below: which engines
                  fire at each moment of the customer journey.
                </p>
              </div>
            </ScrollReveal>

            {/* Step pills */}
            <ScrollReveal delay={0.1}>
              <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
                {SPINE_STEPS.map((s, idx) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <div className="rounded-2xl border border-bone/10 bg-bone/[0.02] px-4 py-2 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-crest text-bone/40">
                        Step {String(idx + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-1 font-serif text-base text-bone">
                        {s.step}
                      </p>
                    </div>
                    {idx < SPINE_STEPS.length - 1 && (
                      <IconChevronRight className="h-4 w-4 text-champagne-bright" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Per-step engine map */}
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              {SPINE_STEPS.map((s, idx) => (
                <ScrollReveal key={s.step} delay={idx * 0.04}>
                  <div className="h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-crest text-champagne-bright">
                      Step {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-serif text-xl text-bone">
                      {s.step}
                    </h3>
                    <ul className="mt-4 space-y-1.5">
                      {s.engines.map((eng, ei) => {
                        // Even = champagne, odd = moss (heritage default)
                        const dotChamp = ei % 2 === 0;
                        return (
                          <li
                            key={eng}
                            className="flex items-start gap-2 text-[13px] leading-[1.4] text-bone/70"
                          >
                            <span
                              aria-hidden="true"
                              className={`mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full ${
                                dotChamp
                                  ? "bg-champagne-bright"
                                  : "bg-moss-bright"
                              }`}
                            />
                            <span>{eng}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-[1.7] text-bone/50">
              A four-truck shop on GladiusTurf operates like a forty-truck
              shop. The completed job feeds the next-touch queue. The next
              touch feeds the neighbor campaign. The property never goes quiet
              between renewals.
            </p>
          </div>
        </section>

        {/* 5. Platform primitives */}
        <section className="border-b border-bone/5 bg-slate-deep">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="champagne">Platform primitives</Eyebrow>
                <h2 className="mt-4 font-serif text-4xl tracking-[-0.02em] text-bone md:text-5xl">
                  The boring tech that makes{" "}
                  <span className="text-champagne-bright">the magic</span>{" "}
                  possible.
                </h2>
                <p className="mt-6 text-lg leading-[1.6] text-bone/60">
                  We don&rsquo;t reinvent infra. We pick the best vendor in
                  each lane and we wire them so well your shop stops noticing
                  they&rsquo;re there.
                </p>
              </div>
            </ScrollReveal>

            <ul className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PRIMITIVES.map((p, i) => (
                <ScrollReveal key={p.name} delay={i * 0.04}>
                  <li className="h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 transition-colors hover:border-champagne/30">
                    <p
                      className={`font-mono text-xs uppercase tracking-crest ${
                        i % 2 === 0
                          ? "text-champagne-bright"
                          : "text-moss-bright"
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="mt-3 text-[14px] leading-[1.6] text-bone/65">
                      {p.line}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Final CTA */}
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
