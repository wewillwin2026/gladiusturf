"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

const CATEGORIES = [
  "truck",
  "trailer",
  "tool",
  "transformer",
  "meter",
  "other",
] as const;

const STATUSES = ["available", "in_use", "maintenance", "retired"] as const;

export type CreateEquipmentInput = {
  display_name: string;
  category: string;
  make: string | null;
  model: string | null;
  serial_no: string | null;
  asset_tag: string | null;
  purchase_date: string | null;
  status: string;
  notes: string | null;
};

export type CreateEquipmentResult =
  | { ok: true; id: string }
  | { error: string };

/**
 * Create a single equipment asset for the authenticated tenant. Used by the
 * /app/equipment/new manual-entry form. Mirrors the proven createCustomer
 * pattern at /app/customers/new/actions.ts.
 */
export async function createEquipment(
  input: CreateEquipmentInput,
): Promise<CreateEquipmentResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }

  const name = (input.display_name ?? "").trim();
  if (!name) return { error: "missing_name" };

  const category = (CATEGORIES as readonly string[]).includes(input.category)
    ? input.category
    : "tool";
  const status = (STATUSES as readonly string[]).includes(input.status)
    ? input.status
    : "available";

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("tenant_equipment")
    .insert({
      tenant_id: session.tenant.id,
      display_name: name,
      category,
      make: input.make?.trim() || null,
      model: input.model?.trim() || null,
      serial_no: input.serial_no?.trim() || null,
      asset_tag: input.asset_tag?.trim() || null,
      purchase_date: input.purchase_date?.trim() || null,
      status,
      notes: input.notes?.trim() || null,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createEquipment error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/equipment");
  return { ok: true, id: (data as { id: string }).id };
}
