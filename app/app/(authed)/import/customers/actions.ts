"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { recordAttestation } from "@/lib/messaging/consent";

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

export type ImportInput = {
  rows: ImportRow[];
  /** Tenant attested they have lawful basis to message these contacts. */
  messagingAttestation: boolean;
};

export type ImportResult =
  | { ok: true; inserted: number; skipped: number; consentsRecorded: number }
  | { error: string };

const ATTESTATION_TEXT_V1 =
  "Tenant attested at import time: 'I have lawful basis (consent, contract, or legitimate interest) to message these contacts on behalf of my business.'";

/**
 * Bulk-insert customer rows from a CSV-import client component. The shape
 * matches what the import UI emits after column mapping. Inserts are
 * tenant-scoped + idempotent on (tenant_id, display_name) so a re-upload
 * of the same list won't double-insert.
 *
 * If `messagingAttestation` is true, we record a pending consent row per
 * imported customer × channel (sms+email). The tenant can promote pending
 * to opted_in later when they have stronger evidence (a reply, a portal
 * confirmation click, etc.). Outbound sends remain blocked by canSend()
 * until status is opted_in — see lib/messaging/consent.ts.
 */
export async function importCustomers(input: ImportInput): Promise<ImportResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  const rows = input?.rows ?? [];
  const cleaned = rows
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
    return { ok: true, inserted: 0, skipped: cleaned.length, consentsRecorded: 0 };
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

  const { data: inserted, error } = await sb
    .from("customers")
    .insert(insertRows)
    .select("id, primary_email, primary_phone");
  if (error) {
    console.warn("importCustomers insert error", error);
    return { error: "insert_failed" };
  }

  // Record a pending consent attestation per customer × channel where the
  // tenant ticked the attestation box AND a contact identifier was uploaded.
  // Pending — not opted_in — so canSend() still blocks outbound until the
  // tenant promotes the row. The audit row exists either way.
  let consentsRecorded = 0;
  if (input.messagingAttestation && inserted) {
    for (const row of inserted) {
      const id = row.id as string;
      if (row.primary_phone) {
        await recordAttestation(
          session.tenant.id,
          id,
          "sms",
          ATTESTATION_TEXT_V1,
        );
        consentsRecorded += 1;
      }
      if (row.primary_email) {
        await recordAttestation(
          session.tenant.id,
          id,
          "email",
          ATTESTATION_TEXT_V1,
        );
        consentsRecorded += 1;
      }
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/customers");
  return {
    ok: true,
    inserted: fresh.length,
    skipped: cleaned.length - fresh.length,
    consentsRecorded,
  };
}
