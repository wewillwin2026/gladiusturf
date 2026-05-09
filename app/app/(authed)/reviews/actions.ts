"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { isSpamSuspect, spamReason } from "./spam";

/**
 * Reviews module mutations — Bright Lights Day-1 (2026-05-08).
 *
 * Contract obligations (Section 2.1 + 2.2): we own the public reviews
 * surface for the tenant. v1 supports manual entry (so Cristian can
 * backfill 171 Google reviews while we wait on the GBP API), one-click
 * moderation (mark spam / mark legit), reply, and hard delete.
 *
 * Auth: tenant session required. Demo + unauthenticated rejected.
 * Tenant scoping: every query filters by session.tenant.id — never
 * trust the FormData id alone. Audit-logged on every mutation.
 *
 * Manual review-ask SMS button on /app/customers/[id] is intentionally
 * deferred — TODO: wire send-now action once the messaging consent
 * gate is finalized.
 */

const ALLOWED_SOURCES = [
  "google",
  "facebook",
  "manual",
  "yelp",
  "nextdoor",
] as const;
type Source = (typeof ALLOWED_SOURCES)[number];

type Result = { ok: true; reviewId?: string } | { error: string };

function nullIfBlank(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function parseRating(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw.trim());
  if (!Number.isFinite(n)) return null;
  const r = Math.trunc(n);
  if (r < 1 || r > 5) return null;
  return r;
}

function parseSubmittedAt(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function isSource(value: string): value is Source {
  return (ALLOWED_SOURCES as readonly string[]).includes(value);
}

/**
 * Insert a review manually. Used by Cristian to backfill the 171 Google
 * reviews while the Google Business Profile integration is still on the
 * roadmap. Auto-pre-flags the row as spam if it trips the heuristic.
 */
export async function addReview(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const sourceRaw = String(formData.get("source") ?? "").trim();
  if (!isSource(sourceRaw)) return { error: "invalid_source" };

  const reviewerName = nullIfBlank(formData.get("reviewer_name"));
  if (!reviewerName) return { error: "reviewer_name_required" };

  const rating = parseRating(formData.get("rating"));
  if (rating === null) return { error: "rating_invalid" };

  const body = nullIfBlank(formData.get("body"));
  if (!body) return { error: "body_required" };

  const sourceUrl = nullIfBlank(formData.get("source_url"));
  const customerId = nullIfBlank(formData.get("customer_id"));
  const submittedAt =
    parseSubmittedAt(formData.get("submitted_at")) ?? new Date().toISOString();

  const sb = supabaseAdmin();

  // If a customer_id was provided, verify it belongs to this tenant.
  // Otherwise an attacker could attach a review to another tenant's
  // customer row.
  if (customerId) {
    const { data: customer } = await sb
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .eq("tenant_id", session.tenant.id)
      .maybeSingle();
    if (!customer) return { error: "customer_not_found_in_tenant" };
  }

  const flagged = isSpamSuspect(body, reviewerName);
  const status = flagged ? "spam" : "published";

  const { data: inserted, error } = await sb
    .from("reviews")
    .insert({
      tenant_id: session.tenant.id,
      customer_id: customerId,
      source: sourceRaw,
      source_url: sourceUrl,
      reviewer_name: reviewerName,
      rating,
      body,
      status,
      submitted_at: submittedAt,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.warn("addReview insert error", error);
    return { error: "insert_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "review_added",
      entity_type: "review",
      entity_id: inserted.id as string,
      metadata: {
        source: sourceRaw,
        rating,
        status,
        spam_flag_reason: flagged ? spamReason(body, reviewerName) : null,
        customer_id: customerId,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/reviews");
  return { ok: true, reviewId: inserted.id as string };
}

/**
 * Reply to a review. Stamps reply_body + replied=true + replied_at.
 * v1 is store-only — actually posting the reply to Google/Facebook
 * happens once the GBP integration ships.
 */
export async function replyToReview(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "missing_id" };

  const replyBody = nullIfBlank(formData.get("reply_body"));
  if (!replyBody) return { error: "reply_body_required" };

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("reviews")
    .update({
      reply_body: replyBody,
      replied: true,
      replied_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.warn("replyToReview error", error);
    return { error: "update_failed" };
  }
  if (!data) return { error: "not_found_in_tenant" };

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "review_replied",
      entity_type: "review",
      entity_id: id,
      metadata: { reply_length: replyBody.length },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/reviews");
  return { ok: true, reviewId: id };
}

/**
 * Mark a review as spam — moves it out of the published feed and into
 * the moderation queue.
 */
export async function markReviewSpam(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("reviews")
    .update({ status: "spam", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.warn("markReviewSpam error", error);
    return { error: "update_failed" };
  }
  if (!data) return { error: "not_found_in_tenant" };

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "review_marked_spam",
      entity_type: "review",
      entity_id: id,
      metadata: {},
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/reviews");
  return { ok: true, reviewId: id };
}

/**
 * Reverse markReviewSpam — promotes the row back to the published feed.
 */
export async function unmarkSpam(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("reviews")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.warn("unmarkSpam error", error);
    return { error: "update_failed" };
  }
  if (!data) return { error: "not_found_in_tenant" };

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "review_unmarked_spam",
      entity_type: "review",
      entity_id: id,
      metadata: {},
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/reviews");
  return { ok: true, reviewId: id };
}

/**
 * Hard-delete a review. Used when a row is abusive or contains PII the
 * tenant wants gone (vs. spam, which is just hidden).
 */
export async function deleteReview(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();

  // Read first so we can audit the deleted row's source + reviewer name.
  const { data: existing } = await sb
    .from("reviews")
    .select("id, source, reviewer_name, rating")
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (!existing) return { error: "not_found_in_tenant" };

  const { error } = await sb
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("deleteReview error", error);
    return { error: "delete_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "review_deleted",
      entity_type: "review",
      entity_id: id,
      metadata: {
        source: (existing as { source: string }).source,
        reviewer_name: (existing as { reviewer_name: string }).reviewer_name,
        rating: (existing as { rating: number }).rating,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/reviews");
  return { ok: true, reviewId: id };
}

/**
 * Toggle the post-job review-ask SMS cadence. Writes to the boolean
 * tenants.review_ask_enabled column.
 */
export async function setReviewAskEnabled(
  formData: FormData,
): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const enabled = formData.get("enabled") === "on";

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenants")
    .update({ review_ask_enabled: enabled })
    .eq("id", session.tenant.id);
  if (error) {
    console.warn("setReviewAskEnabled error", error);
    return { error: "update_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "review_ask_toggled",
      entity_type: "tenant",
      entity_id: session.tenant.id,
      metadata: { enabled },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/reviews");
  return { ok: true };
}
