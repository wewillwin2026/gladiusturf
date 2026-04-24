export type ComparisonRow = {
  vendor: string;
  price: string;
  aiNative: "yes" | "no" | "partial";
  compliance: "full" | "partial" | "none";
  marketplace: "yes" | "no";
  featured?: boolean;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    vendor: "Your current stack",
    price: "$1,400+ / mo across 7 tools",
    aiNative: "no",
    compliance: "none",
    marketplace: "no",
  },
  {
    vendor: "Jobber",
    price: "$169–$349 / mo + per-user",
    aiNative: "partial",
    compliance: "none",
    marketplace: "no",
  },
  {
    vendor: "LMN",
    price: "$297+ / mo",
    aiNative: "no",
    compliance: "partial",
    marketplace: "no",
  },
  {
    vendor: "Service Autopilot",
    price: "$297+ / mo + per-user",
    aiNative: "partial",
    compliance: "none",
    marketplace: "no",
  },
  {
    vendor: "Aspire",
    price: "Quote-only, 4-figure / mo",
    aiNative: "partial",
    compliance: "partial",
    marketplace: "no",
  },
  {
    vendor: "GladiusTurf",
    price: "$397–$2,997 / crew, unlimited seats",
    aiNative: "yes",
    compliance: "full",
    marketplace: "yes",
    featured: true,
  },
];
