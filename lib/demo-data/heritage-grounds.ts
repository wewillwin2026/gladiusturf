/**
 * Heritage Grounds — fictional landscape design-build demo seed
 * (2026-05-13). Sarasota / Bradenton mid-size shop, 9 projects in
 * progress, 22 design-build cycles closed in the last year.
 *
 * Different shape than lawn-care/lighting: landscape projects don't
 * have weekly routes; they have a job-board (lead → design → install
 * → walkthrough → punch-list → complete) and per-project P&L.
 */

export const BRAND = {
  name: "Heritage Grounds",
  shortName: "Heritage",
  founder: "Lena Whitmore",
  operator: "Lena Whitmore",
  phone: "(941) 555-0188",
  email: "lena@heritagegrounds.example",
  website: "heritagegrounds.example",
  yard: "2104 17th St E, Bradenton, FL 34208",
  serviceArea: "Bradenton · Sarasota · Lakewood Ranch · Anna Maria",
  hours: "Mon–Fri, 7 AM – 5 PM",
  reviewCount: 96,
  reviewStars: 4.9,
  activeProjects: 9,
  founded: "January 2017",
  designers: 2,
  installers: 11,
} as const;

export type ProjectStage =
  | "lead"
  | "design"
  | "approved"
  | "scheduled"
  | "in_install"
  | "walkthrough"
  | "punch_list"
  | "complete";

export type Project = {
  id: string;
  customerName: string;
  address: string;
  zip: string;
  stage: ProjectStage;
  scope: string;
  contractedCents: number;
  budgetCostCents: number;
  startDate: string | null;
  estCompleteDate: string | null;
  designerName: string;
  notes?: string;
};

export const PROJECTS: Project[] = [
  { id: "HG-P101", customerName: "Sutton Residence", address: "8104 Lake Club Blvd", zip: "34202", stage: "in_install", scope: "Backyard hardscape + pool surround · 1,800 sqft travertine", contractedCents: 4820000, budgetCostCents: 2890000, startDate: "2026-04-22", estCompleteDate: "2026-05-30", designerName: "Lena Whitmore", notes: "Owner is on vacation through May 18; gate-code shared with crew chief." },
  { id: "HG-P102", customerName: "Brennan Estate", address: "5512 Founders Club Dr", zip: "34240", stage: "walkthrough", scope: "Front entry redesign + irrigation rework", contractedCents: 2640000, budgetCostCents: 1480000, startDate: "2026-04-04", estCompleteDate: "2026-05-14", designerName: "Mike Reyes" },
  { id: "HG-P103", customerName: "Mackinaw Property", address: "320 N Casey Key Rd", zip: "34229", stage: "punch_list", scope: "Bayfront garden + lighting (lighting subbed to Bright Lights)", contractedCents: 7890000, budgetCostCents: 5210000, startDate: "2026-02-10", estCompleteDate: "2026-05-09", designerName: "Lena Whitmore", notes: "Punch-list: one paver settling fix near pool deck." },
  { id: "HG-P104", customerName: "Cypress Hammock HOA", address: "4400 Cypress Hammock Loop", zip: "34243", stage: "approved", scope: "Entry monument + perimeter beds, 12 buildings", contractedCents: 11420000, budgetCostCents: 7860000, startDate: "2026-05-19", estCompleteDate: "2026-07-15", designerName: "Mike Reyes" },
  { id: "HG-P105", customerName: "Foster Residence", address: "1818 Bayou Way", zip: "34236", stage: "design", scope: "Backyard refresh — beds + native plant palette", contractedCents: 1640000, budgetCostCents: 940000, startDate: null, estCompleteDate: null, designerName: "Lena Whitmore" },
  { id: "HG-P106", customerName: "Greenbrook Pediatrics", address: "9020 Town Center Pkwy", zip: "34202", stage: "scheduled", scope: "Commercial entry + parking-lot islands", contractedCents: 3110000, budgetCostCents: 1880000, startDate: "2026-05-27", estCompleteDate: "2026-06-18", designerName: "Mike Reyes" },
  { id: "HG-P107", customerName: "Pierre / Lambert", address: "606 Boca Royale", zip: "34293", stage: "lead", scope: "Outdoor kitchen + pergola scoping call", contractedCents: 0, budgetCostCents: 0, startDate: null, estCompleteDate: null, designerName: "Lena Whitmore", notes: "Discovery call scheduled May 16." },
  { id: "HG-P108", customerName: "Anna Maria Beach House", address: "215 Pine Ave", zip: "34216", stage: "in_install", scope: "Front entry · salt-tolerant plant palette + lighting", contractedCents: 2280000, budgetCostCents: 1320000, startDate: "2026-04-29", estCompleteDate: "2026-05-22", designerName: "Mike Reyes" },
  { id: "HG-P109", customerName: "Lakewood Ranch Charter", address: "8801 Lakewood Ranch Blvd", zip: "34202", stage: "complete", scope: "Athletic-field perimeter beds (2024 install, 2026 refresh)", contractedCents: 980000, budgetCostCents: 540000, startDate: "2026-03-01", estCompleteDate: "2026-04-12", designerName: "Mike Reyes", notes: "Closed out · final invoice paid 2026-04-22." },
];

export const STAGE_LABEL: Record<ProjectStage, string> = {
  lead: "Lead",
  design: "Design",
  approved: "Approved",
  scheduled: "Scheduled",
  in_install: "In install",
  walkthrough: "Walkthrough",
  punch_list: "Punch list",
  complete: "Complete",
};

