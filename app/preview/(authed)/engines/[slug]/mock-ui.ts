import {
  Bell,
  Cloud,
  Cpu,
  Database,
  Eye,
  Fingerprint,
  MessageSquare,
  Phone,
  Sparkles,
  Truck,
  UserPlus,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type CellKind = "text" | "muted" | "money" | "pill" | "score";
export type EngineMockCell = { kind: CellKind; value: string };
export type EngineMockRow = { cells: EngineMockCell[] };
export type EngineMockStep = { icon: LucideIcon; title: string; body: string };
export type EngineMockKpi = { label: string; value: string; delta: string };

export type EngineMock = {
  title: string;
  subtitle: string;
  todayFires: string;
  weeklyFires: string;
  kpis: EngineMockKpi[];
  columns: string[];
  rows: EngineMockRow[];
  steps: EngineMockStep[];
};

const DEFAULT_STEPS: EngineMockStep[] = [
  {
    icon: Database,
    title: "Pull the signal",
    body: "Engine watches inbound + property data continuously. No manual triggers. Picks up the right context the moment it changes.",
  },
  {
    icon: Cpu,
    title: "Decide the play",
    body: "AI grades the situation, picks the right next move, drafts the message or task, anchors to your historical patterns.",
  },
  {
    icon: Sparkles,
    title: "Fire and learn",
    body: "Sends the message, books the slot, dispatches the crew. Logs the outcome. Tomorrow's version is sharper than today's.",
  },
];

function row(...cells: EngineMockCell[]): EngineMockRow {
  return { cells };
}
function t(value: string): EngineMockCell {
  return { kind: "text", value };
}
function m(value: string): EngineMockCell {
  return { kind: "muted", value };
}
function $(value: string): EngineMockCell {
  return { kind: "money", value };
}
function p(value: string): EngineMockCell {
  return { kind: "pill", value };
}
function s(value: string): EngineMockCell {
  return { kind: "score", value };
}

const REVENUE_DEFAULT: EngineMock = {
  title: "Live pipeline · Last 24 hours",
  subtitle: "Auto-pulled from inbound + property feed",
  todayFires: "47",
  weeklyFires: "318",
  kpis: [
    { label: "Pipeline added", value: "$28,420", delta: "+22% vs last week" },
    { label: "Conversions", value: "9", delta: "+3 today" },
    { label: "Avg first touch", value: "57s", delta: "-12s this week" },
    { label: "Win rate", value: "41%", delta: "+6 pts" },
  ],
  columns: ["When", "Customer", "Action", "Status", "Value"],
  rows: [
    row(m("12 min ago"), t("Maple Hollow Estates"), m("Voicemail closed by AI"), p("Booked"), $("$4,200")),
    row(m("31 min ago"), t("Dana Krasner"), m("Web form replied · 47s"), p("Booked"), $("$890")),
    row(m("47 min ago"), t("Rivera Holdings"), m("Quote re-priced + sent"), p("Sent"), $("$11,400")),
    row(m("1 hr ago"), t("Tom Lyons"), m("Day-3 SMS · before/after photos"), p("Replied"), $("$2,100")),
    row(m("2 hr ago"), t("Hampton Pools HOA"), m("Drift log re-routed"), p("Closed"), $("$6,840")),
    row(m("3 hr ago"), t("West Loop Residents"), m("Neighbor outreach fired"), p("Queued"), $("$3,200")),
  ],
  steps: DEFAULT_STEPS,
};

const LIFECYCLE_DEFAULT: EngineMock = {
  title: "Customer lifecycle · This week",
  subtitle: "Touches that don't read like touches",
  todayFires: "62",
  weeklyFires: "407",
  kpis: [
    { label: "Retention", value: "94.2%", delta: "+2.1 pts QoQ" },
    { label: "Avg LTV", value: "$8,640", delta: "+$420" },
    { label: "Reschedule rate", value: "11%", delta: "-4 pts" },
    { label: "Self-serve %", value: "68%", delta: "+8 pts" },
  ],
  columns: ["Property", "Last visit", "Next touch", "Status", "LTV"],
  rows: [
    row(t("2231 Lakeshore Dr"), m("Apr 24 · cleanup"), m("Apr 30 · fert reminder"), p("On track"), $("$11,800")),
    row(t("Beaumont House"), m("Apr 22 · invoice late"), m("Today · founder call"), p("At risk"), $("$8,400")),
    row(t("Oak Ridge HOA"), m("Apr 27 · weekly mow"), m("May 3 · aeration sell-up"), p("On track"), $("$24,200")),
    row(t("44 Hawthorne"), m("Apr 25 · drainage fix"), m("May 2 · check-in"), p("On track"), $("$3,140")),
    row(t("Riverside Plaza"), m("Apr 23 · turf renew"), m("Auto · life-event nudge"), p("Warm"), $("$18,500")),
  ],
  steps: DEFAULT_STEPS,
};

const INTEL_DEFAULT: EngineMock = {
  title: "Intelligence layer · Continuous scoring",
  subtitle: "Every inbound graded before your phone rings",
  todayFires: "184",
  weeklyFires: "1,242",
  kpis: [
    { label: "Hot leads", value: "23", delta: "+11 today" },
    { label: "Median score", value: "67/100", delta: "+4 pts" },
    { label: "Ghost predictions", value: "73% acc.", delta: "+3 pts" },
    { label: "Win-memory hits", value: "418", delta: "library ↑" },
  ],
  columns: ["Inbound", "Channel", "Grade", "Vibe", "Suggested play"],
  rows: [
    row(t("Sara P. · 0.4 acre"), m("SMS"), s("88"), p("Premium"), m("Send VoiceQuote draft")),
    row(t("Mike R. · weekly mow"), m("Web"), s("71"), p("Urgent"), m("Same-day callout")),
    row(t("HOA · Heron Cove"), m("Email"), s("64"), p("Budget"), m("Anchored bundle")),
    row(t("Tom L. (returning)"), m("SMS"), s("82"), p("Repeat"), m("WinMemory template")),
    row(t("Anonymous web inq."), m("Web"), s("44"), p("Tire kicker"), m("InstantText only")),
  ],
  steps: DEFAULT_STEPS,
};

const OPS_DEFAULT: EngineMock = {
  title: "Ops · Today's crews",
  subtitle: "GPS-clocked. Compliance-clean. Margin-aware.",
  todayFires: "8",
  weeklyFires: "53",
  kpis: [
    { label: "Crews live", value: "4", delta: "all clocked in" },
    { label: "On-time rate", value: "97%", delta: "+5 pts MTD" },
    { label: "Rework flagged", value: "1", delta: "caught on-site" },
    { label: "Margin · today", value: "$3,820", delta: "real-time" },
  ],
  columns: ["Crew", "Stops", "Window", "Status", "Margin"],
  rows: [
    row(t("Riverside North"), m("9 stops"), m("7:00–14:00"), p("Live"), $("$1,420")),
    row(t("Riverside East"), m("7 stops"), m("7:30–13:30"), p("Live"), $("$980")),
    row(t("Riverside South"), m("6 stops · hardscape"), m("8:00–16:00"), p("Live"), $("$1,140")),
    row(t("Riverside West"), m("11 stops · mowing"), m("6:30–15:00"), p("Live"), $("$280")),
  ],
  steps: DEFAULT_STEPS,
};

const MARKETPLACE_DEFAULT: EngineMock = {
  title: "Network layer · The compounding tier",
  subtitle: "Surplus, knowledge, save plays, ledger truth",
  todayFires: "21",
  weeklyFires: "147",
  kpis: [
    { label: "Surplus listed", value: "$12,840", delta: "9 listings live" },
    { label: "Save plays", value: "4 fired", delta: "2 saves confirmed" },
    { label: "Codex clips", value: "182", delta: "+6 this week" },
    { label: "Avg LTV view", value: "$8,640", delta: "by segment" },
  ],
  columns: ["Item / Customer", "Tier signal", "Action", "Status", "Value"],
  rows: [
    row(t("Sod · 240 sq ft pallet"), m("Surplus Yard"), m("Posted regional"), p("Listed"), $("$420")),
    row(t("Beaumont House"), m("Save Play"), m("Founder call queued"), p("At risk"), $("$8,400")),
    row(t("Mulch refresh program"), m("Customer Worth"), m("Q2 cohort flagged"), p("Insight"), $("$23,100")),
    row(t("Foreman 'spring fert' clip"), m("Foreman's Notebook"), m("3 new hires watched"), p("Indexed"), $("—")),
    row(t("Riverside Plaza"), m("Save Play"), m("Save confirmed · stayed"), p("Saved"), $("$18,500")),
  ],
  steps: DEFAULT_STEPS,
};

// Engine-specific mocks for the most-likely-to-be-clicked engines during a sales demo.
const ENGINE_OVERRIDES: Partial<Record<string, EngineMock>> = {
  "quote-intercept": {
    title: "Quote Intercept · Voicemail-to-close",
    subtitle: "Estimates that would have died in voicemail",
    todayFires: "9",
    weeklyFires: "61",
    kpis: [
      { label: "Saved deals · MTD", value: "$14,200", delta: "+18.4%" },
      { label: "Avg recovery time", value: "4m 12s", delta: "-1m vs Mar" },
      { label: "Voicemails closed", value: "62%", delta: "+9 pts" },
      { label: "Re-priced higher", value: "27", delta: "anchor wins" },
    ],
    columns: ["Inbound", "Customer", "Original quote", "Closed at", "Status"],
    rows: [
      row(m("12 min ago"), t("Maple Hollow Estates"), m("$3,800 · stale 3 days"), $("$4,200"), p("Booked")),
      row(m("47 min ago"), t("Rivera Holdings"), m("$10,400 · stale 1 day"), $("$11,400"), p("Sent")),
      row(m("2 hr ago"), t("Hampton Pools HOA"), m("$6,200 · re-routed"), $("$6,840"), p("Closed")),
      row(m("Yesterday"), t("Cardinal Homes"), m("$2,200 · ghost-bound"), $("$2,400"), p("Closed")),
      row(m("Yesterday"), t("Lakeshore HOA"), m("$8,400 · 4-day old"), $("$8,400"), p("Pending")),
    ],
    steps: [
      {
        icon: Phone,
        title: "Voicemail lands",
        body: "Inbound voicemail or web inquiry hits the system. Within 60 seconds, AI pulls customer history + property record + any prior quote.",
      },
      {
        icon: Cpu,
        title: "Re-price + anchor",
        body: "Market Anchor checks the neighborhood. WinPlaybook pulls the 3 closest past wins. The system drafts a re-price with a moss-bright explanation.",
      },
      {
        icon: Sparkles,
        title: "Close the loop",
        body: "Texts the homeowner with the new estimate, books the walkthrough slot, syncs to crew calendar. You see it — and approve in one tap — only if needed.",
      },
    ],
  },
  quickhook: {
    title: "InstantText · Sub-60-second first touch",
    subtitle: "98 minutes is the industry average. Yours is 47s.",
    todayFires: "31",
    weeklyFires: "204",
    kpis: [
      { label: "Avg first-touch", value: "47s", delta: "-12s this week" },
      { label: "Same-week conv.", value: "+21%", delta: "validated" },
      { label: "After-hours catches", value: "48%", delta: "of total inbound" },
      { label: "Self-book %", value: "61%", delta: "no human needed" },
    ],
    columns: ["Inbound", "Channel", "First touch", "Booked?", "Service"],
    rows: [
      row(m("8:42 PM"), t("Dana Krasner"), m("Web form"), s("47s"), p("Aeration")),
      row(m("7:13 AM"), t("Mike R."), m("SMS"), s("31s"), p("Weekly mow")),
      row(m("11:02 PM"), t("HOA · Heron"), m("Email"), s("2m 04s"), p("Bid pending")),
      row(m("6:18 AM"), t("Tom L."), m("Web"), s("52s"), p("Drainage")),
      row(m("5:51 AM"), t("Sara P."), m("SMS"), s("38s"), p("Hardscape")),
    ],
    steps: DEFAULT_STEPS,
  },
  "ghost-recovery": {
    title: "Ghost Recovery · 50% of dead leads buy within 90 days",
    subtitle: "The 4-touch sequence that doesn't read like sales chase",
    todayFires: "14",
    weeklyFires: "92",
    kpis: [
      { label: "Resurrected · 90d", value: "51%", delta: "win rate" },
      { label: "Pipeline rescued", value: "$48,200", delta: "MTD" },
      { label: "Touches in flight", value: "73", delta: "across 4 stages" },
      { label: "Avg days to close", value: "21", delta: "from ghost → close" },
    ],
    columns: ["Customer", "Ghosted on", "Stage", "Last touch", "Pipeline"],
    rows: [
      row(t("Tom Lyons"), m("$2,100 quote · Apr 11"), p("Day 7"), m("No-pressure question"), $("$2,100")),
      row(t("Maria Quintana"), m("$3,400 quote · Apr 8"), p("Day 14"), m("Seasonal hook · spring fert"), $("$3,400")),
      row(t("Hampton Pools"), m("$6,840 · Apr 17"), p("Day 3"), m("Before/after photos sent"), $("$6,840")),
      row(t("Riverside Plaza"), m("$18,500 · Mar 28"), p("Won"), m("Closed Apr 22"), $("$18,500")),
      row(t("44 Hawthorne"), m("$3,140 · Apr 4"), p("Day 14"), m("New-service hook"), $("$3,140")),
    ],
    steps: [
      {
        icon: MessageSquare,
        title: "Day 1: a soft signal",
        body: "Short SMS that doesn't read like a sales chase. \"Hey, the spot opened up. Want me to hold it?\" Built off the customer's exact stated context.",
      },
      {
        icon: Eye,
        title: "Day 3 + 7: proof + breath",
        body: "Day 3 sends before/after photos from a job you actually finished nearby. Day 7 sends a no-pressure question — gives the customer a way to say no without ghosting.",
      },
      {
        icon: Sparkles,
        title: "Day 14: the seasonal hook",
        body: "A new-service hook tuned to the season + the customer's prior interest. ServiceMagnet decides which to send. Half of dead leads buy within 90 days — Ghost Recovery is what catches them.",
      },
    ],
  },
  "weather-pivot": {
    title: "Weather Pivot · Friday route at risk",
    subtitle: "NOAA flagged 70% rain probability mid-day",
    todayFires: "1",
    weeklyFires: "4",
    kpis: [
      { label: "Visits affected", value: "18", delta: "Fri route" },
      { label: "Customers texted", value: "18 / 18", delta: "100%" },
      { label: "Complaint calls", value: "0", delta: "this storm" },
      { label: "Reshuffle saves", value: "$2,940", delta: "in margin" },
    ],
    columns: ["Customer", "Original window", "New window", "Confirmed?", "Service"],
    rows: [
      row(t("Beaumont House"), m("Fri 8:00–10:00"), m("Sat 9:00–11:00"), p("Yes"), m("Weekly mow")),
      row(t("Lakeshore HOA"), m("Fri 10:30–12:30"), m("Mon 7:00–9:00"), p("Yes"), m("Edging + blow")),
      row(t("44 Hawthorne"), m("Fri 13:00–14:30"), m("Sat 14:00–15:30"), p("Yes"), m("Mulch refresh")),
      row(t("Hampton Pools"), m("Fri 14:30–17:00"), m("Sat 12:00–14:30"), p("Yes"), m("Hardscape edging")),
      row(t("Cardinal Homes"), m("Fri 11:00–12:00"), m("Sat 10:00–11:00"), p("Yes"), m("Cleanup")),
    ],
    steps: [
      {
        icon: Cloud,
        title: "NOAA + radar continuously polled",
        body: "Engine pulls forecast for every active route's geofence every 30 minutes. Triggers reshuffle when probability > 60% in the work window.",
      },
      {
        icon: Truck,
        title: "Route auto-resequenced",
        body: "Picks the next dry window. Re-orders by drive time. Holds chemical-safe windows (no fert in 24h before rain). Pushes the new route to crew chiefs.",
      },
      {
        icon: MessageSquare,
        title: "Customers told before they wonder",
        body: "Every affected customer texted with new window + reason. Self-serve reschedule link. Phone stops ringing the morning of.",
      },
    ],
  },
  "retention-radar": {
    title: "Save Play · Predicting churn 60 days early",
    subtitle: "The signals nobody picks up on, until it's too late",
    todayFires: "2",
    weeklyFires: "11",
    kpis: [
      { label: "At-risk customers", value: "9", delta: "$92,400 LTV" },
      { label: "Save rate", value: "67%", delta: "of fired plays" },
      { label: "Plays in flight", value: "4", delta: "this week" },
      { label: "LTV saved · MTD", value: "$31,400", delta: "+$11k" },
    ],
    columns: ["Customer", "Risk score", "Signal", "Play", "LTV"],
    rows: [
      row(t("Beaumont House"), s("82"), m("Reply latency 2× + 2 invoice delays"), p("Founder call"), $("$8,400")),
      row(t("HOA · Heron Cove"), s("71"), m("3 complaint calls in 30d"), p("Crew swap"), $("$24,200")),
      row(t("Cardinal Homes"), s("64"), m("Seasonal lapse + payment slip"), p("Personalized check-in"), $("$5,800")),
      row(t("Lakeshore"), s("58"), m("Tone shift in last 2 messages"), p("ToneRadar nudge"), $("$11,800")),
      row(t("Riverside Plaza"), s("39"), m("Recovered last quarter"), p("Watch only"), $("$18,500")),
    ],
    steps: [
      {
        icon: Fingerprint,
        title: "Watches every weak signal",
        body: "Payment delays, slower replies, seasonal lapse, complaint frequency, declining service revenue. ToneRadar feeds reply tone. Each weighted to a churn probability.",
      },
      {
        icon: Bell,
        title: "Predicts 60 days out",
        body: "Score crosses 50 → flagged. Score crosses 70 → save play queued. Confidence shown so you trust the call. False-positive rate tuned per-shop over time.",
      },
      {
        icon: Sparkles,
        title: "Fires the right save play",
        body: "Personalized follow-up + crew chief phone call + service-credit if appropriate. The customer feels seen before they cancel — not after.",
      },
    ],
  },
  "client-portal": {
    title: "Client Portal · Self-serve everything",
    subtitle: "Your branded portal. Phone stops ringing.",
    todayFires: "184",
    weeklyFires: "1,402",
    kpis: [
      { label: "Self-serve %", value: "68%", delta: "+8 pts" },
      { label: "'When are you coming' calls", value: "-73%", delta: "since launch" },
      { label: "Reschedules", value: "412", delta: "all self-serve" },
      { label: "Online payments", value: "$84,200", delta: "MTD" },
    ],
    columns: ["Customer action", "When", "Through portal?", "Channel", "Outcome"],
    rows: [
      row(t("Reschedule visit"), m("12 min ago"), p("Yes"), m("Mobile portal"), m("New slot booked")),
      row(t("Approve change order"), m("1 hr ago"), p("Yes"), m("Email link"), m("Auto-charged")),
      row(t("Pay invoice"), m("2 hr ago"), p("Yes"), m("Portal · ApplePay"), $("$840")),
      row(t("Book new service"), m("3 hr ago"), p("Yes"), m("Portal"), m("Aeration · Tue")),
      row(t("View job history"), m("Today"), p("Yes"), m("Portal"), m("23 visits viewed")),
    ],
    steps: DEFAULT_STEPS,
  },
  "field-crew-app": {
    title: "Field Crew App · Offline-first PWA",
    subtitle: "Works on a flip phone in a no-service zone",
    todayFires: "53",
    weeklyFires: "412",
    kpis: [
      { label: "Setup time / job", value: "-30 min", delta: "vs paper" },
      { label: "Offline syncs", value: "187", delta: "this week" },
      { label: "GPS clock-ins", value: "100%", delta: "no paper" },
      { label: "+jobs / week", value: "+8", delta: "per crew" },
    ],
    columns: ["Crew", "Job", "Status", "Sync", "Notes"],
    rows: [
      row(t("Riverside North"), m("Beaumont · weekly mow"), p("In progress"), m("Last sync 7:42"), m("Offline — caching")),
      row(t("Riverside North"), m("Lakeshore · cleanup"), p("Complete"), m("Synced"), m("Photos: 12 · sig'd")),
      row(t("Riverside East"), m("Hampton Pools"), p("In progress"), m("Live"), m("Hardscape edging")),
      row(t("Riverside South"), m("Cardinal · drainage"), p("Queued"), m("Cached"), m("Awaiting GPS")),
      row(t("Riverside West"), m("HOA Heron · 11 stops"), p("Live"), m("Live"), m("On schedule")),
    ],
    steps: DEFAULT_STEPS,
  },
  "surplus-yard": {
    title: "Surplus Yard · Marketplace listings",
    subtitle: "Leftover sod, mulch, stone become revenue",
    todayFires: "6",
    weeklyFires: "32",
    kpis: [
      { label: "Listings live", value: "9", delta: "$12,840 inventory" },
      { label: "Sold · MTD", value: "$8,420", delta: "+22%" },
      { label: "Avg time to sell", value: "2.4 days", delta: "-0.8 vs Mar" },
      { label: "Buyers in network", value: "47", delta: "regional" },
    ],
    columns: ["Item", "Quantity", "Listed at", "Status", "Buyer"],
    rows: [
      row(t("Sod · Bermuda"), m("240 sq ft"), $("$420"), p("Listed"), m("—")),
      row(t("Mulch · hardwood"), m("18 cu yd"), $("$640"), p("Negotiating"), m("Hampton Pools")),
      row(t("River rock · 2-3in"), m("4 tons"), $("$1,840"), p("Sold"), m("44 Hawthorne")),
      row(t("Aerator · spare cores"), m("set of 24"), $("$120"), p("Listed"), m("—")),
      row(t("Boxwoods · 3-gal"), m("32 plants"), $("$2,240"), p("Pending pickup"), m("Cardinal Homes")),
    ],
    steps: DEFAULT_STEPS,
  },
  "ltv-ledger": {
    title: "Customer Worth · True LTV by segment",
    subtitle: "Real revenue minus real cost. Cohort-aware.",
    todayFires: "—",
    weeklyFires: "ledger live",
    kpis: [
      { label: "Top segment LTV", value: "$24,200", delta: "weekly mowing" },
      { label: "Worst segment LTV", value: "$840", delta: "one-off cleanup" },
      { label: "Q2'25 cohort", value: "$8,640", delta: "avg / customer" },
      { label: "Payback (best src)", value: "3.2 mo", delta: "neighbor referrals" },
    ],
    columns: ["Customer", "Segment", "LTV", "Acq. source", "Payback"],
    rows: [
      row(t("Oak Ridge HOA"), m("Weekly mow"), $("$24,200"), m("Referral · Hampton"), m("2.1 mo")),
      row(t("Riverside Plaza"), m("Hardscape program"), $("$18,500"), m("Property Hunter"), m("4.4 mo")),
      row(t("Beaumont House"), m("Premium mow + fert"), $("$8,400"), m("Web · organic"), m("3.1 mo")),
      row(t("Cardinal Homes"), m("Cleanup one-off"), $("$840"), m("Paid · Google"), m("18.2 mo")),
      row(t("Lakeshore HOA"), m("Multi-service"), $("$11,800"), m("Referral · Riverside"), m("2.8 mo")),
    ],
    steps: DEFAULT_STEPS,
  },
};

const DEFAULT_BY_TIER: Record<string, EngineMock> = {
  revenue: REVENUE_DEFAULT,
  lifecycle: LIFECYCLE_DEFAULT,
  intelligence: INTEL_DEFAULT,
  operations: OPS_DEFAULT,
  marketplace: MARKETPLACE_DEFAULT,
};

export function mockUiFor(slug: string, tierSlug?: string): EngineMock {
  const override = ENGINE_OVERRIDES[slug];
  if (override) return override;
  if (tierSlug && DEFAULT_BY_TIER[tierSlug]) return DEFAULT_BY_TIER[tierSlug];
  return REVENUE_DEFAULT;
}
