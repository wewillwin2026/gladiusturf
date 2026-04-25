/**
 * Fake but plausible data for the /books/demo sandbox.
 *
 * Numbers are tuned to a mid-size landscape shop (~$2.4M ARR, ~12 crews, mixed
 * service-line book — mowing, fert, hardscape, snow, plus surplus). All values
 * are illustrative; sandbox writes nothing.
 */

export type Period = "MTD" | "QTD" | "YTD";

export type ServiceLineRow = {
  name: string;
  revenue: number;
  cost: number;
  marginPct: number;
};

export type ExpenseEntry = {
  id: string;
  vendor: string;
  category: "Fuel" | "Materials" | "Equipment" | "Subcontractor";
  confidence: number;
  jobMatch: string;
  amount: number;
  status: "Posted" | "Review";
  capturedAt: string;
  account: string;
};

export type CoaNode = {
  number: string;
  name: string;
  ytd: number;
  children: { number: string; name: string; ytd: number }[];
};

export type ReportButton = {
  key: string;
  name: string;
  format: "PDF" | "CSV";
};

export const SHOP = {
  name: "Greenleaf Crew",
  initials: "GC",
  bookkeeper: "M. Halverson",
  lastReconciliation: "2026-04-23",
  disputes: 0,
};

export const HEADLINE = {
  revenue: 2_400_000,
  cost: 1_788_000,
  net: 612_000,
  marginPct: 25.5,
  yoyRevenuePct: 18,
  yoyNetPct: 21,
};

export const SERVICE_LINES: ServiceLineRow[] = [
  { name: "Mowing & Maintenance", revenue: 890_000, cost: 640_800, marginPct: 28 },
  { name: "Fertilization Program", revenue: 420_000, cost: 285_600, marginPct: 32 },
  { name: "Hardscape Installs", revenue: 640_000, cost: 499_200, marginPct: 22 },
  { name: "Snow & Ice Contracts", revenue: 180_000, cost: 106_200, marginPct: 41 },
  { name: "Other (Irrigation, Cleanup)", revenue: 270_000, cost: 218_700, marginPct: 19 },
];

export const EXPENSE_FEED: ExpenseEntry[] = [
  {
    id: "exp-44218",
    vendor: "Shell #4421",
    category: "Fuel",
    confidence: 98,
    jobMatch: "Truck-04 · MOW-1882",
    amount: 46.91,
    status: "Posted",
    capturedAt: "07:14 AM",
    account: "6210 · Vehicle Fuel",
  },
  {
    id: "exp-44219",
    vendor: "SiteOne Landscape Supply",
    category: "Materials",
    confidence: 97,
    jobMatch: "Job #4128 · Watson property",
    amount: 1_284.55,
    status: "Posted",
    capturedAt: "08:02 AM",
    account: "5110 · Mulch & Soil",
  },
  {
    id: "exp-44220",
    vendor: "BWI Companies",
    category: "Materials",
    confidence: 96,
    jobMatch: "Job #4131 · Henderson Estate",
    amount: 612.40,
    status: "Posted",
    capturedAt: "08:46 AM",
    account: "5120 · Fertilizer",
  },
  {
    id: "exp-44221",
    vendor: "Sunbelt Rentals",
    category: "Equipment",
    confidence: 92,
    jobMatch: "Job #4127 · Maple Ridge HOA",
    amount: 340.21,
    status: "Posted",
    capturedAt: "09:11 AM",
    account: "6110 · Equipment Rental",
  },
  {
    id: "exp-44222",
    vendor: "BP Fuel #218",
    category: "Fuel",
    confidence: 99,
    jobMatch: "Truck-07 · Mowing route",
    amount: 88.14,
    status: "Posted",
    capturedAt: "09:38 AM",
    account: "6210 · Vehicle Fuel",
  },
  {
    id: "exp-44223",
    vendor: "Home Depot Pro",
    category: "Materials",
    confidence: 78,
    jobMatch: "Job #4134 · Riverside install",
    amount: 412.07,
    status: "Review",
    capturedAt: "10:22 AM",
    account: "(unassigned)",
  },
  {
    id: "exp-44224",
    vendor: "John Deere Service Center",
    category: "Equipment",
    confidence: 95,
    jobMatch: "Mower-12 · Maintenance",
    amount: 1_874.00,
    status: "Posted",
    capturedAt: "11:04 AM",
    account: "6130 · Equipment Repair",
  },
  {
    id: "exp-44225",
    vendor: "Aguilar Tree Services LLC",
    category: "Subcontractor",
    confidence: 94,
    jobMatch: "Job #4129 · Watson property",
    amount: 2_400.00,
    status: "Posted",
    capturedAt: "11:48 AM",
    account: "5310 · Tree Sub-labor",
  },
  {
    id: "exp-44226",
    vendor: "Ewing Irrigation",
    category: "Materials",
    confidence: 96,
    jobMatch: "Job #4133 · Cardinal Drive",
    amount: 218.92,
    status: "Posted",
    capturedAt: "12:30 PM",
    account: "5140 · Irrigation Supply",
  },
  {
    id: "exp-44227",
    vendor: "Kwik Trip #2188",
    category: "Fuel",
    confidence: 84,
    jobMatch: "Truck-02 · (no job match)",
    amount: 62.40,
    status: "Review",
    capturedAt: "01:15 PM",
    account: "(unassigned)",
  },
  {
    id: "exp-44228",
    vendor: "Lowe's Pro Supply",
    category: "Materials",
    confidence: 97,
    jobMatch: "Job #4136 · Oakwood retainer",
    amount: 156.78,
    status: "Posted",
    capturedAt: "02:04 PM",
    account: "5110 · Mulch & Soil",
  },
  {
    id: "exp-44229",
    vendor: "United Rentals",
    category: "Equipment",
    confidence: 96,
    jobMatch: "Job #4127 · Maple Ridge HOA",
    amount: 894.50,
    status: "Posted",
    capturedAt: "03:22 PM",
    account: "6110 · Equipment Rental",
  },
];

