import { rng } from "@/lib/shared/prng";
import type { Customer, Quote, QuoteStage } from "@/lib/shared/types";

const STAGES: QuoteStage[] = ["Draft", "Sent", "Sent", "Viewed", "Viewed", "Won", "Won", "Won", "Lost"];

const SCOPES = [
  ["Mowing", "Edging"],
  ["Mowing", "Fertilization (NPK)", "Weed Control"],
  ["Core Aeration", "Overseeding"],
  ["Mulch Refresh", "Pest Control"],
  ["Tree Trim (per tree)", "Mowing"],
  ["Irrigation Check", "Mowing", "Edging"],
];

export function buildQuotes(customers: Customer[], count = 32): Quote[] {
  const r = rng(2027);
  const quotes: Quote[] = [];
  const eligible = customers.filter((c) => c.status === "Active" || c.status === "Lead");

  for (let i = 0; i < count; i++) {
    const c = r.pick(eligible);
    const stage = r.pick(STAGES);
    const scope = r.pick(SCOPES);

    const services = scope.map((name) => {
      const sqft = r.int(1200, 9800);
      const rate = r.float(0.0042, 0.022);
      const total = Math.round(Math.max(45, sqft * rate));
      return { name, sqft, rate: Number(rate.toFixed(4)), total };
    });
    const total = services.reduce((s, x) => s + x.total, 0) * 100;

    const createdDaysAgo = r.int(0, 30);
    const createdAt = isoDaysAgo(createdDaysAgo);
    const sentAt =
      stage !== "Draft"
        ? isoDaysAgo(Math.max(0, createdDaysAgo - r.int(0, 1)))
        : undefined;
    const viewedAt =
      stage === "Viewed" || stage === "Won" || stage === "Lost"
        ? isoDaysAgo(Math.max(0, createdDaysAgo - r.int(1, 3)))
        : undefined;
    const closedAt =
      stage === "Won" || stage === "Lost"
        ? isoDaysAgo(Math.max(0, createdDaysAgo - r.int(2, 6)))
        : undefined;

    quotes.push({
      id: `qt_${i + 1}`,
      customerId: c.id,
      total,
      stage,
      createdAt,
      sentAt,
      viewedAt,
      closedAt,
      services,
    });
  }
  return quotes;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
