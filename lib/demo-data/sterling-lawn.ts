/**
 * Sterling Lawn Co — fictional lawn-care demo seed data (2026-05-12).
 *
 * Mirrors lib/demo-data/bright-lights.ts but for the lawn-care vertical.
 * Built for /demo/sterling-lawn — the sales-demo workspace prospects can
 * play in before booking a real demo call.
 *
 * EVERYTHING here is fictional. No real customer PII. The "shop" is a
 * Tampa-area mid-size operation: 3 crew chiefs, 4 weekly routes,
 * ~85 active customers, recurring monthly fertilization + weekly mow
 * plans, EPA-tracked chemical applications. Tuned to look like a real
 * $1.5M ARR shop a prospect would recognize themselves in.
 *
 * v1: static read-only data, no Supabase persistence.
 */

// ---- Brand ----

export const BRAND = {
  name: "Sterling Lawn Co",
  shortName: "Sterling Lawn",
  founder: "Marcus Sterling",
  operator: "Marcus Sterling",
  phone: "(813) 555-0142",
  email: "marcus@sterlinglawn.example",
  website: "sterlinglawn.example",
  yard: "5417 W Linebaugh Ave, Tampa, FL 33624",
  serviceArea: "Tampa · Brandon · Carrollwood · Lutz · Wesley Chapel",
  hours: "6 AM – 6 PM, Mon–Sat",
  reviewCount: 312,
  reviewStars: 4.9,
  activeCustomers: 87,
  founded: "March 2014",
  fleetTrucks: 4,
  crewChiefs: 3,
} as const;

// ---- Palette (green, lawn-care heritage) ----

export const COLORS = {
  primaryDark: "#0B1F12",
  accentWarm: "#7FE27A",
  accentSecondary: "#5BCC56",
  bgNeutral: "#142A1C",
  textOnDark: "#F5F1E8",
  success: "#9DFF8A",
  alert: "#E85F5F",
} as const;

// ---- Service clusters (4 weekly routes) ----

export type RouteId = "CW" | "BR" | "WC" | "LZ";

export type Cluster = {
  id: RouteId;
  name: string;
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  crewChief: string;
  truck: string;
  zips: string[];
  customers: number;
  weeklyMinutes: number;
};

export const CLUSTERS: Cluster[] = [
  {
    id: "CW",
    name: "Carrollwood / Citrus Park",
    weekday: "Mon",
    crewChief: "Diego Ramirez",
    truck: "T-104 · Ford F-250",
    zips: ["33624", "33625", "33618"],
    customers: 24,
    weeklyMinutes: 460,
  },
  {
    id: "BR",
    name: "Brandon / Valrico",
    weekday: "Tue",
    crewChief: "Tomás Alvarez",
    truck: "T-102 · Ram 2500",
    zips: ["33511", "33510", "33594"],
    customers: 22,
    weeklyMinutes: 480,
  },
  {
    id: "WC",
    name: "Wesley Chapel / New Tampa",
    weekday: "Wed",
    crewChief: "Jamal Cooper",
    truck: "T-107 · Ford F-350",
    zips: ["33544", "33545", "33647"],
    customers: 21,
    weeklyMinutes: 415,
  },
  {
    id: "LZ",
    name: "Lutz / Land O' Lakes",
    weekday: "Thu",
    crewChief: "Diego Ramirez",
    truck: "T-104 · Ford F-250",
    zips: ["33558", "33559", "34638"],
    customers: 20,
    weeklyMinutes: 395,
  },
];

export const colorForCluster = (id: RouteId): string => {
  switch (id) {
    case "CW":
      return "#7FE27A";
    case "BR":
      return "#5BCC56";
    case "WC":
      return "#A8E89D";
    case "LZ":
      return "#7AB873";
  }
};

// ---- Customers ----

export type Customer = {
  id: string;
  name: string;
  address: string;
  zip: string;
  cluster: RouteId;
  status: "Active" | "Past due" | "Hold";
  lifetimeRevenue: number;
  monthlyValue: number;
  plan: "Mow Weekly" | "Mow + Fert" | "Full Care" | "À la carte";
  lastService: string; // ISO date
  nextService: string; // ISO date
  notes?: string;
};

