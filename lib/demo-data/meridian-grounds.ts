/**
 * Meridian Commercial Grounds — fictional commercial-property landscape
 * demo (2026-05-13). Tampa-area commercial-only operator. 18 properties
 * under contract: office parks, retail centers, multi-tenant HOAs.
 * Distinguishing surface: NTE (not-to-exceed) work-order routing,
 * COI auto-tracking per property, monthly recurring contracts.
 */

export const BRAND = {
  name: "Meridian Commercial Grounds",
  shortName: "Meridian",
  founder: "Dana Mortensen",
  operator: "Dana Mortensen",
  phone: "(813) 555-0508",
  email: "dana@meridiancommercial.example",
  website: "meridiancommercial.example",
  yard: "2104 N Westshore Blvd, Tampa, FL 33607",
  serviceArea: "Tampa · St. Pete · Brandon · Wesley Chapel · Lakewood Ranch",
  hours: "Mon–Fri, 6:30 AM – 4 PM",
  reviewCount: 64,
  reviewStars: 4.9,
  activeContracts: 18,
  founded: "March 2017",
  crewMembers: 14,
  fleetTrucks: 6,
} as const;

export type Property = {
  id: string;
  customerName: string;
  propertyName: string;
  address: string;
  zip: string;
  contractMonthlyCents: number;
  nteCeilingCents: number;
  scope: string;
  coiOnFile: boolean;
  coiExpiry: string | null;
  // 'active' | 'paused' | 'churned'
  status: "active" | "paused" | "churned";
  ownerKind: "office" | "retail" | "hoa" | "multi_tenant" | "industrial";
  acreage: number;
  notes?: string;
};

export const PROPERTIES: Property[] = [
  { id: "MG-P-301", customerName: "Westshore REIT", propertyName: "Westshore Plaza", address: "250 N Westshore Blvd", zip: "33609", contractMonthlyCents: 482000, nteCeilingCents: 250000, scope: "Office tower · 4-acre perimeter + interior courtyards", coiOnFile: true, coiExpiry: "2026-09-22", status: "active", ownerKind: "office", acreage: 4.0 },
  { id: "MG-P-302", customerName: "Westshore REIT", propertyName: "Rocky Point Office Park", address: "2202 N Westshore Blvd", zip: "33607", contractMonthlyCents: 384000, nteCeilingCents: 200000, scope: "Office · perimeter + 3 parking-lot islands", coiOnFile: true, coiExpiry: "2026-09-22", status: "active", ownerKind: "office", acreage: 3.2 },
  { id: "MG-P-303", customerName: "Tampa Premier Retail", propertyName: "WestShore Plaza Mall", address: "250 Westshore Plaza", zip: "33609", contractMonthlyCents: 1280000, nteCeilingCents: 500000, scope: "Regional mall · perimeter + 800 LF entry beds", coiOnFile: true, coiExpiry: "2026-07-31", status: "active", ownerKind: "retail", acreage: 12.0, notes: "Highest-margin contract on the book" },
  { id: "MG-P-304", customerName: "Pinellas Park HOA", propertyName: "Pinellas Park Community", address: "4900 78th Ave N", zip: "33781", contractMonthlyCents: 720000, nteCeilingCents: 300000, scope: "38-unit HOA · entry monuments + common areas + 3 ponds", coiOnFile: true, coiExpiry: "2026-06-15", status: "active", ownerKind: "hoa", acreage: 8.4 },
  { id: "MG-P-305", customerName: "Bay Plaza Holdings", propertyName: "Bay Plaza Multi-Tenant", address: "5500 W Bay Plaza Dr", zip: "33619", contractMonthlyCents: 540000, nteCeilingCents: 280000, scope: "Multi-tenant office · 5 tenant-specific entry treatments", coiOnFile: false, coiExpiry: null, status: "active", ownerKind: "multi_tenant", acreage: 5.1, notes: "COI requested · awaiting from broker" },
  { id: "MG-P-306", customerName: "Brandon Heights HOA", propertyName: "Brandon Heights", address: "4022 Brandon Heights", zip: "33511", contractMonthlyCents: 480000, nteCeilingCents: 200000, scope: "HOA · perimeter + clubhouse + pool deck beds", coiOnFile: true, coiExpiry: "2026-08-04", status: "active", ownerKind: "hoa", acreage: 4.8 },
  { id: "MG-P-307", customerName: "Greenbrook Pediatrics", propertyName: "Greenbrook Pediatrics", address: "9020 Town Center Pkwy", zip: "34202", contractMonthlyCents: 220000, nteCeilingCents: 100000, scope: "Single-tenant medical office", coiOnFile: true, coiExpiry: "2026-12-01", status: "active", ownerKind: "office", acreage: 1.4 },
  { id: "MG-P-308", customerName: "Tampa Industrial Group", propertyName: "Causeway Industrial Park", address: "4800 Adamo Dr", zip: "33605", contractMonthlyCents: 360000, nteCeilingCents: 150000, scope: "Industrial · perimeter + retention pond maintenance", coiOnFile: true, coiExpiry: "2026-11-19", status: "active", ownerKind: "industrial", acreage: 6.2 },
  { id: "MG-P-309", customerName: "Sorrento Hills HOA", propertyName: "Sorrento Hills", address: "31215 Sorrento Hills", zip: "33545", contractMonthlyCents: 880000, nteCeilingCents: 350000, scope: "22-unit HOA · entry monuments + 4 common areas + lake bank", coiOnFile: true, coiExpiry: "2026-05-30", status: "active", ownerKind: "hoa", acreage: 9.5, notes: "COI expires May 30 — renewal in flight" },
  { id: "MG-P-310", customerName: "Lakewood Office Park", propertyName: "Lakewood Ranch Office Park", address: "9001 Lakewood Ranch Blvd", zip: "34202", contractMonthlyCents: 420000, nteCeilingCents: 200000, scope: "Office park · 6 buildings · perimeter", coiOnFile: true, coiExpiry: "2026-10-12", status: "paused", ownerKind: "office", acreage: 4.5, notes: "Paused 30d while tenant turnover finalizes" },
  { id: "MG-P-311", customerName: "Citrus Park Property Trust", propertyName: "Citrus Park Town Center", address: "8200 Citrus Park Town Center Mall", zip: "33625", contractMonthlyCents: 980000, nteCeilingCents: 400000, scope: "Town center mall · 9 acres total · 4 anchor entries", coiOnFile: true, coiExpiry: "2026-08-31", status: "active", ownerKind: "retail", acreage: 9.0 },
  { id: "MG-P-312", customerName: "Wesley Chapel Medical", propertyName: "Wesley Chapel Medical Plaza", address: "27822 New Tampa Pkwy", zip: "33544", contractMonthlyCents: 540000, nteCeilingCents: 220000, scope: "Medical office complex · 8-building campus", coiOnFile: true, coiExpiry: "2026-10-04", status: "active", ownerKind: "office", acreage: 5.6 },
];

