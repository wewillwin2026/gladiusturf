// Static fake data for the Save Play sandbox demo (/retention/demo).
// All numbers, names, and signals are illustrative — no PII, no real customers.

export type SaveSignalKey =
  | "payment-lag"
  | "reply-lag"
  | "revenue-down"
  | "complaints"
  | "seasonal-lapse"
  | "slow-inbound";

export type SaveSignal = {
  key: SaveSignalKey;
  label: string;
  /** When this signal tripped, e.g. "Apr 14" */
  trippedOn: string;
  /** Plain-English explanation that's been pre-baked for the demo. */
  explanation: string;
};

export type RiskBucket = "critical" | "high" | "watch";

export type AtRiskCustomer = {
  id: string;
  /** Customer or property name. */
  name: string;
  /** Short descriptor: "HOA · 14 units" or "Estate · 4.2 acres". */
  segment: string;
  riskScore: number; // 0–100
  bucket: RiskBucket;
  signals: SaveSignal[];
  lastService: string; // e.g. "Apr 8"
  monthlySpend: number; // dollars/mo
  /** Confidence the customer walks within 60 days (0–100). */
  confidence: number;
  /** AI-drafted save play message body (no greeting wrapper). */
  draftedMessage: string;
};

const sig = (
  key: SaveSignalKey,
  trippedOn: string,
  explanation: string,
): SaveSignal => ({
  key,
  label: SIGNAL_LABEL[key],
  trippedOn,
  explanation,
});

export const SIGNAL_LABEL: Record<SaveSignalKey, string> = {
  "payment-lag": "Payment lag",
  "reply-lag": "Reply lag",
  "revenue-down": "Service revenue down",
  complaints: "More complaints",
  "seasonal-lapse": "Seasonal lapse",
  "slow-inbound": "Slow inbound",
};

