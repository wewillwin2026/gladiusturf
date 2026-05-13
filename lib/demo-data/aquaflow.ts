/**
 * Aquaflow Irrigation — fictional irrigation service demo seed
 * (2026-05-13). Tampa/St-Pete service area, 89 properties on contract,
 * 4 service routes, distinctive: annual backflow filings (mandatory FL
 * compliance), valve / controller history per zone.
 */

export const BRAND = {
  name: "Aquaflow Irrigation",
  shortName: "Aquaflow",
  founder: "Reggie Mayfield",
  operator: "Reggie Mayfield",
  phone: "(727) 555-0319",
  email: "reggie@aquaflowfl.example",
  website: "aquaflowfl.example",
  yard: "8204 4th St N, St. Petersburg, FL 33702",
  serviceArea: "St. Pete · Pinellas Park · Largo · Tampa · Brandon",
  hours: "Mon–Sat, 7 AM – 4 PM",
  reviewCount: 142,
  reviewStars: 4.9,
  activeProperties: 89,
  founded: "June 2015",
  techs: 3,
} as const;

export type RouteId = "MON" | "TUE" | "WED" | "THU";
export type Route = {
  id: RouteId;
  weekday: "Mon" | "Tue" | "Wed" | "Thu";
  techName: string;
  truck: string;
  stops: number;
  zips: string[];
};
export const ROUTES: Route[] = [
  { id: "MON", weekday: "Mon", techName: "Wes Carrera", truck: "T-301 · Ford Transit", stops: 23, zips: ["33702", "33704", "33709"] },
  { id: "TUE", weekday: "Tue", techName: "Marco Bell", truck: "T-302 · Chevy Express", stops: 22, zips: ["33781", "33773", "33774"] },
  { id: "WED", weekday: "Wed", techName: "Wes Carrera", truck: "T-301 · Ford Transit", stops: 22, zips: ["33510", "33511", "33619"] },
  { id: "THU", weekday: "Thu", techName: "Tomi Akiyama", truck: "T-303 · Ford Transit", stops: 22, zips: ["33549", "33558", "33559"] },
];

export type Customer = {
  id: string;
  name: string;
  address: string;
  zip: string;
  route: RouteId;
  status: "Active" | "Past due" | "Hold";
  monthlyValue: number;
  zones: number;
  controller: string;
  notes?: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "AF-001", name: "Brennan Estate", address: "2014 Coffee Pot Bayou Blvd", zip: "33704", route: "MON", status: "Active", monthlyValue: 195, zones: 8, controller: "Hunter Pro-C" },
  { id: "AF-002", name: "Old Northeast HOA", address: "Park St N", zip: "33704", route: "MON", status: "Active", monthlyValue: 880, zones: 24, controller: "Rain Bird ESP-LXIVM", notes: "Commercial · 14-unit HOA" },
  { id: "AF-003", name: "Snell Family", address: "1622 Snell Isle Blvd NE", zip: "33704", route: "MON", status: "Active", monthlyValue: 245, zones: 12, controller: "Hunter HCC" },
  { id: "AF-004", name: "Tyrone Square Office", address: "6901 22nd Ave N", zip: "33709", route: "MON", status: "Past due", monthlyValue: 540, zones: 16, controller: "Rain Bird ESP-LX", notes: "Invoice AF-2207 — 18 days overdue" },
  { id: "AF-005", name: "Pinellas Park HOA", address: "4900 78th Ave N", zip: "33781", route: "TUE", status: "Active", monthlyValue: 720, zones: 22, controller: "Hunter Pro-C", notes: "Commercial · 38 units" },
  { id: "AF-006", name: "Largo Mall Property", address: "10500 Ulmerton Rd", zip: "33773", route: "TUE", status: "Active", monthlyValue: 1240, zones: 28, controller: "Rain Bird ESP-LXIVM", notes: "Commercial · retail center" },
  { id: "AF-007", name: "Largo Family", address: "11104 Ridge Rd", zip: "33774", route: "TUE", status: "Active", monthlyValue: 165, zones: 6, controller: "Orbit 28QC" },
  { id: "AF-008", name: "Brandon Heights HOA", address: "4022 Brandon Heights", zip: "33511", route: "WED", status: "Active", monthlyValue: 480, zones: 18, controller: "Hunter Pro-C" },
  { id: "AF-009", name: "Riverview Commons", address: "8014 Riverview Dr", zip: "33619", route: "WED", status: "Active", monthlyValue: 320, zones: 14, controller: "Rain Bird ESP-Me" },
  { id: "AF-010", name: "Valrico Family", address: "1808 Valrico Lakes Dr", zip: "33510", route: "WED", status: "Active", monthlyValue: 175, zones: 8, controller: "Hunter X-Core" },
  { id: "AF-011", name: "Lutz Estate", address: "18450 Lutz Lake Fern", zip: "33549", route: "THU", status: "Active", monthlyValue: 285, zones: 14, controller: "Hunter Pro-C", notes: "1.5-acre estate" },
  { id: "AF-012", name: "Connerton HOA", address: "21115 Connerton Pkwy", zip: "33558", route: "THU", status: "Active", monthlyValue: 880, zones: 28, controller: "Rain Bird ESP-LXIVM", notes: "Commercial · 12-building HOA" },
];

