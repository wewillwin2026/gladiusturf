"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

const ITEM_CATEGORIES = [
  "fixture",
  "transformer",
  "wire",
  "controller",
  "sensor",
  "accessory",
  "other",
] as const;

type ItemCategory = (typeof ITEM_CATEGORIES)[number];

const ITEM_UNITS = ["each", "ft", "box", "roll"] as const;

type ItemUnit = (typeof ITEM_UNITS)[number];

export type CreateInventoryItemInput = {
  sku: string;
  name: string;
  category: string;
  brand: string | null;
  unit: string;
  unit_cost_dollars: number | null;
  unit_price_dollars: number | null;
  par_level: number | null;
  description: string | null;
};

export type CreateInventoryItemResult =
  | { ok: true; id: string }
  | { error: string };

/**
 * Create a single inventory SKU for the authenticated tenant. Used by the
 * /app/inventory/new manual-entry form — mirrors the proven
 * /app/customers/new server-action pattern (typed input object, tenant
 * guard, ISO timestamps set here, clean { ok } | { error } shape).
 *
 * A separate FormData-based createInventoryItem lives in
 * /app/inventory/actions.ts for the inline NewItemDialog; the two do not
 * collide (different modules) and both write the same inventory_items
 * table.
 */
export async function createInventoryItem(
  input: CreateInventoryItemInput,
): Promise<CreateInventoryItemResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }

  const sku = (input.sku ?? "").trim().toUpperCase();
  if (!sku) return { error: "missing_sku" };

  const name = (input.name ?? "").trim();
  if (!name) return { error: "missing_name" };

  const categoryRaw = (input.category ?? "fixture").trim();
  const category: ItemCategory = (
    ITEM_CATEGORIES as readonly string[]
  ).includes(categoryRaw)
    ? (categoryRaw as ItemCategory)
    : "fixture";

  const unitRaw = (input.unit ?? "each").trim();
  const unit: ItemUnit = (ITEM_UNITS as readonly string[]).includes(unitRaw)
    ? (unitRaw as ItemUnit)
    : "each";

  const unitCostCents =
    input.unit_cost_dollars != null &&
    Number.isFinite(input.unit_cost_dollars)
      ? Math.round(input.unit_cost_dollars * 100)
      : null;
  const unitPriceCents =
    input.unit_price_dollars != null &&
    Number.isFinite(input.unit_price_dollars)
      ? Math.round(input.unit_price_dollars * 100)
      : null;
  const parLevel =
    input.par_level != null && Number.isFinite(input.par_level)
      ? Math.max(0, Math.round(input.par_level))
      : null;

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("inventory_items")
    .insert({
      tenant_id: session.tenant.id,
      sku,
      category,
      name,
      description: input.description?.trim() || null,
      brand: input.brand?.trim() || null,
      group_label: null,
      unit,
      unit_cost_cents: unitCostCents,
      unit_price_cents: unitPriceCents,
      par_level: parLevel,
      active: true,
      is_starter: false,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    // 23505 = unique_violation. The (tenant_id, sku) uniqueness lands
    // here as a duplicate — surface a clean code the form can map to a
    // friendly "That SKU already exists." message.
    const code = (error as { code?: string } | null)?.code;
    const message = (error as { message?: string } | null)?.message ?? "";
    if (
      code === "23505" ||
      /duplicate key|already exists|unique constraint/i.test(message)
    ) {
      return { error: "duplicate_sku" };
    }
    console.warn("createInventoryItem error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/inventory");
  return { ok: true, id: data.id as string };
}
