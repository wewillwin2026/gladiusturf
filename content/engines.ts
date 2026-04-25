export type EngineTierSlug =
  | "revenue"
  | "lifecycle"
  | "intelligence"
  | "operations"
  | "marketplace";

export type Engine = {
  number: string;
  slug: string;
  name: string;
  outcome: string;
  description: string;
  tier: EngineTierSlug;
};

export const ENGINES: Engine[] = [
  // ─── TIER 1: Revenue ───
  {
    number: "01",
    slug: "quote-intercept",
    name: "Quote Intercept",
    outcome: "$14,200/mo saved deals",
    description:
      "Estimates that would otherwise die in voicemail get routed, re-priced, and closed. The average shop loses a third of its pipeline to quotes that sit for more than 24 hours — Intercept won't let yours.",
    tier: "revenue",
  },
  {
    number: "02",
    slug: "quickhook",
    name: "QuickHook",
    outcome: "60-second first-touch · +21% same-week conversion",
    description:
      "Service inquiry arrives. Within 60 seconds, AI texts the customer with crew availability + click-to-book link. Pre-fills service type, season, and customer timezone before your phone rings. Industry first-touch is 98 minutes; ours is sub-1.",
    tier: "revenue",
  },
  {
    number: "03",
    slug: "upsell-whisperer",
    name: "Upsell Whisperer",
    outcome: "+$38,000/mo additional revenue",
    description:
      "Every existing property gets a continuous scan for aeration, overseeding, mulch refresh, drainage, irrigation. The system tells the crew — and the client — exactly what to add, when, and why. No awkward sales pitch required.",
    tier: "revenue",
  },
  {
    number: "04",
    slug: "referral-radar",
    name: "Referral Radar",
    outcome: "$180,000/yr recovered revenue",
    description:
      "Your best crews generate referrals. Your worst ones kill them. Radar tracks which properties produce new business, which reps lose it, and fires the next-door outreach before the neighbor calls a competitor.",
    tier: "revenue",
  },
  {
    number: "05",
    slug: "voicequote",
    name: "VoiceQuote",
    outcome: "+41% faster quoting · +37% close rate",
    description:
      "Crew chief on the phone with the homeowner: \"Add mulch, upgrade to commercial cut, push to April 15.\" VoiceQuote captures the changes, updates the estimate live, checks crew + applicator availability, and tells the customer the new total before they hang up. No iPad. No stylus. Just voice.",
    tier: "revenue",
  },
  {
    number: "06",
    slug: "property-hunter",
    name: "Property Hunter",
    outcome: "+15-20% acquisition rate vs cold",
    description:
      "Paste a Zillow URL or a phone number. AI drafts a property-specific intro: \"We manage 12 yards on your block — can we quote yours?\" Tracks negotiation stage (queued / sent / replied / negotiating / converted). Auto-escalates hot prospects to managers.",
    tier: "revenue",
  },
  {
    number: "07",
    slug: "ghost-recovery",
    name: "Ghost Recovery",
    outcome: "+51% quote-to-close on dead leads · 90-day win rate +47%",
    description:
      "Customer ghosted on a quote. Day 1: pattern-interrupt SMS. Day 3: value drop with before/after photos. Day 7: no-oriented question (Voss). Day 14: new service hook. 50% of \"dead\" landscape leads buy within 90 days — Ghost Recovery catches them.",
    tier: "revenue",
  },
  {
    number: "08",
    slug: "servicemagnet",
    name: "ServiceMagnet",
    outcome: "+48% reactivation · 6-month-old leads converted",
    description:
      "You add a new service (spring aeration, deck sealing, hardscape design). ServiceMagnet semantically matches every past lead who showed interest — even 180 days back — and pings them: \"Just launched aeration + overseed. Saw you were asking last spring. Want pricing?\" Sales from customers you'd already written off.",
    tier: "revenue",
  },

  // ─── TIER 2: Lifecycle ───
  {
    number: "09",
    slug: "client-portal",
    name: "Client Portal",
    outcome: "73% fewer 'when are you coming?' calls",
    description:
      "Your branded portal for the homeowner. They reschedule visits, book new services, pay invoices, approve change orders, and see job history — all from one self-serve link. Your crew's logo, your colors. The phone stops ringing for status updates.",
    tier: "lifecycle",
  },
  {
    number: "10",
    slug: "cadence",
    name: "Cadence",
    outcome: "+24% retention · $12,800/mo recovered late invoices",
    description:
      "The intelligent follow-up brain. Post-service feedback within six hours. Late-payment cadences that warm before they escalate (Day 3 / 7 / 14, then human handoff). Seasonal reminders timed to NOAA — fall cleanup, snow contracts, spring fert, mosquito, leaf. Every message personalized from Site Memory.",
    tier: "lifecycle",
  },
  {
    number: "11",
    slug: "site-memory",
    name: "Site Memory",
    outcome: "6mo → 6wk new-hire onboarding",
    description:
      "The gate code. The dog. The sprinkler zone that leaks. The client's deck chairs. Every crew handoff carries a hundred small facts — Memory captures them on the first visit and hands them to every new hire for the next six years.",
    tier: "lifecycle",
  },
  {
    number: "12",
    slug: "weather-pivot",
    name: "Weather Pivot",
    outcome: "zero complaint calls on storm days",
    description:
      "Rain tomorrow? Pivot reshuffles the route, texts every client with the new window, and re-sequences the chemical-safe days. The client knows before they wonder. You stop fielding angry calls the morning of.",
    tier: "lifecycle",
  },
  {
    number: "13",
    slug: "showrate-max",
    name: "ShowRate Max",
    outcome: "38% → 71% show rate · -58% no-shows",
    description:
      "Seven-touch confirmation lifecycle: book → instant SMS → day-before reminder → morning-of nudge → hour-before pre-arrival → 15-min-late recovery → 30-min no-show rebook → next-day rescue. Each touch is archetype-aware: BUSY_PRO gets terse, ANXIOUS_FIRST_TIMER gets reassurance.",
    tier: "lifecycle",
  },
  {
    number: "14",
    slug: "lifehook",
    name: "LifeHook",
    outcome: "+76% conversion on life-event touches",
    description:
      "AI listens for life triggers in customer conversations: moved, getting married, new baby, downsizing. Triggers specialty playbooks. \"Congrats on the new house — our spring refresh includes soil testing and irrigation. Want a same-week quote?\" Messages that hit the moment outperform generic by 76%.",
    tier: "lifecycle",
  },

  // ─── TIER 3: Intelligence ───
  {
    number: "15",
    slug: "intent-scorer",
    name: "Intent Scorer",
    outcome: "+34% appointment show rate · 67% first-touch conversion",
    description:
      "Every service inquiry is scored 1-100 (intent), classified (mowing / fert / irrigation / hardscape), sentiment-flagged (urgent / budget-conscious / premium), and gets a Claude-drafted first-touch SMS — before your crew chief opens the app.",
    tier: "intelligence",
  },
  {
    number: "16",
    slug: "urgencysync",
    name: "UrgencySync",
    outcome: "Crew dispatch -48% time · emergency accuracy +71%",
    description:
      "Real-time 0-100 temperature score on every inbound message. \"My lawn's been dead two weeks\" spikes red. Dispatcher sees the queued jobs color-coded: RED (emergency callout), YELLOW (premium upsell), GREEN (routine). Lawn care has never had this.",
    tier: "intelligence",
  },
  {
    number: "17",
    slug: "toneradar",
    name: "ToneRadar",
    outcome: "73% accurate ghost prediction · -72% engagement-drop latency",
    description:
      "Reads the meta of how customers write. 40-word messages collapse to 3-word replies = ghosting predictor fires. Pronoun shifts (\"I\" → \"we\") flag a decision-unit expansion. Triggers Ghost Recovery before contact dies.",
    tier: "intelligence",
  },
  {
    number: "18",
    slug: "winmemory",
    name: "WinMemory",
    outcome: "+22% response quality · +19% deal velocity",
    description:
      "Every closed deal is embedded into a vector store. New inquiry comes in — AI retrieves the 3 most similar past wins and feeds them as few-shot examples to the response prompt. Your AI literally learns from every win, forever.",
    tier: "intelligence",
  },
  {
    number: "19",
    slug: "market-anchor",
    name: "Market Anchor",
    outcome: "+12% average ticket · +8% win rate",
    description:
      "Every quote is anchored to real neighborhood comps + your historical margin. \"Median for 0.5-acre weekly is $67. You can deliver at $72. Three comparable jobs this ZIP closed at 89% at $70.\" Confidence up. Discount pressure down.",
    tier: "intelligence",
  },
  {
    number: "20",
    slug: "lri-score",
    name: "LRI Score",
    outcome: "0-100 outcome benchmark · peer cohort visibility",
    description:
      "Landscaping Revenue Intelligence in a single number. A 0-100 score per crew, per yard. Combines quote win rate, on-time arrival, customer satisfaction, safety incidents, repeat rate. Visible to ops + portable across employers if a crew changes shops.",
    tier: "intelligence",
  },

  // ─── TIER 4: Operations ───
  {
    number: "21",
    slug: "safety-shield",
    name: "Safety Shield",
    outcome: "avoid $25K+ in state fines · OSHA heat compliance",
    description:
      "Pesticide license tracking + drift logs + weather-hold windows + OSHA heat-stress rules (don't dispatch crews to work in 95°F+ without rotation) + crew CPR + equipment safety audits. One shield, every regulator.",
    tier: "operations",
  },
  {
    number: "22",
    slug: "quality-radar",
    name: "Quality Radar",
    outcome: "-15% rework · +$12K/yr margin recovered",
    description:
      "Pre-work photo set (existing sod, soil grade, irrigation access) + post-work photo set + checklist. AI flags failures before the crew leaves the property. Catch rework on-site, not in a Day-3 customer complaint.",
    tier: "operations",
  },
  {
    number: "23",
    slug: "operator-score",
    name: "Operator Score",
    outcome: "+12% crew retention · marketplace bidding",
    description:
      "Every crew chief carries a portable score: on-time rate, satisfaction, safety record, repeat-customer rate. Survives employer change. Premium shops bid for high-Score crews. Solves the labor shortage.",
    tier: "operations",
  },
  {
    number: "24",
    slug: "field-crew-app",
    name: "Field Crew App",
    outcome: "-30 min setup per job · +8 jobs/week",
    description:
      "Offline-first PWA. Crew chief opens the day's route on a flip phone in a no-service zone. Job cards cache. Photos batch-upload when signal returns. GPS clock-in, signature capture, customer signoff — all offline-capable.",
    tier: "operations",
  },
  {
    number: "25",
    slug: "job-costing",
    name: "Job Costing",
    outcome: "discover crew profitability per job",
    description:
      "Line-item per job: material cost (sod, seed, mulch, fert), labor hours by crew member, equipment burn (mower run-time, aerator passes), site-access premium. Reveal which crews and which sites are actually margin-positive.",
    tier: "operations",
  },

  // ─── TIER 5: Marketplace ───
  {
    number: "26",
    slug: "surplus-yard",
    name: "Surplus Yard",
    outcome: "$20K–$60K/yr recaptured margin",
    description:
      "Leftover sod, mulch, stone, trees, equipment — the stuff that rots in the yard becomes revenue. Post it to the Surplus Yard marketplace, sell it to a crew across town, collect payment without leaving the app.",
    tier: "marketplace",
  },
  {
    number: "27",
    slug: "knowledge-codex",
    name: "Knowledge Codex",
    outcome: "6-month → 6-week onboarding for crew leads",
    description:
      "Retiring foreman records a video on overseeding cadence. Auto-transcribed, tagged, indexed. New crew lead searches \"spring fert timing\" — gets the 3 most relevant clips with timestamps. Tribal knowledge becomes company memory.",
    tier: "marketplace",
  },

  // ─── Books · Payroll · Retention (first-party financial spine) ───
  {
    number: "28",
    slug: "books",
    name: "Books",
    outcome: "real-time P&L · zero double-entry",
    description:
      "First-party general ledger built for landscape ops. Every paid invoice, every Stripe payout, every Surplus Yard sale, every fuel receipt flows into a real chart of accounts in real time. AI categorizes expenses from a photo of the receipt — no clerk needed. P&L by service line (mowing / fert / hardscape / snow), per-crew, per-property. Audit-ready balance sheet on demand.",
    tier: "operations",
  },
  {
    number: "29",
    slug: "expense-brain",
    name: "Expense Brain",
    outcome: "97% auto-categorized · 4-hr admin/wk reclaimed",
    description:
      "Photograph a fuel receipt, mulch invoice, equipment repair bill — Expense Brain reads it (Claude vision), categorizes it (Fuel / Materials / Equipment / Subcontractor), matches it to the right job (Job Costing engine knows which crew was where), and posts the journal entry. The 4-hour weekly bookkeeping huddle becomes a 15-minute review.",
    tier: "operations",
  },
  {
    number: "30",
    slug: "payroll",
    name: "Payroll",
    outcome: "GPS-verified hours · W-2 + 1099 ready",
    description:
      "Crew hours pulled from Field Crew App GPS clock-in / clock-out (no more paper time sheets, no more 'I was there at 7' disputes). Multi-state tax tables, OT calc, prevailing-wage rules for municipal jobs. W-2 export for full-time crews. 1099-NEC for subcontractors, with vendor TIN collection on first job.",
    tier: "operations",
  },
  {
    number: "31",
    slug: "tax-engine",
    name: "Tax Engine",
    outcome: "sales tax by ZIP · mileage log · 1099-NEC",
    description:
      "Sales tax calculated on every invoice by jurisdiction (Stripe Tax integrated, every county). Per-vehicle mileage log auto-generated from GPS data. Schedule C / Schedule E summaries on demand. 1099-NEC packets for the subcontractor cohort prepped by Jan 15.",
    tier: "operations",
  },
  {
    number: "32",
    slug: "retention-radar",
    name: "Retention Radar",
    outcome: "churn predicted 60 days out · +18% NRR",
    description:
      "Watches every customer for churn signals: payment delays, response-time decay (ToneRadar feed), seasonal lapse, declining service revenue, increasing complaint count. Predicts churn 60 days out with a confidence score. Triggers a save play (Cadence personalized cadence + crew chief outreach) before the customer cancels. Net Revenue Retention is the only metric we obsess over.",
    tier: "marketplace",
  },
  {
    number: "33",
    slug: "ltv-ledger",
    name: "LTV Ledger",
    outcome: "true LTV per customer · payback by segment",
    description:
      "Per-customer lifetime value computed from real revenue minus real cost (Job Costing feed). Cohort analysis: Q2 2025 customers vs Q2 2026. Segment ROI: weekly mowing customers vs hardscape one-offs vs fert programs. Payback period by acquisition source. The first time landscape ops have known what their customers are actually worth.",
    tier: "marketplace",
  },
];
