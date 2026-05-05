// Server-side fetcher for the inventory engine. Pulls active SKUs +
// their in-flight units, then joins them in JS so we get one nicely
// shaped row per SKU with aging stats already computed.
//
// We deliberately keep this as a plain module (not "use server") — it
// returns data, not actions. Server components import it directly.

import { supabaseAdmin } from "@/lib/supabase";
import { ageInDays, oldestAgeDays, valueTiedUpCents } from "./aging";

export type InventoryItemWithStats = {
  id: string;
  sku: string;
  name: string;
  category: string;
  group_label: string | null;
  brand: string | null;
  unit: string;
  unit_cost_cents: number | null;
  unit_price_cents: number | null;
  par_level: number | null;
  in_stock: number;
  oldest_age_days: number;
  tied_up_cents: number;
  units: Array<{
    id: string;
    qr_code: string;
    status: string;
    received_at: string;
    cost_cents: number | null;
    location: string | null;
  }>;
};

type DbItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  group_label: string | null;
  brand: string | null;
  unit: string;
  unit_cost_cents: number | null;
  unit_price_cents: number | null;
  par_level: number | null;
};

type DbUnit = {
  id: string;
  item_id: string | null;
  qr_code: string;
  status: string;
  received_at: string;
  cost_cents: number | null;
  location: string | null;
};

// Statuses that should appear in the unit drawer / count toward stats.
// "lost" rows stay in the table but don't count as in_stock; deployed/
// returned still belong on the timeline so receivers can verify history.
const VISIBLE_STATUSES = [
  "in_stock",
  "reserved",
  "deployed",
  "damaged",
  "returned",
];

export async function getInventoryForTenant(
  tenantId: string,
): Promise<InventoryItemWithStats[]> {
  const sb = supabaseAdmin();

  const [itemsRes, unitsRes] = await Promise.all([
    sb
      .from("inventory_items")
      .select(
        "id, sku, name, category, group_label, brand, unit, unit_cost_cents, unit_price_cents, par_level",
      )
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("sku", { ascending: true }),
    sb
      .from("inventory_units")
      .select(
        "id, item_id, qr_code, status, received_at, cost_cents, location",
      )
      .eq("tenant_id", tenantId)
      .in("status", VISIBLE_STATUSES)
      .order("received_at", { ascending: true }),
  ]);

  if (itemsRes.error) {
    console.warn("getInventoryForTenant items error", itemsRes.error);
    return [];
  }
  if (unitsRes.error) {
    console.warn("getInventoryForTenant units error", unitsRes.error);
  }

  const items = (itemsRes.data ?? []) as DbItem[];
  const units = (unitsRes.data ?? []) as DbUnit[];

  // Group units by item_id once so per-item aggregation is O(n).
  const unitsByItem = new Map<string, DbUnit[]>();
  for (const u of units) {
    if (!u.item_id) continue;
    const list = unitsByItem.get(u.item_id);
    if (list) list.push(u);
    else unitsByItem.set(u.item_id, [u]);
  }

  const rows: InventoryItemWithStats[] = items.map((item) => {
    const itemUnits = unitsByItem.get(item.id) ?? [];
    const inStock = itemUnits.filter((u) => u.status === "in_stock").length;
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      group_label: item.group_label,
      brand: item.brand,
      unit: item.unit,
      unit_cost_cents: item.unit_cost_cents,
      unit_price_cents: item.unit_price_cents,
      par_level: item.par_level,
      in_stock: inStock,
      oldest_age_days: oldestAgeDays(itemUnits),
      tied_up_cents: valueTiedUpCents(itemUnits),
      units: itemUnits.map((u) => ({
        id: u.id,
        qr_code: u.qr_code,
        status: u.status,
        received_at: u.received_at,
        cost_cents: u.cost_cents,
        location: u.location,
      })),
    };
  });

  // Sort by oldest in-stock unit DESC so capital-tied-up risk floats up.
  // Items with no in-stock units (oldest=0) sink to the bottom but stay
  // visible — receivers may still want to scan a deployed QR to look up
  // history.
  rows.sort((a, b) => b.oldest_age_days - a.oldest_age_days);

  return rows;
}

/**
 * Convenience wrapper that re-derives the bucket counts from the row
 * list. Cheap (O(units)) and shared between the page header KPIs and
 * any future report/email surface.
 */
export function summarizeInventory(rows: InventoryItemWithStats[]): {
  totalInStock: number;
  agingCount: number;
  staleOrDeadCount: number;
  deadCapitalCents: number;
} {
  let totalInStock = 0;
  let aging = 0;
  let staleOrDead = 0;
  let deadCapital = 0;
  for (const r of rows) {
    totalInStock += r.in_stock;
    for (const u of r.units) {
      if (u.status !== "in_stock") continue;
      const days = ageInDays(u.received_at);
      if (days >= 30 && days < 90) aging += 1;
      if (days >= 90) {
        staleOrDead += 1;
        deadCapital += u.cost_cents ?? 0;
      }
    }
  }
  return {
    totalInStock,
    agingCount: aging,
    staleOrDeadCount: staleOrDead,
    deadCapitalCents: deadCapital,
  };
}
