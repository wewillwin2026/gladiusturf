/**
 * Blue Haven Pool Service — fictional weekly-route pool service demo
 * (2026-05-13). Tampa-area company, 162 residential pools on the
 * weekly route, 4 service routes, 3 techs + 1 supervisor.
 *
 * Service-day cadence + per-pool chemistry log is the distinctive
 * vertical shape: every pool needs a free chlorine + pH + total
 * alkalinity reading every visit, logged in DPD or test-strip form,
 * dosed against drift.
 */

export const BRAND = {
  name: "Blue Haven Pool Service",
  shortName: "Blue Haven",
  founder: "Theo Marquez",
  operator: "Theo Marquez",
  phone: "(813) 555-0244",
  email: "theo@bluehavenpools.example",
  website: "bluehavenpools.example",
  yard: "10402 N Florida Ave, Tampa, FL 33612",
  serviceArea: "Tampa · St. Pete · Brandon · Wesley Chapel",
  hours: "Mon–Sat, 6 AM – 5 PM",
  reviewCount: 184,
  reviewStars: 4.8,
  activePools: 162,
  founded: "April 2018",
  techs: 3,
  supervisors: 1,
} as const;

export type RouteId = "MON" | "TUE" | "WED" | "THU" | "FRI";

export type ServiceRoute = {
  id: RouteId;
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  techName: string;
  truck: string;
  stops: number;
  zips: string[];
};

export const ROUTES: ServiceRoute[] = [
  { id: "MON", weekday: "Mon", techName: "Carlos Mendez", truck: "T-201 · Chevy Silverado", stops: 34, zips: ["33612", "33613", "33614"] },
  { id: "TUE", weekday: "Tue", techName: "Andre Park", truck: "T-202 · Ford F-150", stops: 30, zips: ["33647", "33549", "33544"] },
  { id: "WED", weekday: "Wed", techName: "Carlos Mendez", truck: "T-201 · Chevy Silverado", stops: 32, zips: ["33510", "33511", "33594"] },
  { id: "THU", weekday: "Thu", techName: "Ricky Allen", truck: "T-203 · Toyota Tundra", stops: 33, zips: ["33701", "33703", "33704"] },
  { id: "FRI", weekday: "Fri", techName: "Ricky Allen", truck: "T-203 · Toyota Tundra", stops: 33, zips: ["33619", "33637", "33559"] },
];

export const colorForRoute = (id: RouteId): string => {
  switch (id) {
    case "MON":
      return "#7CC8E8";
    case "TUE":
      return "#5BCC56";
    case "WED":
      return "#F4B860";
    case "THU":
      return "#A8E89D";
    case "FRI":
      return "#7CC8E8";
  }
};