export const AT_RISK_CUSTOMERS: AtRiskCustomer[] = [
  {
    id: "c-watson",
    name: "Watson Estate",
    segment: "Estate · 4.2 acres",
    riskScore: 92,
    bucket: "critical",
    confidence: 91,
    lastService: "Apr 8",
    monthlySpend: 2840,
    signals: [
      sig(
        "reply-lag",
        "Apr 14",
        "Watson Estate replied to the last 4 messages within an 11-minute baseline; the May 3 message took 2 days. Reply lag triggered.",
      ),
      sig(
        "payment-lag",
        "Apr 11",
        "March invoice hit 14 days late. First time in 28 invoices. Stripe flipped past-due 12:04am.",
      ),
      sig(
        "revenue-down",
        "Apr 1",
        "March MoM service revenue down 38% — skipped both fert visits and aeration add-on.",
      ),
    ],
    draftedMessage:
      "Hey John — wanted to make sure spring cleanup hit the mark on the back acreage. Noticed we skipped the fert pre-treat this round. Anything we should adjust before next visit, or want me to swing by Tuesday and walk it with you?",
  },
  {
    id: "c-pinehurst",
    name: "Pinehurst Greens HOA",
    segment: "HOA · 14 units",
    riskScore: 88,
    bucket: "critical",
    confidence: 87,
    lastService: "Apr 11",
    monthlySpend: 4120,
    signals: [
      sig(
        "complaints",
        "Apr 9",
        "Three board complaints this quarter — edge work on units 3, 7, and 11. Quality Radar flagged photo evidence on the 9th.",
      ),
      sig(
        "reply-lag",
        "Apr 2",
        "Board president replies have collapsed from 40-word threads to 3-word acknowledgments since Mar 18.",
      ),
      sig(
        "slow-inbound",
        "Mar 28",
        "Inbound messages from the HOA went silent 47 days — first silence stretch on record.",
      ),
    ],
    draftedMessage:
      "Hey Diane — saw the unit 7 edge work flagged at the last walk. We're running back through 3, 7, and 11 Thursday with our senior crew chief. Want to ride along, or want me to shoot you photos when we wrap?",
  },
  {
    id: "c-riverbend",
    name: "Riverbend Ranch",
    segment: "Estate · 11 acres",
    riskScore: 81,
    bucket: "critical",
    confidence: 84,
    lastService: "Mar 22",
    monthlySpend: 3260,
    signals: [
      sig(
        "seasonal-lapse",
        "Apr 4",
        "Has booked spring fert + aeration every March-April for 4 years running. Skipped both this season.",
      ),
      sig(
        "payment-lag",
        "Mar 30",
        "February invoice paid 18 days late. Their typical lag is 4 days.",
      ),
    ],
    draftedMessage:
      "Hey Margaret — noticed we haven't booked your spring fert + aeration yet, which is a first in four springs. No pressure either way — wanted to ask if anything's changed on your end before the window closes for the year.",
  },
  {
    id: "c-greene",
    name: "Greene St 4-plex",
    segment: "Multi-family · 4 units",
    riskScore: 76,
    bucket: "critical",
    confidence: 79,
    lastService: "Apr 4",
    monthlySpend: 980,
    signals: [
      sig(
        "revenue-down",
        "Apr 1",
        "Dropped weekly mowing to bi-weekly Mar 12. Service revenue down 42% MoM.",
      ),
      sig(
        "reply-lag",
        "Mar 27",
        "Owner used to reply within an hour; last 3 messages took 2-4 days.",
      ),
      sig(
        "slow-inbound",
        "Mar 14",
        "No inbound messages in 49 days. Baseline is 1 per week.",
      ),
    ],
    draftedMessage:
      "Hey Tom — saw you switched to bi-weekly last month, which usually means budget tightened or something stopped working. Either is fine — would rather know than guess. Want a 5-min call this week to right-size the plan?",
  },
  {
    id: "c-magnolia",
    name: "Magnolia Court HOA",
    segment: "HOA · 22 units",
    riskScore: 68,
    bucket: "high",
    confidence: 71,
    lastService: "Apr 12",
    monthlySpend: 5640,
    signals: [
      sig(
        "complaints",
        "Apr 8",
        "Two complaints in 6 weeks — irrigation timing on cul-de-sac, plus mulch depth at clubhouse.",
      ),
      sig(
        "reply-lag",
        "Apr 5",
        "Board president response time up 3.2x vs trailing 90-day baseline.",
      ),
    ],
    draftedMessage:
      "Hey Susan — wanted to flag we already adjusted the cul-de-sac controllers and topped the clubhouse beds. I'd rather hear it from you than guess: what's still bugging the board?",
  },
  {
    id: "c-clearwater",
    name: "Clearwater Pointe",
    segment: "Commercial · office park",
    riskScore: 64,
    bucket: "high",
    confidence: 68,
    lastService: "Apr 9",
    monthlySpend: 2210,
    signals: [
      sig(
        "payment-lag",
        "Apr 6",
        "March invoice 11 days late. Property manager out on PTO — but historically pays on day 2.",
      ),
      sig(
        "seasonal-lapse",
        "Apr 1",
        "Skipped annual mulch refresh — booked every April for 3 years.",
      ),
    ],
    draftedMessage:
      "Hey Marcus — looks like the spring mulch refresh slipped off the calendar this year. We're holding capacity for you next Wednesday if you want it. Otherwise we'll roll the line item off the renewal.",
  },
  {
    id: "c-oakridge",
    name: "Oakridge Family Trust",
    segment: "Estate · 6.8 acres",
    riskScore: 58,
    bucket: "high",
    confidence: 62,
    lastService: "Apr 3",
    monthlySpend: 1840,
    signals: [
      sig(
        "reply-lag",
        "Apr 1",
        "Owner shifted from same-day replies to 3-4 day cadence over last 30 days.",
      ),
      sig(
        "revenue-down",
        "Mar 28",
        "Cancelled tree trim add-on Mar 14 — recurring line of $480/quarter.",
      ),
    ],
    draftedMessage:
      "Hey Bill — noticed we lost the tree trim line. Want me to revisit the scope? Happy to swap it for something cheaper that still keeps the canopy in shape if budget shifted.",
  },
  {
    id: "c-bridgewater",
    name: "Bridgewater Townhomes",
    segment: "Townhomes · 28 units",
    riskScore: 51,
    bucket: "high",
    confidence: 56,
    lastService: "Apr 10",
    monthlySpend: 3380,
    signals: [
      sig(
        "slow-inbound",
        "Apr 1",
        "No inbound messages in 51 days from the HOA inbox. Typical cadence is 2-3 per month.",
      ),
      sig(
        "reply-lag",
        "Mar 22",
        "Property manager replies have stretched from same-day to ~5 days.",
      ),
    ],
    draftedMessage:
      "Hey Karen — quiet stretch on your end usually means everything's fine, but I'd rather check than assume. Anything we should be doing differently before the spring board meeting?",
  },
  {
    id: "c-summit",
    name: "Summit Hills 12-unit",
    segment: "Multi-family · 12 units",
    riskScore: 42,
    bucket: "watch",
    confidence: 48,
    lastService: "Apr 13",
    monthlySpend: 1620,
    signals: [
      sig(
        "payment-lag",
        "Mar 30",
        "February invoice paid 9 days late. Slight drift from 4-day average.",
      ),
      sig(
        "seasonal-lapse",
        "Apr 1",
        "Has booked seasonal cleanup every April since 2024 — not booked yet.",
      ),
    ],
    draftedMessage:
      "Hey Eric — got the spring cleanup window opening up next week. Want me to slot you in like last year, or did the scope change?",
  },
  {
    id: "c-windsor",
    name: "Windsor Park HOA",
    segment: "HOA · 18 units",
    riskScore: 33,
    bucket: "watch",
    confidence: 39,
    lastService: "Apr 14",
    monthlySpend: 2940,
    signals: [
      sig(
        "complaints",
        "Apr 6",
        "One complaint this quarter — minor, irrigation overshoot on side bed.",
      ),
      sig(
        "reply-lag",
        "Apr 2",
        "Board president response time up 1.6x vs baseline. Within tolerance but trending.",
      ),
    ],
    draftedMessage:
      "Hey Patricia — small thing, but caught the irrigation overshoot on the side bed and dialed it back yesterday. Wanted you to hear it before the next walkthrough.",
  },
];

