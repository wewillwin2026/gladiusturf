"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true; id: string } | { error: string };

const CATEGORIES = [
  "truck",
  "mower",
  "blower",
  "trimmer",
  "lift",
  "trailer",
  "multimeter",
  "other",
] as const;

const STATUSES = ["active", "in_shop", "retired", "lost"] as const;

export async function createEquipment(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "other").trim();
  const category = (CATEGORIES as readonly string[]).includes(categoryRaw)
    ? categoryRaw
    : "other";
  const make = String(formData.get("make") ?? "").trim() || null;
  const model = String(formData.get("model") ?? "").trim() || null;
  const serialNo = String(formData.get("serialNo") ?? "").trim() || null;
  const assetTag = String(formData.get("assetTag") ?? "").trim() || null;
  const purchaseDateRaw = String(formData.get("purchaseDate") ?? "").trim();
  const purchaseDate = purchaseDateRaw || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!displayName) return { error: "missing_name" };

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenant_equipment")
    .insert({
      tenant_id: session.tenant.id,
      display_name: displayName,
      category,
      make,
      model,
      serial_no: serialNo,
      asset_tag: assetTag,
      purchase_date: purchaseDate,
      notes,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("createEquipment failed", error);
    return { error: "insert_failed" };
  }
  revalidatePath("/app/equipment");
  return { ok: true, id: (data as { id: string }).id };
}

export async function setEquipmentStatus(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? statusRaw
    : null;
  if (!id || !status) return { error: "invalid_input" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenant_equipment")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("tenant_id", session.tenant.id)
    .eq("id", id);
  if (error) return { error: "update_failed" };
  revalidatePath("/app/equipment");
  return { ok: true };
}