// 25 representative customers (real shop has 87; we render this sample).
export const CUSTOMERS: Customer[] = [
  { id: "SL-001", name: "Holloway Residence", address: "12104 Oak Bluff Dr", zip: "33624", cluster: "CW", status: "Active", lifetimeRevenue: 11820, monthlyValue: 280, plan: "Mow + Fert", lastService: "2026-05-05", nextService: "2026-05-12" },
  { id: "SL-002", name: "Patel Family", address: "8717 Citrus Park Way", zip: "33625", cluster: "CW", status: "Active", lifetimeRevenue: 18960, monthlyValue: 420, plan: "Full Care", lastService: "2026-05-05", nextService: "2026-05-12", notes: "Asks for irrigation check every visit" },
  { id: "SL-003", name: "Ramos / Soto", address: "10422 Lake Cypress Cir", zip: "33618", cluster: "CW", status: "Past due", lifetimeRevenue: 5640, monthlyValue: 145, plan: "Mow Weekly", lastService: "2026-05-05", nextService: "2026-05-12", notes: "Invoice #4421 — 28 days overdue" },
  { id: "SL-004", name: "Burke Estate", address: "14005 Carrollwood Ridge", zip: "33624", cluster: "CW", status: "Active", lifetimeRevenue: 27440, monthlyValue: 685, plan: "Full Care", lastService: "2026-05-05", nextService: "2026-05-12", notes: "Pool deck care included" },
  { id: "SL-005", name: "Greenfield Townhomes HOA", address: "8200 Greenfield Blvd", zip: "33625", cluster: "CW", status: "Active", lifetimeRevenue: 64200, monthlyValue: 1650, plan: "Full Care", lastService: "2026-05-05", nextService: "2026-05-12", notes: "Commercial · 38 units" },
  { id: "SL-006", name: "Whitman Property", address: "1108 Bayshore Pl", zip: "33618", cluster: "CW", status: "Active", lifetimeRevenue: 9120, monthlyValue: 235, plan: "Mow + Fert", lastService: "2026-05-05", nextService: "2026-05-12" },

  { id: "SL-007", name: "Chen Residence", address: "3308 Brandon Crossing", zip: "33511", cluster: "BR", status: "Active", lifetimeRevenue: 12480, monthlyValue: 290, plan: "Mow + Fert", lastService: "2026-05-06", nextService: "2026-05-13" },
  { id: "SL-008", name: "Marek Property", address: "725 Valrico Lakes Dr", zip: "33594", cluster: "BR", status: "Active", lifetimeRevenue: 8810, monthlyValue: 215, plan: "Mow Weekly", lastService: "2026-05-06", nextService: "2026-05-13" },
  { id: "SL-009", name: "Pinewood Estates HOA", address: "Pinewood Estates Pkwy", zip: "33510", cluster: "BR", status: "Active", lifetimeRevenue: 41200, monthlyValue: 1180, plan: "Full Care", lastService: "2026-05-06", nextService: "2026-05-13", notes: "Commercial · 26 units" },
  { id: "SL-010", name: "Acosta Family", address: "5022 Lithia Way", zip: "33594", cluster: "BR", status: "Hold", lifetimeRevenue: 3120, monthlyValue: 0, plan: "À la carte", lastService: "2026-04-12", nextService: "—", notes: "Out of state until June" },
  { id: "SL-011", name: "Velez Property", address: "1415 Brandon Oaks", zip: "33511", cluster: "BR", status: "Active", lifetimeRevenue: 14620, monthlyValue: 340, plan: "Mow + Fert", lastService: "2026-05-06", nextService: "2026-05-13" },

  { id: "SL-012", name: "Davenport Residence", address: "27822 Wesley Chapel Blvd", zip: "33544", cluster: "WC", status: "Active", lifetimeRevenue: 21340, monthlyValue: 525, plan: "Full Care", lastService: "2026-05-07", nextService: "2026-05-14" },
  { id: "SL-013", name: "Kim Family", address: "30815 New Tampa Pkwy", zip: "33647", cluster: "WC", status: "Active", lifetimeRevenue: 6520, monthlyValue: 175, plan: "Mow Weekly", lastService: "2026-05-07", nextService: "2026-05-14" },
  { id: "SL-014", name: "Tampa Palms Office Park", address: "5500 Tampa Palms Blvd", zip: "33647", cluster: "WC", status: "Active", lifetimeRevenue: 88400, monthlyValue: 2150, plan: "Full Care", lastService: "2026-05-07", nextService: "2026-05-14", notes: "Commercial · medical office complex" },
  { id: "SL-015", name: "Linwood Residence", address: "1280 Saddle Ridge", zip: "33545", cluster: "WC", status: "Active", lifetimeRevenue: 10840, monthlyValue: 265, plan: "Mow + Fert", lastService: "2026-05-07", nextService: "2026-05-14" },
  { id: "SL-016", name: "Okafor Property", address: "2102 Cypress Bend", zip: "33544", cluster: "WC", status: "Past due", lifetimeRevenue: 7240, monthlyValue: 195, plan: "Mow Weekly", lastService: "2026-05-07", nextService: "2026-05-14", notes: "Invoice #4438 — 14 days overdue" },

  { id: "SL-017", name: "Brennan Residence", address: "18450 Lutz Lake Fern", zip: "33558", cluster: "LZ", status: "Active", lifetimeRevenue: 15820, monthlyValue: 385, plan: "Mow + Fert", lastService: "2026-05-08", nextService: "2026-05-15" },
  { id: "SL-018", name: "Carmichael Estate", address: "21115 Connerton Pkwy", zip: "34638", cluster: "LZ", status: "Active", lifetimeRevenue: 32420, monthlyValue: 795, plan: "Full Care", lastService: "2026-05-08", nextService: "2026-05-15", notes: "1.8-acre estate; ride-on mower required" },
  { id: "SL-019", name: "Suncoast Office Plaza", address: "16805 Land O' Lakes Blvd", zip: "33559", cluster: "LZ", status: "Active", lifetimeRevenue: 54600, monthlyValue: 1380, plan: "Full Care", lastService: "2026-05-08", nextService: "2026-05-15", notes: "Commercial · 14-tenant office" },
  { id: "SL-020", name: "Nelson Family", address: "4022 Lake Padgett Blvd", zip: "33558", cluster: "LZ", status: "Active", lifetimeRevenue: 9180, monthlyValue: 225, plan: "Mow + Fert", lastService: "2026-05-08", nextService: "2026-05-15" },
  { id: "SL-021", name: "Reeves Residence", address: "7515 Long Lake Rd", zip: "33559", cluster: "LZ", status: "Active", lifetimeRevenue: 12940, monthlyValue: 310, plan: "Mow + Fert", lastService: "2026-05-08", nextService: "2026-05-15" },

  // A few more across clusters for variety
  { id: "SL-022", name: "Garner Property", address: "13620 Westchase Way", zip: "33625", cluster: "CW", status: "Active", lifetimeRevenue: 7820, monthlyValue: 195, plan: "Mow Weekly", lastService: "2026-05-05", nextService: "2026-05-12" },
  { id: "SL-023", name: "Iwu Family", address: "4118 Bloomingdale Ave", zip: "33511", cluster: "BR", status: "Active", lifetimeRevenue: 11260, monthlyValue: 275, plan: "Mow + Fert", lastService: "2026-05-06", nextService: "2026-05-13" },
  { id: "SL-024", name: "Sorrento Hills HOA", address: "31215 Sorrento Hills", zip: "33545", cluster: "WC", status: "Active", lifetimeRevenue: 36800, monthlyValue: 925, plan: "Full Care", lastService: "2026-05-07", nextService: "2026-05-14", notes: "Commercial · 22 units" },
  { id: "SL-025", name: "Madsen Family", address: "8742 Land O' Lakes Pkwy", zip: "33559", cluster: "LZ", status: "Active", lifetimeRevenue: 6420, monthlyValue: 165, plan: "Mow Weekly", lastService: "2026-05-08", nextService: "2026-05-15" },
];