export type Customer = {
  id: string;
  name: string;
  address: string;
  zip: string;
  status: "Active" | "Past project" | "Lead";
  lifetimeRevenue: number;
  primaryDesigner: string;
  notes?: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "HG-C-101", name: "Sutton Residence", address: "8104 Lake Club Blvd", zip: "34202", status: "Active", lifetimeRevenue: 48200, primaryDesigner: "Lena Whitmore" },
  { id: "HG-C-102", name: "Brennan Estate", address: "5512 Founders Club Dr", zip: "34240", status: "Active", lifetimeRevenue: 26400, primaryDesigner: "Mike Reyes" },
  { id: "HG-C-103", name: "Mackinaw Property", address: "320 N Casey Key Rd", zip: "34229", status: "Active", lifetimeRevenue: 78900, primaryDesigner: "Lena Whitmore" },
  { id: "HG-C-104", name: "Cypress Hammock HOA", address: "4400 Cypress Hammock Loop", zip: "34243", status: "Active", lifetimeRevenue: 114200, primaryDesigner: "Mike Reyes", notes: "Commercial · 12-building HOA" },
  { id: "HG-C-105", name: "Foster Residence", address: "1818 Bayou Way", zip: "34236", status: "Active", lifetimeRevenue: 16400, primaryDesigner: "Lena Whitmore" },
  { id: "HG-C-106", name: "Greenbrook Pediatrics", address: "9020 Town Center Pkwy", zip: "34202", status: "Active", lifetimeRevenue: 31100, primaryDesigner: "Mike Reyes", notes: "Commercial · pediatric clinic" },
  { id: "HG-C-107", name: "Pierre / Lambert", address: "606 Boca Royale", zip: "34293", status: "Lead", lifetimeRevenue: 0, primaryDesigner: "Lena Whitmore" },
  { id: "HG-C-108", name: "Anna Maria Beach House", address: "215 Pine Ave", zip: "34216", status: "Active", lifetimeRevenue: 22800, primaryDesigner: "Mike Reyes" },
  { id: "HG-C-109", name: "Lakewood Ranch Charter", address: "8801 Lakewood Ranch Blvd", zip: "34202", status: "Past project", lifetimeRevenue: 9800, primaryDesigner: "Mike Reyes", notes: "Commercial · charter school" },
  { id: "HG-C-110", name: "Vega Residence", address: "1200 Riviera Dunes", zip: "34221", status: "Past project", lifetimeRevenue: 18200, primaryDesigner: "Lena Whitmore" },
  { id: "HG-C-111", name: "Sterling Trace HOA", address: "Sterling Trace Pkwy", zip: "34221", status: "Past project", lifetimeRevenue: 56400, primaryDesigner: "Mike Reyes" },
];

export const customerById = (id: string): Customer | undefined =>
  CUSTOMERS.find((c) => c.id === id);

export type Plan = {
  id: string;
  name: string;
  annualPrice: number;
  description: string;
  features: string[];
  subscribers: number;
};

export const PLANS: Plan[] = [
  {
    id: "garden-care",
    name: "Garden Care",
    annualPrice: 2400,
    description: "Quarterly visits — pruning, bed maintenance, mulch refresh.",
    features: [
      "4 quarterly visits",
      "Mulch refresh (spring + fall)",
      "Bed pruning + cleanup",
      "Plant-health spot check",
    ],
    subscribers: 14,
  },
  {
    id: "estate-care",
    name: "Estate Care",
    annualPrice: 6800,
    description: "Monthly visits + dedicated designer concierge.",
    features: [
      "Monthly visits (12×/yr)",
      "Mulch + bed refresh quarterly",
      "Dedicated designer concierge",
      "Storm-cleanup priority routing",
      "Annual master-plan review",
    ],
    subscribers: 6,
  },
];

export type Activity = {
  id: string;
  at: string;
  kind: "project" | "review" | "lead" | "payment" | "alert";
  text: string;
};

export const ACTIVITY: Activity[] = [
  { id: "A1", at: "9:43 AM", kind: "project", text: "Sutton Residence · install day 13 of 26 — pool surround grout went down today." },
  { id: "A2", at: "9:08 AM", kind: "lead", text: "New lead from Boca Royale — Pierre / Lambert, outdoor kitchen + pergola." },
  { id: "A3", at: "8:51 AM", kind: "review", text: "★★★★★ from Mackinaw: \"Lena's eye for native palettes is unmatched.\"" },
  { id: "A4", at: "8:30 AM", kind: "payment", text: "Lakewood Ranch Charter · final invoice $9,800 paid (closed 4/22)." },
  { id: "A5", at: "8:12 AM", kind: "alert", text: "Brennan Estate walkthrough scheduled for tomorrow 10 AM — punch-list ready." },
];

export const KPIS = {
  activeProjects: 9,
  inInstall: PROJECTS.filter((p) => p.stage === "in_install").length,
  contractedThisQuarter: 27_240_000, // cents
  backlogValue: PROJECTS.filter((p) =>
    ["approved", "scheduled", "in_install", "walkthrough", "punch_list"].includes(p.stage),
  ).reduce((s, p) => s + p.contractedCents, 0),
  marginAvgPct: 38,
  reviewCount: BRAND.reviewCount,
  reviewStars: BRAND.reviewStars,
};
