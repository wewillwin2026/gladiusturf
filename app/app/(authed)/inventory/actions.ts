"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { ageInDays } from "@/lib/inventory/aging";

/**
 * Inventory unit-state mutations + a QR code lookup. All three actions:
 *   - require a tenant session (rejects demo / unauthenticated)
 *   - scope queries by tenant_id (never trust the unit id alone)
 *   - revalidate /app/inventory so the table reflects the change on
 *     the next render
 *
 * The error shape is { error: string } / { ok: true, ... } so callers
 * can `if ("error" in result)` cleanly. Same convention as customers/[id]/actions.ts.
 */

// ---- mark deployed --------------------------------------------------

export async function markUnitDeployed(
  unitId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  if (!unitId) return { error: "missing_unit_id" };

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("inventory_units")
    .update({
      status: "deployed",
      deployed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitId)
    .eq("tenant_id", session.tenant.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("markUnitDeployed error", error);
    return { error: "update_failed" };
  }
  if (!data) {
    return { error: "not_found_in_tenant" };
  }

  revalidatePath("/app/inventory");
  return { ok: true };
}

// ---- mark damaged ---------------------------------------------------

export async function markUnitDamaged(
  unitId: string,
  notes?: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  if (!unitId) return { error: "missing_unit_id" };

  const sb = supabaseAdmin();

  // Read the current notes so we can append rather than overwrite —
  // postgres doesn't let us COALESCE concat in a single update without
  // raw SQL, and a tiny round-trip is cleaner than introducing rpc()
  // for a low-frequency action.
  const { data: existing, error: readErr } = await sb
    .from("inventory_units")
    .select("notes")
    .eq("id", unitId)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();

  if (readErr) {
    console.warn("markUnitDamaged read error", readErr);
    return { error: "update_failed" };
  }
  if (!existing) return { error: "not_found_in_tenant" };

  const trimmed = (notes ?? "").trim();
  const tag = trimmed ? `[damaged: ${trimmed}]` : "[damaged]";
  const merged = existing.notes
    ? `${existing.notes} ${tag}`.trim()
    : tag;

  const { error } = await sb
    .from("inventory_units")
    .update({
      status: "damaged",
      notes: merged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", unitId)
    .eq("tenant_id", session.tenant.id);

  if (error) {
    console.warn("markUnitDamaged update error", error);
    return { error: "update_failed" };
  }

  revalidatePath("/app/inventory");
  return { ok: true };
}

// ---- create item ----------------------------------------------------

const ITEM_CATEGORIES = [
  "fixture",
  "transformer",
  "wire",
  "controller",
  "sensor",
  "bulb",
  "accessory",
  "other",
] as const;

type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type CreateItemResult =
  | { ok: true; id: string }
  | { error: string };

/**
 * Create a new inventory SKU. Without this, a fresh tenant has nothing
 * to pick from in the Receive dialog — and "Inventory doesn't work."
 *
 * v1 captures the minimum useful fields: sku, name, category, brand,
 * unit, unit cost, par level. Price + group + description editable later
 * from the row detail view.
 */
export async function createInventoryItem(
  formData: FormData,
): Promise<CreateItemResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "other").trim();
  const category: ItemCategory = (ITEM_CATEGORIES as readonly string[]).includes(
    categoryRaw,
  )
    ? (categoryRaw as ItemCategory)
    : "other";
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const unit = String(formData.get("unit") ?? "ea").trim() || "ea";
  const unitCostRaw = String(formData.get("unitCost") ?? "").trim();
  const unitCostCents = unitCostRaw
    ? Math.round(Number(unitCostRaw) * 100)
    : null;
  const parLevelRaw = String(formData.get("parLevel") ?? "").trim();
  const parLevel = parLevelRaw
    ? Math.max(0, Math.round(Number(parLevelRaw)))
    : null;

  if (!sku) return { error: "missing_sku" };
  if (!name) return { error: "missing_name" };
  if (unitCostCents != null && !Number.isFinite(unitCostCents)) {
    return { error: "invalid_cost" };
  }

  const sb = supabaseAdmin();

  // Pre-check (tenant_id, sku) so we can return a clean duplicate
  // message instead of letting the unique constraint surface a 23505.
  const { data: existing } = await sb
    .from("inventory_items")
    .select("id")
    .eq("tenant_id", session.tenant.id)
    .eq("sku", sku)
    .maybeSingle();
  if (existing) return { error: "duplicate_sku" };

  const { data, error } = await sb
    .from("inventory_items")
    .insert({
      tenant_id: session.tenant.id,
      sku,
      name,
      category,
      brand,
      unit,
      unit_cost_cents: unitCostCents,
      par_level: parLevel,
      active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createInventoryItem failed", error);
    return { error: "insert_failed" };
  }

  await sb.from("audit_log").insert({
    tenant_id: session.tenant.id,
    user_id: null,
    action: "inventory_item_created",
    entity_type: "inventory_items",
    entity_id: (data as { id: string }).id,
    metadata: { sku, name, category },
  });

  revalidatePath("/app/inventory");
  return { ok: true, id: (data as { id: string }).id };
}

// ---- receive units --------------------------------------------------

export type ReceiveInput = {
  itemId: string;
  qrCodes: string[];
  costCents?: number | null;
  location?: string | null;
};

export type ReceiveResult =
  | { ok: true; insertedIds: string[] }
  | { error: string; duplicates?: string[] };

export async function receiveUnits(
  input: ReceiveInput,
): Promise<ReceiveResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  if (!input.itemId) return { error: "missing_item_id" };

  const codes = (input.qrCodes ?? [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  if (codes.length === 0) return { error: "missing_qr_codes" };

  // Dedupe within the request before hitting the DB.
  const unique = Array.from(new Set(codes));

  const sb = supabaseAdmin();

  // Pre-check for codes already in the tenant — we'd rather return a clean
  // duplicates list than a 23505 conflict mid-batch.
  const { data: existing, error: dupErr } = await sb
    .from("inventory_units")
    .select("qr_code")
    .eq("tenant_id", session.tenant.id)
    .in("qr_code", unique);
  if (dupErr) {
    console.warn("receiveUnits dupe check error", dupErr);
    return { error: "lookup_failed" };
  }
  const dupes = (existing ?? []).map((r) => r.qr_code as string);
  const fresh = unique.filter((c) => !dupes.includes(c));
  if (fresh.length === 0) {
    return { error: "all_duplicates", duplicates: dupes };
  }

  // Verify the item belongs to this tenant before insert (otherwise an
  // attacker could pass any UUID).
  const { data: item, error: itemErr } = await sb
    .from("inventory_items")
    .select("id")
    .eq("id", input.itemId)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (itemErr || !item) {
    return { error: "item_not_found_in_tenant" };
  }

  const now = new Date().toISOString();
  const rows = fresh.map((code) => ({
    tenant_id: session.tenant.id,
    item_id: input.itemId,
    qr_code: code,
    status: "in_stock" as const,
    location: input.location?.trim() || null,
    cost_cents:
      input.costCents != null && Number.isFinite(input.costCents)
        ? Math.round(input.costCents)
        : null,
    received_at: now,
    created_at: now,
    updated_at: now,
  }));

  const { data: inserted, error } = await sb
    .from("inventory_units")
    .insert(rows)
    .select("id");
  if (error) {
    console.warn("receiveUnits insert error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/inventory");
  return {
    ok: true,
    insertedIds: (inserted ?? []).map((r) => r.id as string),
  };
}

// ---- QR code lookup -------------------------------------------------

export type LookupHit = {
  id: string;
  sku: string;
  itemName: string;
  status: string;
  receivedAt: string;
  ageDays: number;
  location: string | null;
};

export async function lookupByQrCode(
  qrCode: string,
): Promise<{ ok: true; unit: LookupHit } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  const code = qrCode?.trim();
  if (!code) return { error: "missing_qr_code" };

  const sb = supabaseAdmin();
  // FK join inventory_units → inventory_items. Supabase lets us pull the
  // related sku/name in one round-trip via the relationship selector.
  const { data, error } = await sb
    .from("inventory_units")
    .select(
      "id, status, received_at, location, item:inventory_items!inner(sku, name)",
    )
    .eq("tenant_id", session.tenant.id)
    .eq("qr_code", code)
    .maybeSingle();

  if (error) {
    console.warn("lookupByQrCode error", error);
    return { error: "lookup_failed" };
  }
  if (!data) return { error: "not_found" };

  // Supabase types the joined `item` as either an object or array depending
  // on the FK shape; the !inner ensures it's a single row but TS can't tell.
  const item = (data as unknown as {
    item: { sku: string; name: string } | { sku: string; name: string }[];
  }).item;
  const itemRow = Array.isArray(item) ? item[0] : item;
  const sku = itemRow?.sku ?? "—";
  const itemName = itemRow?.name ?? "Unknown item";

  return {
    ok: true,
    unit: {
      id: data.id as string,
      sku,
      itemName,
      status: data.status as string,
      receivedAt: data.received_at as string,
      ageDays: ageInDays(data.received_at as string),
      location: (data.location as string | null) ?? null,
    },
  };
}

