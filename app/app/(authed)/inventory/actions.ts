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

