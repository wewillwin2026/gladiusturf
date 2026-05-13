/**
 * TimberCare Co — fictional tree-care demo seed (2026-05-13).
 * Sarasota-area arborist + tree service. DBH-priced jobs, ANSI A300
 * standards, ISA-certified arborist credentials, COI insurance
 * tracking per commercial property.
 */

export const BRAND = {
  name: "TimberCare Co",
  shortName: "TimberCare",
  founder: "Sergio Vasquez",
  operator: "Sergio Vasquez",
  phone: "(941) 555-0411",
  email: "sergio@timbercareco.example",
  website: "timbercareco.example",
  yard: "1820 12th St, Sarasota, FL 34236",
  serviceArea: "Sarasota · Bradenton · Venice · North Port",
  hours: "Mon–Sat, 7 AM – 5 PM",
  reviewCount: 88,
  reviewStars: 4.9,
  activeJobs: 14,
  founded: "August 2019",
  isaArboristCount: 2,
  crewMembers: 6,
} as const;

export type JobStage =
  | "lead"
  | "estimate"
  | "scheduled"
  | "in_progress"
  | "complete"
  | "billed";

export type TreeJob = {
  id: string;
  customerName: string;
  address: string;
  zip: string;
  stage: JobStage;
  scope: string;
  // Diameter at breast height (inches) — drives pricing
  trees: { species: string; dbh: number; height: number }[];
  contractedCents: number;
  craneRequired: boolean;
  estStartDate: string | null;
  isaArboristName: string;
  notes?: string;
};

export const STAGE_LABEL: Record<JobStage, string> = {
  lead: "Lead",
  estimate: "Estimate",
  scheduled: "Scheduled",
  in_progress: "In progress",
  complete: "Complete",
  billed: "Billed",
};

export const JOBS: TreeJob[] = [
  { id: "TC-J-201", customerName: "Brennan Estate", address: "5512 Founders Club Dr", zip: "34240", stage: "scheduled", scope: "Remove 2 dead pines · cable lateral live oak · stump grind 3", trees: [{ species: "Pine", dbh: 26, height: 65 }, { species: "Pine", dbh: 22, height: 58 }, { species: "Live Oak", dbh: 32, height: 48 }], contractedCents: 642000, craneRequired: true, estStartDate: "2026-05-19", isaArboristName: "Sergio Vasquez", notes: "Crane staging on east drive · 80-ton needed for pine removal" },
  { id: "TC-J-202", customerName: "Sutton Residence", address: "8104 Lake Club Blvd", zip: "34202", stage: "in_progress", scope: "Hurricane prep · 4 oaks crown thinning per ANSI A300", trees: [{ species: "Live Oak", dbh: 38, height: 55 }, { species: "Live Oak", dbh: 34, height: 50 }, { species: "Live Oak", dbh: 28, height: 45 }, { species: "Live Oak", dbh: 30, height: 48 }], contractedCents: 384000, craneRequired: false, estStartDate: "2026-05-13", isaArboristName: "Mira Patel" },
  { id: "TC-J-203", customerName: "Casey Key Property", address: "320 N Casey Key Rd", zip: "34229", stage: "complete", scope: "Cable + brace 2 historic banyans · ISA-cert documentation", trees: [{ species: "Banyan", dbh: 78, height: 42 }, { species: "Banyan", dbh: 64, height: 38 }], contractedCents: 1480000, craneRequired: false, estStartDate: "2026-04-22", isaArboristName: "Sergio Vasquez", notes: "Sarasota Historic Tree designation — careful approach" },
  { id: "TC-J-204", customerName: "Venice School District", address: "1900 W Venice Ave", zip: "34285", stage: "estimate", scope: "Campus-wide playground oak survey · risk assessment + report", trees: [], contractedCents: 0, craneRequired: false, estStartDate: null, isaArboristName: "Mira Patel", notes: "Commercial · awaiting school board approval" },
  { id: "TC-J-205", customerName: "Pelican Cove HOA", address: "1554 Tarpon Center Dr", zip: "34285", stage: "scheduled", scope: "Storm damage cleanup · 8 mixed species hangers + 2 removals", trees: [{ species: "Cabbage Palm", dbh: 14, height: 30 }, { species: "Slash Pine", dbh: 18, height: 42 }], contractedCents: 218000, craneRequired: false, estStartDate: "2026-05-16", isaArboristName: "Sergio Vasquez", notes: "Commercial · 38-unit HOA · post-storm priority" },
  { id: "TC-J-206", customerName: "Foster Residence", address: "1818 Bayou Way", zip: "34236", stage: "billed", scope: "Single oak removal + stump grind", trees: [{ species: "Laurel Oak", dbh: 28, height: 52 }], contractedCents: 168000, craneRequired: false, estStartDate: "2026-05-04", isaArboristName: "Mira Patel" },
  { id: "TC-J-207", customerName: "North Port Family", address: "5022 Sumter Blvd", zip: "34291", stage: "lead", scope: "Phone inquiry — oak fell on shed during last storm", trees: [], contractedCents: 0, craneRequired: false, estStartDate: null, isaArboristName: "Sergio Vasquez" },
  { id: "TC-J-208", customerName: "Bradenton Country Club", address: "4502 Country Club Dr", zip: "34210", stage: "in_progress", scope: "Course-wide oak crown thinning · cart-path clearance", trees: [{ species: "Live Oak", dbh: 36, height: 55 }, { species: "Live Oak", dbh: 30, height: 48 }, { species: "Live Oak", dbh: 28, height: 45 }], contractedCents: 480000, craneRequired: false, estStartDate: "2026-05-12", isaArboristName: "Mira Patel", notes: "Commercial · golf course · 4-day project" },
];