export type Customer = {
  id: string;
  name: string;
  address: string;
  zip: string;
  route: RouteId;
  status: "Active" | "Past due" | "Hold";
  monthlyValue: number;
  pool: "in-ground" | "above-ground" | "spa";
  gallons: number;
  notes?: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "BH-001", name: "Reeve Family", address: "12104 Live Oak Dr", zip: "33612", route: "MON", status: "Active", monthlyValue: 165, pool: "in-ground", gallons: 14000 },
  { id: "BH-002", name: "Linton Property", address: "1808 Carrollwood Ln", zip: "33613", route: "MON", status: "Active", monthlyValue: 195, pool: "in-ground", gallons: 18000, notes: "Saltwater system" },
  { id: "BH-003", name: "Briarwood Townhomes HOA", address: "8200 Briarwood Way", zip: "33614", route: "MON", status: "Active", monthlyValue: 720, pool: "in-ground", gallons: 65000, notes: "Commercial · 28 units" },
  { id: "BH-004", name: "Park Family", address: "30817 Wesley Chapel Pkwy", zip: "33544", route: "TUE", status: "Active", monthlyValue: 175, pool: "in-ground", gallons: 16000 },
  { id: "BH-005", name: "Kingsbury Estate", address: "27822 New Tampa Blvd", zip: "33647", route: "TUE", status: "Active", monthlyValue: 340, pool: "in-ground", gallons: 32000, notes: "Pool + spa combo" },
  { id: "BH-006", name: "Vega Residence", address: "1808 Lutz Lake Fern", zip: "33549", route: "TUE", status: "Past due", monthlyValue: 145, pool: "in-ground", gallons: 12000, notes: "Invoice #BH-2207 — 22 days overdue" },
  { id: "BH-007", name: "Brandon Heights HOA", address: "4022 Brandon Heights", zip: "33511", route: "WED", status: "Active", monthlyValue: 540, pool: "in-ground", gallons: 48000, notes: "Commercial · clubhouse pool" },
  { id: "BH-008", name: "Cohen Family", address: "1212 Valrico Lakes", zip: "33594", route: "WED", status: "Active", monthlyValue: 165, pool: "in-ground", gallons: 14000 },
  { id: "BH-009", name: "Bishop Property", address: "606 Brandon Crossing", zip: "33510", route: "WED", status: "Active", monthlyValue: 195, pool: "in-ground", gallons: 18000 },
  { id: "BH-010", name: "Old Northeast Residence", address: "418 17th Ave NE", zip: "33704", route: "THU", status: "Active", monthlyValue: 215, pool: "in-ground", gallons: 22000, notes: "Heated · year-round" },
  { id: "BH-011", name: "Crescent Lake Estate", address: "2200 Burlington Ave N", zip: "33713", route: "THU", status: "Active", monthlyValue: 285, pool: "in-ground", gallons: 28000 },
  { id: "BH-012", name: "Snell Isle HOA", address: "Coffee Pot Bayou Blvd", zip: "33704", route: "THU", status: "Active", monthlyValue: 920, pool: "in-ground", gallons: 84000, notes: "Commercial · multi-pool" },
  { id: "BH-013", name: "Brandon Family", address: "8014 Riverview Dr", zip: "33619", route: "FRI", status: "Active", monthlyValue: 175, pool: "in-ground", gallons: 16000 },
  { id: "BH-014", name: "Henderson Residence", address: "13422 Bruce B Downs", zip: "33637", route: "FRI", status: "Active", monthlyValue: 195, pool: "in-ground", gallons: 18000 },
  { id: "BH-015", name: "Lake Padgett Estate", address: "4022 Lake Padgett Blvd", zip: "33559", route: "FRI", status: "Active", monthlyValue: 255, pool: "in-ground", gallons: 24000 },
];

export const customerById = (id: string): Customer | undefined =>
  CUSTOMERS.find((c) => c.id === id);

export type ChemistryReading = {
  id: string;
  date: string;
  customerId: string;
  techName: string;
  free_cl_ppm: number; // free chlorine
  ph: number;
  total_alkalinity_ppm: number;
  cyanuric_acid_ppm: number | null;
  calcium_hardness_ppm: number | null;
  result: "balanced" | "high_cl" | "low_cl" | "high_ph" | "low_ph" | "off";
  dosed: string | null;
};

