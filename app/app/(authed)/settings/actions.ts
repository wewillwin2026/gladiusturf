"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true } | { error: string };

/**
 * Tenant settings mutations. v1 ships review_url editing only — the
 * full edit UI for messaging guardrails, language, etc. comes later.
 *
 * Auth: tenant session required.
 * Tenant scoping: every update filters by session.tenant.id.
 * Audit-logged on success.
 */

export async function updateReviewUrl(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const raw = String(formData.get("review_url") ?? "").trim();
  // Empty input clears the column (back to placeholder fallback).
  const next: string | null = raw.length === 0 ? null : raw;

  if (next !== null) {
    // Mirrors the DB CHECK constraint so we surface a friendly error
    // instead of letting Postgres reject the update.
    if (!/^https:\/\//i.test(next)) return { error: "must_be_https" };
    if (next.length > 1024) return { error: "too_long" };
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenants")
    .update({ review_url: next })
    .eq("id", session.tenant.id);
  if (error) {
    // Most likely cause is the migration hasn't been applied yet.
    // Surface a specific error so the UI can suggest contacting support.
    if ((error.message ?? "").toLowerCase().includes("review_url")) {
      return { error: "column_not_ready" };
    }
    return { error: "update_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "tenant_review_url_updated",
      entity_type: "tenant",
      entity_id: session.tenant.id,
      metadata: { has_value: next !== null, length: next?.length ?? 0 },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/settings");
  return { ok: true };
}