export const customerById = (id: string): Property | undefined =>
  PROPERTIES.find((p) => p.id === id);

export type WorkOrder = {
  id: string;
  propertyId: string;
  description: string;
  estimateCents: number;
  status: "draft" | "submitted" | "approved" | "in_progress" | "complete" | "denied";
  approvedAt: string | null;
  startDate: string | null;
  completedAt: string | null;
};

export const WORK_ORDERS: WorkOrder[] = [
  { id: "MG-WO-1011", propertyId: "MG-P-303", description: "Hurricane prep: anchor 4 entry monument flags + tie 12 royal palms", estimateCents: 184000, status: "approved", approvedAt: "2026-05-10", startDate: "2026-05-15", completedAt: null },
  { id: "MG-WO-1012", propertyId: "MG-P-309", description: "Lake-bank erosion control · 240 LF riprap + native plant restoration", estimateCents: 320000, status: "submitted", approvedAt: null, startDate: null, completedAt: null },
  { id: "MG-WO-1013", propertyId: "MG-P-301", description: "Replace 3 dead Florida boxwoods at south entry", estimateCents: 48000, status: "complete", approvedAt: "2026-04-28", startDate: "2026-05-02", completedAt: "2026-05-04" },
  { id: "MG-WO-1014", propertyId: "MG-P-304", description: "Mulch refresh · 8 common-area beds · 18 cu yd", estimateCents: 96000, status: "in_progress", approvedAt: "2026-05-08", startDate: "2026-05-12", completedAt: null },
  { id: "MG-WO-1015", propertyId: "MG-P-308", description: "Retention pond outflow blockage clearance · emergency", estimateCents: 142000, status: "approved", approvedAt: "2026-05-12", startDate: "2026-05-13", completedAt: null },
  { id: "MG-WO-1016", propertyId: "MG-P-305", description: "Front-tenant entry redesign · plant palette + signage bed", estimateCents: 78000, status: "denied", approvedAt: null, startDate: null, completedAt: null },
];

export type Activity = {
  id: string;
  at: string;
  kind: "wo" | "review" | "lead" | "payment" | "alert";
  text: string;
};

export const ACTIVITY: Activity[] = [
  { id: "A1", at: "9:38 AM", kind: "wo", text: "WO-1015 approved · Tampa Industrial outflow clearance starts tomorrow." },
  { id: "A2", at: "9:12 AM", kind: "alert", text: "Sorrento Hills COI expires May 30 · renewal in flight w/ underwriter." },
  { id: "A3", at: "8:45 AM", kind: "review", text: "★★★★★ from Westshore REIT property manager: \"Predictable, audit-clean, never late.\"" },
  { id: "A4", at: "8:22 AM", kind: "payment", text: "Westshore Plaza · $4,820 monthly contract auto-paid via ACH." },
  { id: "A5", at: "7:58 AM", kind: "lead", text: "RFP from Pinellas County Schools · 22-campus contract opportunity." },
];

export const KPIS = {
  activeContracts: PROPERTIES.filter((p) => p.status === "active").length,
  monthlyRecurring: PROPERTIES.filter((p) => p.status === "active").reduce(
    (s, p) => s + p.contractMonthlyCents,
    0,
  ),
  workOrdersInFlight: WORK_ORDERS.filter((w) =>
    ["approved", "in_progress", "submitted"].includes(w.status),
  ).length,
  woPendingApproval: WORK_ORDERS.filter((w) => w.status === "submitted").length,
  coiExpiringSoon: PROPERTIES.filter(
    (p) =>
      p.coiOnFile &&
      p.coiExpiry &&
      new Date(p.coiExpiry).getTime() < Date.now() + 60 * 24 * 60 * 60 * 1000,
  ).length,
  coiMissing: PROPERTIES.filter((p) => !p.coiOnFile).length,
};