export type SignalSummary = {
  key: SaveSignalKey;
  label: string;
  count: number;
  /** Sub-line context. */
  detail: string;
};

export const SIGNAL_SUMMARIES: SignalSummary[] = [
  {
    key: "payment-lag",
    label: "Payment lag",
    count: 14,
    detail: "avg 12 days late",
  },
  {
    key: "reply-lag",
    label: "Reply lag",
    count: 9,
    detail: "replies 4× slower than baseline",
  },
  {
    key: "revenue-down",
    label: "Service revenue down",
    count: 6,
    detail: "down ≥30% MoM",
  },
  {
    key: "complaints",
    label: "More complaints",
    count: 3,
    detail: "3+ this quarter",
  },
  {
    key: "seasonal-lapse",
    label: "Seasonal lapse",
    count: 11,
    detail: "skipped expected seasonal service",
  },
  {
    key: "slow-inbound",
    label: "Slow inbound",
    count: 4,
    detail: "inbound message gap > 45 days",
  },
];

/**
 * 12 monthly samples — last 12 months of "Keeping customers %".
 * Drift from 89% (a year ago) to 112% (now). Tagged with annotations
 * at "Save Play live (Aug)" and "Keeping rate crossed 100% (Nov)".
 */
export type KeepingPoint = {
  month: string; // "May", "Jun", ...
  /** Keeping-customers % (i.e. revenue retention proxy). */
  pct: number;
  /** Optional callout text shown next to the dot. */
  annotation?: string;
};

export const KEEPING_TREND: KeepingPoint[] = [
  { month: "May", pct: 89 },
  { month: "Jun", pct: 90 },
  { month: "Jul", pct: 91 },
  { month: "Aug", pct: 93, annotation: "Save Play live" },
  { month: "Sep", pct: 96 },
  { month: "Oct", pct: 99 },
  { month: "Nov", pct: 102, annotation: "Keeping rate crossed 100%" },
  { month: "Dec", pct: 104 },
  { month: "Jan", pct: 106 },
  { month: "Feb", pct: 108 },
  { month: "Mar", pct: 110 },
  { month: "Apr", pct: 112 },
];

export type CohortRow = {
  cohort: string; // "Q1 2025"
  customers: number;
  retained: number;
  walked: number;
  /** Average Customer Worth (lifetime value), dollars. */
  customerWorth: number;
};

export const COHORTS: CohortRow[] = [
  {
    cohort: "Q1 2025",
    customers: 42,
    retained: 38,
    walked: 4,
    customerWorth: 18420,
  },
  {
    cohort: "Q2 2025",
    customers: 51,
    retained: 47,
    walked: 4,
    customerWorth: 19180,
  },
  {
    cohort: "Q3 2025",
    customers: 38,
    retained: 36,
    walked: 2,
    customerWorth: 21340,
  },
  {
    cohort: "Q4 2025",
    customers: 29,
    retained: 27,
    walked: 2,
    customerWorth: 22860,
  },
  {
    cohort: "Q1 2026",
    customers: 46,
    retained: 44,
    walked: 2,
    customerWorth: 24110,
  },
];

export type FollowUpStep = {
  day: string;
  label: string;
  body: string;
};

export const FOLLOW_UP_STEPS: FollowUpStep[] = [
  {
    day: "Day 0",
    label: "AI message goes out",
    body: "Cadence sends the drafted message above the moment you hit Send. Reply-tracking starts the clock.",
  },
  {
    day: "Day 3",
    label: "Foreman call queued",
    body: "If no reply by Day 3, the crew chief who knows the property gets a calendar-blocked call task with the full Site Memory context one tap away.",
  },
  {
    day: "Day 7",
    label: "In-person walk",
    body: "If still no resolution, an in-person walk is scheduled with the owner. Save play closes either way — saved or learned-from.",
  },
];

export const HEADLINE_STATS = {
  atRisk: 23,
  monthlyRevenueAtRisk: 48200,
  keepingRatePct: 112,
  savedThisMonth: 8,
};