export const customerById = (id: string): Customer | undefined =>
  CUSTOMERS.find((c) => c.id === id);

// ---- Plans ----

export type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  subscribers: number;
  monthlyAccretion: number;
};

export const PLANS: Plan[] = [
  {
    id: "mow-weekly",
    name: "Mow Weekly",
    monthlyPrice: 145,
    description: "Weekly mow + edge + blow. Year-round.",
    features: [
      "Weekly mow + edge + blow",
      "Bagged or mulched (your call)",
      "Photo confirmation every visit",
      "Cancel any time",
    ],
    subscribers: 24,
    monthlyAccretion: 3480,
  },
  {
    id: "mow-fert",
    name: "Mow + Fert",
    monthlyPrice: 285,
    description: "Weekly mow plus 6-step fertilization round.",
    features: [
      "Everything in Mow Weekly",
      "6-step seasonal fert + weed control",
      "Soil pH test annually",
      "Reentry-window text notifications",
    ],
    subscribers: 38,
    monthlyAccretion: 10830,
  },
  {
    id: "full-care",
    name: "Full Care",
    monthlyPrice: 685,
    description: "Mow + Fert plus aeration, overseeding, and seasonal cleanups.",
    features: [
      "Everything in Mow + Fert",
      "Spring + fall aeration + overseed",
      "Seasonal cleanups (4×/yr)",
      "Irrigation tune-ups (2×/yr)",
      "Pruning + bed maintenance",
    ],
    subscribers: 18,
    monthlyAccretion: 12330,
  },
];