export const COA: CoaNode[] = [
  {
    number: "4000",
    name: "Revenue",
    ytd: 2_400_000,
    children: [
      { number: "4010", name: "Service Revenue", ytd: 2_130_000 },
      { number: "4020", name: "Add-on Revenue", ytd: 184_000 },
      { number: "4030", name: "Surplus Yard Sales", ytd: 86_000 },
    ],
  },
  {
    number: "5000",
    name: "Cost of Goods Sold",
    ytd: 1_492_000,
    children: [
      { number: "5100", name: "Materials", ytd: 488_000 },
      { number: "5300", name: "Sub-labor", ytd: 312_000 },
      { number: "6100", name: "Equipment Burn", ytd: 376_000 },
      { number: "6200", name: "Vehicle Fuel", ytd: 316_000 },
    ],
  },
  {
    number: "6000",
    name: "Operating Expenses",
    ytd: 296_000,
    children: [
      { number: "6310", name: "Office", ytd: 42_000 },
      { number: "6320", name: "Marketing", ytd: 88_000 },
      { number: "6330", name: "Insurance", ytd: 124_000 },
      { number: "6340", name: "Software", ytd: 42_000 },
    ],
  },
  {
    number: "9000",
    name: "Other",
    ytd: 0,
    children: [
      { number: "9010", name: "Tax (estimated)", ytd: 142_000 },
      { number: "9020", name: "Interest Expense", ytd: 18_400 },
      { number: "9030", name: "Depreciation", ytd: 88_200 },
    ],
  },
];

export const REPORTS: ReportButton[] = [
  { key: "pnl", name: "P&L", format: "PDF" },
  { key: "bs", name: "Balance Sheet", format: "PDF" },
  { key: "cf", name: "Cash Flow", format: "PDF" },
  { key: "1099", name: "1099-NEC packet", format: "CSV" },
  { key: "schc", name: "Schedule C summary", format: "PDF" },
  { key: "audit", name: "Audit log", format: "CSV" },
];

export const formatUsd = (n: number): string =>
  `$${Math.round(n).toLocaleString("en-US")}`;

export const formatUsdShort = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toFixed(0)}`;
};

export const formatUsdCents = (n: number): string =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
