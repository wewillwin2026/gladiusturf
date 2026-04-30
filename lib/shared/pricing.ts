// Per-sqft service pricing tables. Used by AI Quote Drafter (Phase 3) and the
// /app/pricing engine page. Numbers come from the deep-dive on Florida lawn-care
// market rates as of 2026.

export type ServiceRate = {
  slug: string;
  name: string;
  unit: "sqft" | "linear_ft" | "each";
  rate: number; // dollars per unit
  minCharge: number; // dollars
  category: "Maintenance" | "Application" | "Installation" | "OneTime";
};

export const SERVICE_RATES: ServiceRate[] = [
  {
    slug: "mowing",
    name: "Mowing",
    unit: "sqft",
    rate: 0.0042,
    minCharge: 45,
    category: "Maintenance",
  },
  {
    slug: "edging",
    name: "Edging",
    unit: "linear_ft",
    rate: 0.18,
    minCharge: 20,
    category: "Maintenance",
  },
  {
    slug: "fertilization",
    name: "Fertilization (NPK)",
    unit: "sqft",
    rate: 0.0085,
    minCharge: 65,
    category: "Application",
  },
  {
    slug: "weed-control",
    name: "Weed Control",
    unit: "sqft",
    rate: 0.0075,
    minCharge: 60,
    category: "Application",
  },
  {
    slug: "aeration",
    name: "Core Aeration",
    unit: "sqft",
    rate: 0.022,
    minCharge: 150,
    category: "OneTime",
  },
  {
    slug: "overseed",
    name: "Overseeding",
    unit: "sqft",
    rate: 0.018,
    minCharge: 120,
    category: "OneTime",
  },
  {
    slug: "mulch",
    name: "Mulch Refresh",
    unit: "sqft",
    rate: 1.2,
    minCharge: 200,
    category: "Installation",
  },
  {
    slug: "irrigation-check",
    name: "Irrigation Check",
    unit: "each",
    rate: 95,
    minCharge: 95,
    category: "Maintenance",
  },
  {
    slug: "tree-trim",
    name: "Tree Trim (per tree)",
    unit: "each",
    rate: 65,
    minCharge: 195,
    category: "OneTime",
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    unit: "sqft",
    rate: 0.0095,
    minCharge: 75,
    category: "Application",
  },
];

export function priceFor(slug: string, units: number): number {
  const r = SERVICE_RATES.find((s) => s.slug === slug);
  if (!r) return 0;
  return Math.max(r.minCharge, Math.round(r.rate * units * 100) / 100);
}
