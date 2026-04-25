// Sandbox data for /payroll/demo. Hand-authored, typed, and stable across
// renders so the page reads the same on every refresh. No randomness — owners
// expect the numbers in a demo to add up if they ever total them.

export type CrewType = "w2" | "1099";
export type CrewRole = "Crew Chief" | "Field Tech" | "Subcontractor";
export type CrewState = "FL" | "GA" | "TX" | "NC";
export type CrewStatus = "ready" | "pending-tin";

export type CrewRow = {
  id: string;
  firstName: string;
  lastName: string;
  type: CrewType;
  role: CrewRole;
  state: CrewState;
  hours: number;
  ot: number;
  rate: number; // hourly base rate, used for gross calc display only
  gross: number; // pre-computed so the table totals match exactly
  status: CrewStatus;
  routingLast4: string;
  accountLast4: string;
};

export const PAY_PERIOD = {
  label: "Apr 14 - Apr 27, 2026",
  depositLands: "Tue Apr 30",
  crewCount: 12,
  totalHours: 1127,
  totalGross: 58400,
};

export const CREW_ROWS: CrewRow[] = [
  {
    id: "c01",
    firstName: "Marcus",
    lastName: "Thompson",
    type: "w2",
    role: "Crew Chief",
    state: "FL",
    hours: 88,
    ot: 8,
    rate: 32,
    gross: 3008,
    status: "ready",
    routingLast4: "4421",
    accountLast4: "8190",
  },
  {
    id: "c02",
    firstName: "James",
    lastName: "Velazquez",
    type: "w2",
    role: "Crew Chief",
    state: "GA",
    hours: 86.5,
    ot: 6.5,
    rate: 31,
    gross: 2880,
    status: "ready",
    routingLast4: "1102",
    accountLast4: "7733",
  },
  {
    id: "c03",
    firstName: "Tiffany",
    lastName: "Reeves",
    type: "w2",
    role: "Field Tech",
    state: "FL",
    hours: 80,
    ot: 0,
    rate: 24,
    gross: 1920,
    status: "ready",
    routingLast4: "9981",
    accountLast4: "2204",
  },
  {
    id: "c04",
    firstName: "Devin",
    lastName: "Okafor",
    type: "w2",
    role: "Field Tech",
    state: "FL",
    hours: 82.5,
    ot: 2.5,
    rate: 23,
    gross: 1983,
    status: "ready",
    routingLast4: "5510",
    accountLast4: "6618",
  },
  {
    id: "c05",
    firstName: "Sergio",
    lastName: "Mendoza",
    type: "w2",
    role: "Field Tech",
    state: "TX",
    hours: 90,
    ot: 10,
    rate: 25,
    gross: 2375,
    status: "ready",
    routingLast4: "4408",
    accountLast4: "9921",
  },
  {
    id: "c06",
    firstName: "Brittany",
    lastName: "Hollis",
    type: "w2",
    role: "Field Tech",
    state: "GA",
    hours: 79,
    ot: 0,
    rate: 22,
    gross: 1738,
    status: "ready",
    routingLast4: "2245",
    accountLast4: "1107",
  },
  {
    id: "c07",
    firstName: "Andre",
    lastName: "Whitfield",
    type: "w2",
    role: "Field Tech",
    state: "NC",
    hours: 84,
    ot: 4,
    rate: 24,
    gross: 2064,
    status: "ready",
    routingLast4: "8870",
    accountLast4: "5544",
  },
  {
    id: "c08",
    firstName: "Lucia",
    lastName: "Salgado",
    type: "w2",
    role: "Field Tech",
    state: "TX",
    hours: 78,
    ot: 0,
    rate: 22,
    gross: 1716,
    status: "ready",
    routingLast4: "3309",
    accountLast4: "8826",
  },
  {
    id: "c09",
    firstName: "Tyrell",
    lastName: "Banks",
    type: "w2",
    role: "Field Tech",
    state: "NC",
    hours: 81.5,
    ot: 1.5,
    rate: 23,
    gross: 1909,
    status: "ready",
    routingLast4: "6671",
    accountLast4: "3322",
  },
  {
    id: "c10",
    firstName: "Hawthorne",
    lastName: "Tree Co.",
    type: "1099",
    role: "Subcontractor",
    state: "FL",
    hours: 110,
    ot: 0,
    rate: 65,
    gross: 7150,
    status: "ready",
    routingLast4: "—",
    accountLast4: "ACH",
  },
  {
    id: "c11",
    firstName: "Aqua Drip",
    lastName: "Irrigation",
    type: "1099",
    role: "Subcontractor",
    state: "GA",
    hours: 64,
    ot: 0,
    rate: 58,
    gross: 3712,
    status: "ready",
    routingLast4: "—",
    accountLast4: "ACH",
  },
  {
    id: "c12",
    firstName: "Stones &",
    lastName: "Slabs Inc.",
    type: "1099",
    role: "Subcontractor",
    state: "TX",
    hours: 103.5,
    ot: 0,
    rate: 60,
    gross: 6210,
    status: "pending-tin",
    routingLast4: "—",
    accountLast4: "ACH",
  },
];

export type StateFiling = {
  state: CrewState;
  amount: number;
  filings: string;
};

export const STATE_FILINGS: StateFiling[] = [
  { state: "FL", amount: 0, filings: "RT-6 reemployment tax" },
  { state: "GA", amount: 412, filings: "G-7 withholding · DOL-4N" },
  { state: "TX", amount: 0, filings: "C-3 unemployment" },
  { state: "NC", amount: 248, filings: "NC-5 withholding · NCUI-101" },
];

export const FEDERAL_WITHHOLDING = 6840;

export type OtRule = {
  state: CrewState | "Federal";
  rule: string;
  triggered: string;
};

export const OT_RULES: OtRule[] = [
  {
    state: "Federal",
    rule: "Weekly OT > 40h · 1.5x",
    triggered: "Mendoza (10h), Thompson (8h), Velazquez (6.5h)",
  },
  {
    state: "FL",
    rule: "Davis-Bacon supplemental · municipal job",
    triggered: "Thompson · Sarasota County park · $185.00",
  },
];

export type StubRow = {
  id: string;
  name: string;
  gross: number;
  fedTax: number;
  stateTax: number;
  fica: number;
  net: number;
};

// Subset for the modal review step — keeps the UI tidy.
export const STUB_PREVIEW: StubRow[] = [
  {
    id: "c01",
    name: "Marcus Thompson",
    gross: 3008,
    fedTax: 421,
    stateTax: 0,
    fica: 230,
    net: 2357,
  },
  {
    id: "c02",
    name: "James Velazquez",
    gross: 2880,
    fedTax: 403,
    stateTax: 173,
    fica: 220,
    net: 2084,
  },
  {
    id: "c05",
    name: "Sergio Mendoza",
    gross: 2375,
    fedTax: 332,
    stateTax: 0,
    fica: 182,
    net: 1861,
  },
];

export const NET_DEPOSIT_TOTAL = 44280;
export const TAX_TOTAL = 7500;
export const FUND_TOTAL = PAY_PERIOD.totalGross + 1380; // gross + employer-side FICA/SUTA

export const COMPLIANCE_FOOTER = {
  auditPacket: "DOL audit packet: Q1 2026 ready",
  qbSync: "Last sync to QuickBooks: 18 min ago",
  unposted: "0 unposted entries",
};

export const TIN_PENDING_VENDOR = "Stones & Slabs Inc.";