export const CHEMISTRY: ChemistryReading[] = [
  { id: "BH-CH-1042", date: "2026-05-11", customerId: "BH-005", techName: "Andre Park", free_cl_ppm: 2.4, ph: 7.4, total_alkalinity_ppm: 105, cyanuric_acid_ppm: 38, calcium_hardness_ppm: 220, result: "balanced", dosed: null },
  { id: "BH-CH-1041", date: "2026-05-11", customerId: "BH-006", techName: "Andre Park", free_cl_ppm: 0.4, ph: 7.9, total_alkalinity_ppm: 78, cyanuric_acid_ppm: 22, calcium_hardness_ppm: 180, result: "low_cl", dosed: "Cal-hypo 2 lb · MA 16 oz" },
  { id: "BH-CH-1040", date: "2026-05-12", customerId: "BH-008", techName: "Carlos Mendez", free_cl_ppm: 1.6, ph: 7.5, total_alkalinity_ppm: 90, cyanuric_acid_ppm: 32, calcium_hardness_ppm: 200, result: "balanced", dosed: null },
  { id: "BH-CH-1039", date: "2026-05-12", customerId: "BH-009", techName: "Carlos Mendez", free_cl_ppm: 4.8, ph: 7.2, total_alkalinity_ppm: 80, cyanuric_acid_ppm: 28, calcium_hardness_ppm: 190, result: "high_cl", dosed: "Drain 1/4 · sun off-gas" },
  { id: "BH-CH-1038", date: "2026-05-11", customerId: "BH-001", techName: "Carlos Mendez", free_cl_ppm: 2.0, ph: 7.6, total_alkalinity_ppm: 100, cyanuric_acid_ppm: 35, calcium_hardness_ppm: 210, result: "balanced", dosed: null },
  { id: "BH-CH-1037", date: "2026-05-11", customerId: "BH-003", techName: "Carlos Mendez", free_cl_ppm: 3.1, ph: 8.0, total_alkalinity_ppm: 130, cyanuric_acid_ppm: 50, calcium_hardness_ppm: 260, result: "high_ph", dosed: "Muriatic acid 32 oz" },
  { id: "BH-CH-1036", date: "2026-05-08", customerId: "BH-010", techName: "Ricky Allen", free_cl_ppm: 2.8, ph: 7.5, total_alkalinity_ppm: 110, cyanuric_acid_ppm: 40, calcium_hardness_ppm: 240, result: "balanced", dosed: null },
  { id: "BH-CH-1035", date: "2026-05-08", customerId: "BH-012", techName: "Ricky Allen", free_cl_ppm: 1.4, ph: 7.6, total_alkalinity_ppm: 95, cyanuric_acid_ppm: 30, calcium_hardness_ppm: 210, result: "balanced", dosed: null },
  { id: "BH-CH-1034", date: "2026-05-09", customerId: "BH-013", techName: "Ricky Allen", free_cl_ppm: 0.8, ph: 7.7, total_alkalinity_ppm: 88, cyanuric_acid_ppm: 26, calcium_hardness_ppm: 195, result: "low_cl", dosed: "Cal-hypo 1.5 lb" },
  { id: "BH-CH-1033", date: "2026-05-09", customerId: "BH-014", techName: "Ricky Allen", free_cl_ppm: 2.2, ph: 7.4, total_alkalinity_ppm: 100, cyanuric_acid_ppm: 35, calcium_hardness_ppm: 220, result: "balanced", dosed: null },
];

export type Activity = {
  id: string;
  at: string;
  kind: "service" | "alert" | "review" | "payment" | "lead";
  text: string;
};

export const ACTIVITY: Activity[] = [
  { id: "A1", at: "9:31 AM", kind: "service", text: "Carlos started Monday route — 34 pools queued, T-201 fueled." },
  { id: "A2", at: "9:18 AM", kind: "alert", text: "Vega Residence chemistry: FC 0.4 ppm, dosed cal-hypo. Recheck Wed." },
  { id: "A3", at: "8:51 AM", kind: "review", text: "★★★★★ from Briarwood HOA: \"Carlos is the most reliable tech we've had.\"" },
  { id: "A4", at: "8:42 AM", kind: "payment", text: "Reeve Family · $165 monthly auto-pay processed." },
  { id: "A5", at: "8:20 AM", kind: "lead", text: "New inquiry: Carrollwood Spa — weekly + chemistry pack." },
];

export const KPIS = {
  activePools: 162,
  routes: 5,
  monthlyRecurring: 32_180_00, // $32,180 in cents — approx 162 × $199 avg
  pastDueCount: 3,
  pastDueAmount: 765_00,
  chemistryLogged: CHEMISTRY.length,
  chemistryOff: CHEMISTRY.filter((c) => c.result !== "balanced").length,
  reviewLifetime: 184,
  reviewStars: 4.8,
};