export const customerById = (id: string): Customer | undefined =>
  CUSTOMERS.find((c) => c.id === id);

export type BackflowFiling = {
  id: string;
  customerId: string;
  assemblyType: string;
  serialNo: string;
  utilityPortal: "BSI Online" | "JEA" | "Sarasota County" | "Pinellas County" | "Tampa Water";
  lastFiledDate: string;
  nextDueDate: string;
  status: "current" | "due_soon" | "overdue";
  technicianCertNo: string;
};

export const BACKFLOWS: BackflowFiling[] = [
  { id: "BF-001", customerId: "AF-002", assemblyType: "Double Check Valve 1\"", serialNo: "WB-44829", utilityPortal: "BSI Online", lastFiledDate: "2025-06-14", nextDueDate: "2026-06-14", status: "current", technicianCertNo: "FL-BFP-22810" },
  { id: "BF-002", customerId: "AF-005", assemblyType: "Reduced Pressure Zone 1.5\"", serialNo: "WB-46208", utilityPortal: "Pinellas County", lastFiledDate: "2025-05-22", nextDueDate: "2026-05-22", status: "due_soon", technicianCertNo: "FL-BFP-22810" },
  { id: "BF-003", customerId: "AF-006", assemblyType: "Reduced Pressure Zone 2\"", serialNo: "WB-47119", utilityPortal: "Pinellas County", lastFiledDate: "2025-04-09", nextDueDate: "2026-04-09", status: "overdue", technicianCertNo: "FL-BFP-22810", },
  { id: "BF-004", customerId: "AF-008", assemblyType: "Double Check Valve 1\"", serialNo: "WB-49002", utilityPortal: "Tampa Water", lastFiledDate: "2025-08-30", nextDueDate: "2026-08-30", status: "current", technicianCertNo: "FL-BFP-30115" },
  { id: "BF-005", customerId: "AF-012", assemblyType: "Reduced Pressure Zone 1.5\"", serialNo: "WB-51202", utilityPortal: "Pinellas County", lastFiledDate: "2025-10-12", nextDueDate: "2026-10-12", status: "current", technicianCertNo: "FL-BFP-22810" },
  { id: "BF-006", customerId: "AF-009", assemblyType: "Pressure Vacuum Breaker 1\"", serialNo: "WB-52401", utilityPortal: "Tampa Water", lastFiledDate: "2025-07-04", nextDueDate: "2026-07-04", status: "due_soon", technicianCertNo: "FL-BFP-30115" },
  { id: "BF-007", customerId: "AF-004", assemblyType: "Double Check Valve 1\"", serialNo: "WB-53310", utilityPortal: "Pinellas County", lastFiledDate: "2025-03-18", nextDueDate: "2026-03-18", status: "overdue", technicianCertNo: "FL-BFP-22810" },
];

export type Activity = {
  id: string;
  at: string;
  kind: "service" | "alert" | "review" | "payment" | "lead";
  text: string;
};

export const ACTIVITY: Activity[] = [
  { id: "A1", at: "9:30 AM", kind: "service", text: "Wes started Monday route — 23 stops, T-301 fueled, manifold parts staged." },
  { id: "A2", at: "9:11 AM", kind: "alert", text: "2 overdue backflow filings — Tyrone Square + Snell Family need a tech tomorrow." },
  { id: "A3", at: "8:48 AM", kind: "review", text: "★★★★★ from Old Northeast HOA: \"Wes spotted a 3-AM run we never knew about.\"" },
  { id: "A4", at: "8:32 AM", kind: "payment", text: "Brennan Estate · $195 monthly auto-pay processed." },
  { id: "A5", at: "8:15 AM", kind: "lead", text: "New lead from Lutz Lake Estates — full system audit + new controller." },
];

export const KPIS = {
  activeProperties: 89,
  routes: ROUTES.length,
  monthlyRecurring: 21_950_00, // rough sum of monthly values
  backflowsTotal: BACKFLOWS.length,
  backflowsOverdue: BACKFLOWS.filter((b) => b.status === "overdue").length,
  backflowsDueSoon: BACKFLOWS.filter((b) => b.status === "due_soon").length,
};
