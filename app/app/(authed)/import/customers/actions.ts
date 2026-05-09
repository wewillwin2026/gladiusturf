"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { recordAttestation } from "@/lib/messaging/consent";
import { normalizeE164 } from "@/lib/messaging/phone";

export type ImportLanguage = "en" | "es";

export type ImportRow = {
  display_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  /**
   * Per-row language preference. Drives bilingual SMS/email selection in
   * Storm Mode and other downstream messaging flows. Null means the
   * tenant didn't map a language column — server defaults to "en".
   */
  preferred_language: ImportLanguage | null;
};

export type ImportInput = {
  rows: ImportRow[];
  /** Tenant attested they have lawful basis to message these contacts. */
  messagingAttestation: boolean;
};

export type ImportedCustomerSummary = {
  id: string;
  display_name: string;
  preferred_language: ImportLanguage;
};

export type ImportResult =
  | {
      ok: true;
      inserted: number;
      skipped: number;
      consentsRecorded: number;
      languageMapped: boolean;
      /** Phones the operator gave us that couldn't be normalized to E.164.
       *  Stored as null on the row (not the original string) so canSend()
       *  and the dispatcher don't try to call Twilio with malformed input.
       *  Surfaced in the success UI so the operator knows to fix them
       *  manually after import. */
      phonesDropped: number;
      customers: ImportedCustomerSummary[];
    }
  | { error: string };

const ATTESTATION_TEXT_V1 =
  "Tenant attested at import time: 'I have lawful basis (consent, contract, or legitimate interest) to message these contacts on behalf of my business.'";

/**
 * Coerce arbitrary CSV cell values into the constrained ('en','es') domain
 * the customers.preferred_language check constraint enforces. Anything
 * Spanish-ish ("es", "spanish", "español", even with stray accents) maps
 * to "es"; anything English-ish or empty maps to "en". This lives server
 * side too because we never trust the client to honor the contract.
 */
function normalizeLanguage(raw: unknown): ImportLanguage {
  if (raw == null) return "en";
  const s = String(raw).trim().toLowerCase();
  if (s.length === 0) return "en";
  if (s === "es" || s.startsWith("es") || s.startsWith("sp") || s.includes("español") || s.includes("espanol") || s.includes("spanish")) {
    return "es";
  }
  if (s === "en" || s.startsWith("en") || s.startsWith("ing")) {
    return "en";
  }
  return "en";
}

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

  // Did the tenant map a language column at all? Used to decide whether
  // the success screen should nudge them to bulk-set after import.
  const languageMapped = cleaned.some((r) => r.preferred_language != null);

  // Count phones-that-couldn't-be-normalized across the FULL cleaned set
  // (not just `fresh`). Counting only fresh rows undercounts when a
  // tenant re-uploads with corrections — they'd see "0 phones dropped"
  // but actually lost data on the duplicate-named rows. Accurate count
  // matters because the operator uses it to decide whether to re-fix
  // their CSV before signing off the import.
  const phonesDropped = cleaned.reduce((acc, r) => {
    if (r.primary_phone && r.primary_phone.trim().length > 0) {
      if (!normalizeE164(r.primary_phone)) return acc + 1;
    }
    return acc;
  }, 0);

  if (fresh.length === 0) {
    return {
      ok: true,
      inserted: 0,
      skipped: cleaned.length,
      consentsRecorded: 0,
      languageMapped,
      phonesDropped,
      customers: [],
    };
  }

  const now = new Date().toISOString();
  const insertRows = fresh.map((r) => {
    return {
    tenant_id: session.tenant.id,
    display_name: r.display_name,
    primary_email: r.primary_email?.trim() || null,
    primary_phone: normalizeE164(r.primary_phone),
    preferred_language: normalizeLanguage(r.preferred_language),
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
    };
  });

  const { data: inserted, error } = await sb
    .from("customers")
    .insert(insertRows)
    .select("id, display_name, primary_email, primary_phone, preferred_language");
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
  const customers: ImportedCustomerSummary[] = (inserted ?? []).map((row) => ({
    id: row.id as string,
    display_name: (row.display_name as string) ?? "",
    preferred_language: ((row.preferred_language as ImportLanguage) ?? "en"),
  }));
  return {
    ok: true,
    inserted: fresh.length,
    skipped: cleaned.length - fresh.length,
    consentsRecorded,
    languageMapped,
    phonesDropped,
    customers,
  };
}

export type BulkSetLanguageInput = {
  customerIds: string[];
  language: ImportLanguage;
};

export type BulkSetLanguageResult =
  | { ok: true; updated: number }
  | { error: string };

/**
 * Fallback path for tenants who imported without mapping a language
 * column. The success screen surfaces a checklist of just-imported
 * customers; this action takes the selected ids + a target language and
 * writes preferred_language for the batch. Always tenant-scoped — the
 * .eq("tenant_id", …) filter is non-negotiable so a malicious client
 * can't flip a competitor's customers.
 */
export async function bulkSetCustomerLanguage(
  input: BulkSetLanguageInput,
): Promise<BulkSetLanguageResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  const ids = (input?.customerIds ?? [])
    .map((id) => String(id ?? "").trim())
    .filter((id) => id.length > 0);
  if (ids.length === 0) return { error: "no_ids" };
  if (ids.length > 5000) return { error: "too_many" };
  const language = normalizeLanguage(input?.language);

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("customers")
    .update({
      preferred_language: language,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", session.tenant.id)
    .in("id", ids)
    .select("id");

  if (error) {
    console.warn("bulkSetCustomerLanguage error", error);
    return { error: "update_failed" };
  }

  revalidatePath("/app");
  revalidatePath("/app/customers");
  return { ok: true, updated: (data ?? []).length };
}