// ---- Chemical applications log (last 30 days) ----

export type ChemicalApp = {
  id: string;
  date: string; // ISO
  customerId: string;
  productName: string;
  productEpaNo: string;
  category: "Herbicide" | "Insecticide" | "Fungicide" | "Fertilizer" | "Adjuvant";
  rate: string;
  totalAppliedOz: number;
  reentryHours: number;
  applicator: string;
  applicatorCertNo: string;
  notes?: string;
};

export const CHEMICAL_APPS: ChemicalApp[] = [
  { id: "APP-1042", date: "2026-05-08", customerId: "SL-019", productName: "Roundup PROMAX", productEpaNo: "524-579", category: "Herbicide", rate: "2.5 oz / gal", totalAppliedOz: 32, reentryHours: 4, applicator: "Diego Ramirez", applicatorCertNo: "FL-LCA-44829" },
  { id: "APP-1041", date: "2026-05-08", customerId: "SL-018", productName: "Lesco 24-0-11 Pre-emerge", productEpaNo: "10404-32", category: "Fertilizer", rate: "1 lb / 1000 sqft", totalAppliedOz: 78, reentryHours: 0, applicator: "Diego Ramirez", applicatorCertNo: "FL-LCA-44829" },
  { id: "APP-1040", date: "2026-05-07", customerId: "SL-014", productName: "Talstar P Insecticide", productEpaNo: "279-3206", category: "Insecticide", rate: "1 oz / gal", totalAppliedOz: 24, reentryHours: 12, applicator: "Jamal Cooper", applicatorCertNo: "FL-LCA-46208", notes: "Chinch bug suppression — south lawn" },
  { id: "APP-1039", date: "2026-05-07", customerId: "SL-012", productName: "Heritage Action Fungicide", productEpaNo: "100-1093", category: "Fungicide", rate: "0.4 oz / gal", totalAppliedOz: 14, reentryHours: 24, applicator: "Jamal Cooper", applicatorCertNo: "FL-LCA-46208", notes: "Brown patch reactive" },
  { id: "APP-1038", date: "2026-05-06", customerId: "SL-009", productName: "Lesco 19-0-7 with Dimension", productEpaNo: "59639-178", category: "Fertilizer", rate: "1 lb / 1000 sqft", totalAppliedOz: 124, reentryHours: 0, applicator: "Tomás Alvarez", applicatorCertNo: "FL-LCA-44115" },
  { id: "APP-1037", date: "2026-05-06", customerId: "SL-007", productName: "Roundup PROMAX", productEpaNo: "524-579", category: "Herbicide", rate: "2.5 oz / gal", totalAppliedOz: 18, reentryHours: 4, applicator: "Tomás Alvarez", applicatorCertNo: "FL-LCA-44115" },
  { id: "APP-1036", date: "2026-05-05", customerId: "SL-005", productName: "Talstar P Insecticide", productEpaNo: "279-3206", category: "Insecticide", rate: "1 oz / gal", totalAppliedOz: 38, reentryHours: 12, applicator: "Diego Ramirez", applicatorCertNo: "FL-LCA-44829" },
  { id: "APP-1035", date: "2026-05-05", customerId: "SL-004", productName: "Lesco 24-0-11 Pre-emerge", productEpaNo: "10404-32", category: "Fertilizer", rate: "1 lb / 1000 sqft", totalAppliedOz: 92, reentryHours: 0, applicator: "Diego Ramirez", applicatorCertNo: "FL-LCA-44829" },
  { id: "APP-1034", date: "2026-05-02", customerId: "SL-002", productName: "Roundup PROMAX", productEpaNo: "524-579", category: "Herbicide", rate: "2.5 oz / gal", totalAppliedOz: 14, reentryHours: 4, applicator: "Diego Ramirez", applicatorCertNo: "FL-LCA-44829" },
  { id: "APP-1033", date: "2026-05-01", customerId: "SL-014", productName: "Heritage Action Fungicide", productEpaNo: "100-1093", category: "Fungicide", rate: "0.4 oz / gal", totalAppliedOz: 22, reentryHours: 24, applicator: "Jamal Cooper", applicatorCertNo: "FL-LCA-46208" },
  { id: "APP-1032", date: "2026-04-29", customerId: "SL-019", productName: "Lesco 19-0-7 with Dimension", productEpaNo: "59639-178", category: "Fertilizer", rate: "1 lb / 1000 sqft", totalAppliedOz: 88, reentryHours: 0, applicator: "Diego Ramirez", applicatorCertNo: "FL-LCA-44829" },
  { id: "APP-1031", date: "2026-04-28", customerId: "SL-009", productName: "Talstar P Insecticide", productEpaNo: "279-3206", category: "Insecticide", rate: "1 oz / gal", totalAppliedOz: 28, reentryHours: 12, applicator: "Tomás Alvarez", applicatorCertNo: "FL-LCA-44115", notes: "Mole-cricket pre-treatment" },
];