export type Customer = {
  id: string;
  name: string;
  address: string;
  zip: string;
  customerKind: "residential" | "commercial";
  lifetimeRevenue: number;
  coiOnFile: boolean;
  coiExpiry: string | null;
  notes?: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "TC-C-201", name: "Brennan Estate", address: "5512 Founders Club Dr", zip: "34240", customerKind: "residential", lifetimeRevenue: 18400, coiOnFile: false, coiExpiry: null },
  { id: "TC-C-202", name: "Sutton Residence", address: "8104 Lake Club Blvd", zip: "34202", customerKind: "residential", lifetimeRevenue: 12600, coiOnFile: false, coiExpiry: null },
  { id: "TC-C-203", name: "Casey Key Property", address: "320 N Casey Key Rd", zip: "34229", customerKind: "residential", lifetimeRevenue: 24800, coiOnFile: true, coiExpiry: "2026-08-12", notes: "Coastal · careful equipment access" },
  { id: "TC-C-204", name: "Venice School District", address: "1900 W Venice Ave", zip: "34285", customerKind: "commercial", lifetimeRevenue: 28200, coiOnFile: true, coiExpiry: "2026-12-01" },
  { id: "TC-C-205", name: "Pelican Cove HOA", address: "1554 Tarpon Center Dr", zip: "34285", customerKind: "commercial", lifetimeRevenue: 36400, coiOnFile: true, coiExpiry: "2026-06-30", notes: "COI renewal due before Jun 30" },
  { id: "TC-C-206", name: "Foster Residence", address: "1818 Bayou Way", zip: "34236", customerKind: "residential", lifetimeRevenue: 1680, coiOnFile: false, coiExpiry: null },
  { id: "TC-C-207", name: "North Port Family", address: "5022 Sumter Blvd", zip: "34291", customerKind: "residential", lifetimeRevenue: 0, coiOnFile: false, coiExpiry: null },
  { id: "TC-C-208", name: "Bradenton Country Club", address: "4502 Country Club Dr", zip: "34210", customerKind: "commercial", lifetimeRevenue: 84200, coiOnFile: true, coiExpiry: "2026-11-04" },
];

export const customerById = (id: string): Customer | undefined =>
  CUSTOMERS.find((c) => c.id === id);

export type Activity = {
  id: string;
  at: string;
  kind: "job" | "review" | "lead" | "payment" | "alert";
  text: string;
};

export const ACTIVITY: Activity[] = [
  { id: "A1", at: "9:42 AM", kind: "job", text: "Sutton job · day 1 complete — 2 of 4 oaks thinned per A300." },
  { id: "A2", at: "9:11 AM", kind: "alert", text: "Pelican Cove COI expires Jun 30 · renewal request queued." },
  { id: "A3", at: "8:48 AM", kind: "review", text: "★★★★★ from Casey Key: \"Sergio's cabling work on the banyans is museum-quality.\"" },
  { id: "A4", at: "8:32 AM", kind: "lead", text: "New inquiry — North Port family, oak fell on shed last storm." },
  { id: "A5", at: "8:14 AM", kind: "payment", text: "Foster Residence · $1,680 invoice paid (oak removal completed 5/4)." },
];

export const KPIS = {
  activeJobs: JOBS.filter((j) => j.stage !== "billed" && j.stage !== "complete").length,
  inProgress: JOBS.filter((j) => j.stage === "in_progress").length,
  contractedThisQuarter: JOBS.reduce((s, j) => s + j.contractedCents, 0),
  craneRequired: JOBS.filter((j) => j.craneRequired).length,
  coiExpiringSoon: CUSTOMERS.filter((c) =>
    c.coiOnFile && c.coiExpiry && new Date(c.coiExpiry).getTime() < Date.now() + 60 * 24 * 60 * 60 * 1000
  ).length,
  reviewLifetime: BRAND.reviewCount,
  reviewStars: BRAND.reviewStars,
};
