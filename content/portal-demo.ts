/**
 * Fake customer data for the Client Portal sandbox demo at
 * `/portal/demo/[token]`. No PII, no real customers — purely visual.
 * Dates are static strings so the demo reads consistently regardless of when
 * a prospect lands on it.
 */

export type VisitStatus = "scheduled" | "in-progress" | "completed";

export type UpcomingVisit = {
  id: string;
  dateLabel: string;
  isoDate: string;
  service: string;
  serviceDetail: string;
  crewChief: string;
  window: string;
  status: VisitStatus;
};

export type OpenInvoice = {
  id: string;
  number: string;
  description: string;
  serviceDate: string;
  amount: number;
  amountLabel: string;
  dueLabel: string;
  overdue?: boolean;
};

export type CompletedJob = {
  id: string;
  date: string;
  service: string;
  crew: string;
  duration: string;
  notes: string;
  photoCount: number;
  signedBy: string;
};

export type FeedEntry = {
  id: string;
  date: string;
  kind: "visit" | "payment" | "message" | "approval" | "referral";
  title: string;
  detail: string;
};

export const PORTAL_DEMO = {
  customer: {
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah@example.com",
    phone: "(919) 555-0142",
    address: "1247 Oak Lane",
    cityState: "Raleigh, NC 27607",
    sinceLabel: "Customer since March 2024",
  },
  crew: {
    name: "GreenLeaf Crew",
    initials: "GL",
    tagline: "Lawn · Landscape · Hardscape",
    phone: "(919) 555-0188",
    email: "hello@greenleaf-crew.com",
    portalDomain: "portal.greenleaf-crew.com",
  },
  nextVisitHeadline: "Thursday, May 7",
  status: {
    label: "On schedule",
    detail: "Crew confirmed · weather looks clean",
  },
  upcomingVisits: [
    {
      id: "v-001",
      dateLabel: "Thu · May 7",
      isoDate: "2026-05-07",
      service: "Bi-weekly mowing",
      serviceDetail: "Mow + edge + blow · 0.34 acre",
      crewChief: "Marcus Reyes",
      window: "9:00–11:00 AM",
      status: "scheduled",
    },
    {
      id: "v-002",
      dateLabel: "Mon · May 12",
      isoDate: "2026-05-12",
      service: "Spring fert + crab grass pre-emerge",
      serviceDetail: "Granular 24-0-6 + Dimension · soil temp 58°F",
      crewChief: "James Ortega",
      window: "1:00–3:00 PM",
      status: "scheduled",
    },
    {
      id: "v-003",
      dateLabel: "Sat · May 17",
      isoDate: "2026-05-17",
      service: "Mulch refresh",
      serviceDetail: "4 yds triple-shredded hardwood · front + side beds",
      crewChief: "Marcus Reyes",
      window: "8:00–11:00 AM",
      status: "scheduled",
    },
  ] satisfies UpcomingVisit[],
  openInvoices: [
    {
      id: "inv-2118",
      number: "Invoice #2118",
      description: "Spring Cleanup",
      serviceDate: "Apr 28",
      amount: 487.5,
      amountLabel: "$487.50",
      dueLabel: "Due May 15",
    },
    {
      id: "inv-2104",
      number: "Invoice #2104",
      description: "Hardscape touchup · re-sand pavers",
      serviceDate: "Apr 22",
      amount: 215.0,
      amountLabel: "$215.00",
      dueLabel: "Due Apr 30",
      overdue: false,
    },
  ] satisfies OpenInvoice[],
  completedJobs: [
    {
      id: "job-2118",
      date: "Apr 28",
      service: "Spring Cleanup",
      crew: "Marcus + 2 crew",
      duration: "4h 30m",
      notes:
        "Cleared bed leaves, edged front + back, hauled 6 bags yard waste, blew driveway and walks.",
      photoCount: 8,
      signedBy: "Sarah M.",
    },
    {
      id: "job-2104",
      date: "Apr 22",
      service: "Hardscape touchup",
      crew: "James Ortega",
      duration: "2h 00m",
      notes: "Re-sanded paver patio, leveled two settled stones near step.",
      photoCount: 4,
      signedBy: "Sarah M.",
    },
    {
      id: "job-2089",
      date: "Apr 15",
      service: "Bi-weekly mowing",
      crew: "Marcus Reyes",
      duration: "0h 45m",
      notes: "Standard mow + edge. First cut at 3.0 inch; height up next visit.",
      photoCount: 3,
      signedBy: "Sarah M.",
    },
  ] satisfies CompletedJob[],
  feed: [
    {
      id: "f-12",
      date: "Apr 30",
      kind: "message",
      title: "Marcus sent a quick note",
      detail:
        "Front-bed boxwoods showing early leaf-miner. We can spot-treat on May 12 — no charge.",
    },
    {
      id: "f-11",
      date: "Apr 28",
      kind: "visit",
      title: "Spring Cleanup completed",
      detail: "4h 30m · Marcus + 2 crew · 8 photos · signed by Sarah M.",
    },
    {
      id: "f-10",
      date: "Apr 28",
      kind: "approval",
      title: "Mulch refresh approved",
      detail: "$640.00 add-on for May 17 · approved in 2 taps.",
    },
    {
      id: "f-09",
      date: "Apr 22",
      kind: "payment",
      title: "Payment received · $312.00",
      detail: "Visa ending 4242 · auto-receipt sent to sarah@example.com",
    },
    {
      id: "f-08",
      date: "Apr 22",
      kind: "visit",
      title: "Hardscape touchup completed",
      detail: "2h 00m · James Ortega · 4 photos · signed by Sarah M.",
    },
    {
      id: "f-07",
      date: "Apr 18",
      kind: "referral",
      title: "Neighbor referral landed",
      detail:
        "Mark P. on Oak Lane booked a quote → +$50 credit applied to your account.",
    },
    {
      id: "f-06",
      date: "Apr 15",
      kind: "visit",
      title: "Bi-weekly mowing completed",
      detail: "0h 45m · Marcus Reyes · 3 photos · signed by Sarah M.",
    },
    {
      id: "f-05",
      date: "Apr 03",
      kind: "payment",
      title: "Payment received · $185.00",
      detail: "ACH from Wells Fargo · auto-receipt sent.",
    },
    {
      id: "f-04",
      date: "Mar 28",
      kind: "message",
      title: "Seasonal reminder",
      detail:
        "Crab grass pre-emerge window opens May 8–14 in your ZIP. Prebooked May 12.",
    },
  ] satisfies FeedEntry[],
  referral: {
    earned: 50,
    pending: 50,
    shareUrl: "https://portal.greenleaf-crew.com/r/sarah-m-2026",
  },
} as const;

export const RESCHEDULE_BLOCKED_DATES = new Set<string>([
  "2026-05-03",
  "2026-05-04",
  "2026-05-10",
  "2026-05-11",
]);
