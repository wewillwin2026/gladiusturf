"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export type CreateCustomerInput = {
  display_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  preferred_language: "en" | "es";
};

export type CreateCustomerResult =
  | { ok: true; customerId: string }
  | { error: string };

/**
 * Create a single customer for the authenticated tenant. Used by the
 * /app/customers/new manual-entry form. CSV bulk import lives in
 * /app/import/customers/actions.ts and is a separate server action.
 */
export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CreateCustomerResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  const name = (input.display_name ?? "").trim();
  if (!name) return { error: "missing_name" };

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const addr =
    input.street || input.city || input.state || input.zip
      ? {
          street: input.street?.trim() || null,
          city: input.city?.trim() || null,
          state: input.state?.trim() || "FL",
          zip: input.zip?.trim() || null,
        }
      : null;

  const { data, error } = await sb
    .from("customers")
    .insert({
      tenant_id: session.tenant.id,
      display_name: name,
      primary_email: input.primary_email?.trim() || null,
      primary_phone: input.primary_phone?.trim() || null,
      preferred_language: input.preferred_language,
      service_address: addr,
      notes: input.notes?.trim() || null,
      acquired_at: now,
      source: "manual-entry",
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createCustomer error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app");
  revalidatePath("/app/customers");
  return { ok: true, customerId: data.id as string };
}
