"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export type ImportRow = {
  display_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
};

export type ImportResult =
  | { ok: true; inserted: number; skipped: number }
  | { error: string };

/**
 * Bulk-insert customer rows from a CSV-import client component. The shape
 * matches what the import UI emits after column mapping. Inserts are
 * tenant-scoped + idempotent on (tenant_id, display_name) so a re-upload
 * of the same list won't double-insert.
 */
export async function importCustomers(rows: ImportRow[]): Promise<ImportResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  const cleaned = (rows ?? [])
    .map((r) => ({
      ...r,
      display_name: r.display_name?.trim() ?? "",
    }))
    .filter((r) => r.display_name.length > 0);
  if (cleaned.length === 0) return { error: "no_rows" };
  if (cleaned.length > 5000) return { error: "too_many_rows" };

  const sb = supabaseAdmin();

  // Pull existing names to dedupe within this tenant.
  const { data: existing, error: existErr } = await sb
    .from("customers")
    .select("display_name")
    .eq("tenant_id", session.tenant.id);
  if (existErr) {
    console.warn("importCustomers existing-fetch error", existErr);
    return { error: "lookup_failed" };
  }
  const existingNames = new Set(
    (existing ?? []).map((r) => (r.display_name as string).trim().toLowerCase()),
  );

  const fresh = cleaned.filter(
    (r) => !existingNames.has(r.display_name.toLowerCase()),
  );
  if (fresh.length === 0) {
    return { ok: true, inserted: 0, skipped: cleaned.length };
  }

  const now = new Date().toISOString();
  const insertRows = fresh.map((r) => ({
    tenant_id: session.tenant.id,
    display_name: r.display_name,
    primary_email: r.primary_email?.trim() || null,
    primary_phone: r.primary_phone?.trim() || null,
    preferred_language: "en",
    service_address:
      r.street || r.city || r.state || r.zip
        ? {
            street: r.street?.trim() || null,
            city: r.city?.trim() || null,
            state: r.state?.trim() || "FL",
            zip: r.zip?.trim() || null,
          }
        : null,
    notes: r.notes?.trim() || null,
    acquired_at: now,
    source: "csv-import",
    created_at: now,
    updated_at: now,
  }));

  const { error } = await sb.from("customers").insert(insertRows);
  if (error) {
    console.warn("importCustomers insert error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app");
  revalidatePath("/app/customers");
  return {
    ok: true,
    inserted: fresh.length,
    skipped: cleaned.length - fresh.length,
  };
}
