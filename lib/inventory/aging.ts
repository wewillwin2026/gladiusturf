// Pure helpers for inventory aging math. No imports — these are used by
// both server queries (lib/inventory/queries.ts) and any future client
// preview surfaces, so they need to stay environment-agnostic.
//
// Bucket thresholds match migration 20260505_i_inventory.sql:
//   fresh  < 30d
//   aging  30-89d
//   stale  90-179d
//   dead   >= 180d

export type AgeBucket = "fresh" | "aging" | "stale" | "dead";

export function bucketForAge(days: number): AgeBucket {
  if (days < 30) return "fresh";
  if (days < 90) return "aging";
  if (days < 180) return "stale";
  return "dead";
}

export function ageInDays(receivedAt: string | Date): number {
  const t =
    typeof receivedAt === "string"
      ? new Date(receivedAt).getTime()
      : receivedAt.getTime();
  if (!Number.isFinite(t)) return 0;
  const ms = Date.now() - t;
  if (ms <= 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

/**
 * Sum of cost_cents for units that are currently sitting in stock.
 * Treats null cost as 0 — we don't want a single missing cost row to
 * NaN-poison the dashboard total.
 */
export function valueTiedUpCents(
  units: { cost_cents: number | null; status: string }[],
): number {
  let total = 0;
  for (const u of units) {
    if (u.status === "in_stock") {
      total += u.cost_cents ?? 0;
    }
  }
  return total;
}

/**
 * Max age (in days) across the in-stock units of an item. Returns 0 when
 * there are no in-stock units — used for "oldest unit" sorting where a
 * fully-deployed SKU should land at the bottom.
 */
export function oldestAgeDays(
  units: { received_at: string; status: string }[],
): number {
  let max = 0;
  for (const u of units) {
    if (u.status !== "in_stock") continue;
    const d = ageInDays(u.received_at);
    if (d > max) max = d;
  }
  return max;
}
