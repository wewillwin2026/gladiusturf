/**
 * Bright Lights inventory — offline demo data.
 *
 * Mirrors supabase/migrations/20260505_j_bright_lights_inventory.sql but
 * with `receivedAt` computed dynamically (`daysAgo(n)`) so the aging
 * cohorts always read fresh / aging / stale / dead regardless of when the
 * page is loaded. Lets us run the sales demo with no Supabase round-trip.
 */

const DAY_MS = 86_400_000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString();
}

export type DemoUnitStatus = "in_stock" | "deployed" | "damaged";

export type DemoInventoryUnit = {
  qrCode: string;
  status: DemoUnitStatus;
  receivedAt: string;
  costCents: number | null;
  location: string | null;
};

export type DemoInventoryCategory =
  | "fixture"
  | "transformer"
  | "wire"
  | "controller"
  | "sensor"
  | "bulb"
  | "accessory"
  | "other";

export type DemoInventoryItem = {
  sku: string;
  name: string;
  category: DemoInventoryCategory;
  groupLabel: string | null;
  brand: string | null;
  unit: string;
  unitCostCents: number | null;
  unitPriceCents: number | null;
  parLevel: number | null;
  units: DemoInventoryUnit[];
};

export const BRIGHT_LIGHTS_INVENTORY: DemoInventoryItem[] = [
  {
    sku: "CAST-PATH-LED3W",
    name: "Cast LED Path Light · 3W",
    category: "fixture",
    groupLabel: "Path",
    brand: "Cast Lighting",
    unit: "ea",
    unitCostCents: 10175,
    unitPriceCents: 18500,
    parLevel: 20,
    units: [
      { qrCode: "BL-INV-CPL11-A1", status: "in_stock", receivedAt: daysAgo(7), costCents: 10175, location: "Truck 1 · Bay A" },
      { qrCode: "BL-INV-CPL11-A2", status: "in_stock", receivedAt: daysAgo(7), costCents: 10175, location: "Truck 1 · Bay A" },
      { qrCode: "BL-INV-CPL11-A3", status: "in_stock", receivedAt: daysAgo(7), costCents: 10175, location: "Truck 1 · Bay A" },
      { qrCode: "BL-INV-CPL11-A4", status: "in_stock", receivedAt: daysAgo(7), costCents: 10175, location: "Shelf B · Workshop" },
      { qrCode: "BL-INV-CPL11-A5", status: "in_stock", receivedAt: daysAgo(7), costCents: 10175, location: "Shelf B · Workshop" },
    ],
  },
  {
    sku: "CAST-UPLT-MR16-5W",
    name: "Cast Up-light · 5W MR16",
    category: "fixture",
    groupLabel: "Up-light",
    brand: "Cast Lighting",
    unit: "ea",
    unitCostCents: 11825,
    unitPriceCents: 21500,
    parLevel: 15,
    units: [
      { qrCode: "BL-INV-CWL5-B1", status: "in_stock", receivedAt: daysAgo(60), costCents: 11825, location: "Shelf C · Workshop" },
      { qrCode: "BL-INV-CWL5-B2", status: "in_stock", receivedAt: daysAgo(60), costCents: 11825, location: "Shelf C · Workshop" },
      { qrCode: "BL-INV-CWL5-B3", status: "in_stock", receivedAt: daysAgo(60), costCents: 11825, location: "Shelf C · Workshop" },
    ],
  },
  {
    sku: "UNIQUE-WELL-7W",
    name: "Unique Well Light · 7W",
    category: "fixture",
    groupLabel: "Well",
    brand: "Unique Lighting Systems",
    unit: "ea",
    unitCostCents: 13475,
    unitPriceCents: 24500,
    parLevel: 10,
    units: [],
  },
  {
    sku: "CAST-STEP-LED",
    name: "Cast Step / Deck Light",
    category: "fixture",
    groupLabel: "Step",
    brand: "Cast Lighting",
    unit: "ea",
    unitCostCents: 10725,
    unitPriceCents: 19500,
    parLevel: 10,
    units: [
      { qrCode: "BL-INV-CST7-G1", status: "deployed", receivedAt: daysAgo(20), costCents: 10725, location: "Mike Jackson — BL-MJ" },
    ],
  },
  {
    sku: "FX-HARDSCAPE",
    name: "FX Hardscape Light",
    category: "fixture",
    groupLabel: "Hardscape",
    brand: "FX Luminaire",
    unit: "ea",
    unitCostCents: 14575,
    unitPriceCents: 26500,
    parLevel: 8,
    units: [],
  },
  {
    sku: "UNIQUE-POND-9W",
    name: "Unique Underwater · 9W",
    category: "fixture",
    groupLabel: "Underwater",
    brand: "Unique Lighting Systems",
    unit: "ea",
    unitCostCents: 21175,
    unitPriceCents: 38500,
    parLevel: 5,
    units: [
      { qrCode: "BL-INV-PND-C1", status: "in_stock", receivedAt: daysAgo(120), costCents: 21175, location: "Shelf D · Specialty" },
      { qrCode: "BL-INV-PND-C2", status: "in_stock", receivedAt: daysAgo(120), costCents: 21175, location: "Shelf D · Specialty" },
    ],
  },
  {
    sku: "CAST-WALLWASH",
    name: "Cast Wall Wash · 6W",
    category: "fixture",
    groupLabel: "Wall wash",
    brand: "Cast Lighting",
    unit: "ea",
    unitCostCents: 13475,
    unitPriceCents: 24500,
    parLevel: 10,
    units: [
      { qrCode: "BL-INV-CWW8-D1", status: "in_stock", receivedAt: daysAgo(220), costCents: 13475, location: "Shelf D · Specialty" },
      { qrCode: "BL-INV-CWW8-D2", status: "in_stock", receivedAt: daysAgo(220), costCents: 13475, location: "Shelf D · Specialty" },
      { qrCode: "BL-INV-CWW8-D3", status: "in_stock", receivedAt: daysAgo(220), costCents: 13475, location: "Shelf D · Specialty" },
      { qrCode: "BL-INV-CWW8-D4", status: "in_stock", receivedAt: daysAgo(220), costCents: 13475, location: "Shelf D · Specialty" },
    ],
  },
  {
    sku: "TF-MULTI-300W",
    name: "Multi-tap Transformer · 300W",
    category: "transformer",
    groupLabel: "Transformer",
    brand: null,
    unit: "ea",
    unitCostCents: 38225,
    unitPriceCents: 69500,
    parLevel: 4,
    units: [],
  },
  {
    sku: "TF-MULTI-600W",
    name: "Multi-tap Transformer · 600W",
    category: "transformer",
    groupLabel: "Transformer",
    brand: null,
    unit: "ea",
    unitCostCents: 49225,
    unitPriceCents: 89500,
    parLevel: 4,
    units: [
      { qrCode: "BL-INV-TF600-E1", status: "in_stock", receivedAt: daysAgo(3), costCents: 49225, location: "Truck 1 · Cab" },
    ],
  },
  {
    sku: "TF-MULTI-900W",
    name: "Multi-tap Transformer · 900W",
    category: "transformer",
    groupLabel: "Transformer",
    brand: null,
    unit: "ea",
    unitCostCents: 65725,
    unitPriceCents: 119500,
    parLevel: 2,
    units: [],
  },
  {
    sku: "WIRE-12-2",
    name: "Low-voltage Wire · 12-2",
    category: "wire",
    groupLabel: "Wire",
    brand: null,
    unit: "ft",
    unitCostCents: 105,
    unitPriceCents: 195,
    parLevel: 500,
    units: [],
  },
  {
    sku: "CTRL-WIFI",
    name: "Smart Controller · Wi-Fi",
    category: "controller",
    groupLabel: "Controller",
    brand: null,
    unit: "ea",
    unitCostCents: 26125,
    unitPriceCents: 47500,
    parLevel: 3,
    units: [
      { qrCode: "BL-INV-CTRL-F1", status: "in_stock", receivedAt: daysAgo(10), costCents: 26125, location: "Workshop · Office" },
    ],
  },
  {
    sku: "PHOTO-CELL",
    name: "Photocell Sensor",
    category: "sensor",
    groupLabel: "Sensor",
    brand: null,
    unit: "ea",
    unitCostCents: 4675,
    unitPriceCents: 8500,
    parLevel: 8,
    units: [],
  },
];

export function findUnitByQrCode(
  code: string,
): { item: DemoInventoryItem; unit: DemoInventoryUnit } | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  for (const item of BRIGHT_LIGHTS_INVENTORY) {
    const unit = item.units.find((u) => u.qrCode === trimmed);
    if (unit) return { item, unit };
  }
  return null;
}