// ---- Activity feed (dashboard) ----

export type Activity = {
  id: string;
  at: string; // "10:42 AM" etc.
  kind: "service" | "payment" | "review" | "alert" | "lead";
  text: string;
};

export const ACTIVITY_FEED: Activity[] = [
  { id: "A1", at: "9:47 AM", kind: "lead", text: "New inquiry: Foster Property (Carrollwood) — weekly mow + spring cleanup." },
  { id: "A2", at: "9:31 AM", kind: "service", text: "T-104 started Carrollwood route · 24 stops queued · Diego at the wheel." },
  { id: "A3", at: "9:18 AM", kind: "review", text: "★★★★★ from Burke Estate: \"Diego left the property spotless. Edging is art.\"" },
  { id: "A4", at: "8:53 AM", kind: "payment", text: "Patel Family · $420 monthly subscription renewed." },
  { id: "A5", at: "8:42 AM", kind: "alert", text: "Ramos / Soto invoice #4421 is 28 days overdue. Auto-followup queued for 11 AM." },
  { id: "A6", at: "8:15 AM", kind: "service", text: "Pre-route safety check complete. All 4 trucks fueled, blades sharp." },
  { id: "A7", at: "7:58 AM", kind: "review", text: "★★★★★ from Pinewood Estates HOA: \"Tomás's crew is fastest in the state.\"" },
];

// ---- KPIs for dashboard ----

export const KPIS = {
  activeCustomers: 87,
  planSubscribers: 80, // mow weekly 24 + mow+fert 38 + full care 18
  monthlyRecurring: 26640, // 3480 + 10830 + 12330
  reviewLifetime: 312,
  reviewStars: 4.9,
  reviewsThisMonth: 7,
  openServiceCalls: 9,
  pastDueInvoices: 4,
  pastDueAmount: 3870,
  routesToday: 1, // Mon = Carrollwood
  applicationsThisMonth: 11,
};
