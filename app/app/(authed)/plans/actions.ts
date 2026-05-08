"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Plans editor — Bright Lights pilot Day-1 (2026-05-08).
 *
 * Tenants can rename, reprice, edit features, toggle "most popular",
 * archive, or add custom tiers. The three default Bright Basics / Care /
 * Guardian tiers are seeded at signup; this lets Cristian/Felipe shape
 * them to their actual offer language.
 *
 * Auth: tenant session required. Demo + unauthenticated rejected.
 * Tenant scoping: every query filters by session.tenant.id — never
 * trust the FormData id alone. Audit-logged on every mutation.
 */

const ALLOWED_TIERS = ["basics", "care", "guardian", "custom"] as const;
type Tier = (typeof ALLOWED_TIERS)[number];

type Result = { ok: true; planId?: string } | { error: string };

function nullIfBlank(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function parseFeatures(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parsePriceCents(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  // Accept "249", "249.00", "$249", "1,499.50". Strip $ and commas.
  const cleaned = t.replace(/[$,\s]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function parseInt0OrNull(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.trunc(n);
}

function isTier(value: string): value is Tier {
  return (ALLOWED_TIERS as readonly string[]).includes(value);
}

/**
 * Update an existing plan. Tenant-scoped by id+tenant_id. If
 * most_popular is set true, clears it on every other plan in the
 * tenant first (single-most-popular invariant).
 */
export async function updatePlan(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "missing_id" };

  const displayName = nullIfBlank(formData.get("display_name"));
  if (!displayName) return { error: "display_name_required" };

  const priceCents = parsePriceCents(formData.get("annual_price_cents"));
  if (priceCents === null || priceCents <= 0) {
    return { error: "annual_price_cents_invalid" };
  }

  const tierRaw = String(formData.get("tier") ?? "").trim();
  if (!isTier(tierRaw)) return { error: "invalid_tier" };

  const sb = supabaseAdmin();

  // Verify the row belongs to this tenant before mutating. Also pulls
  // current tier so we know whether the locked-tier guard applies.
  const { data: existing, error: readErr } = await sb
    .from("plans")
    .select("id, tier")
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (readErr) {
    console.warn("updatePlan read error", readErr);
    return { error: "lookup_failed" };
  }
  if (!existing) return { error: "not_found_in_tenant" };

  // Locked-tier guard: the three seeded tiers (basics/care/guardian)
  // can rename + reprice but cannot change tier slot. Custom tiers can
  // freely change tier (which is always "custom" anyway).
  const currentTier = (existing as { tier: string }).tier;
  const finalTier =
    currentTier === "custom" ? tierRaw : (currentTier as Tier);

  const mostPopular = formData.get("most_popular") === "on";
  const active = formData.get("active") !== "off"; // default active

  const update = {
    display_name: displayName,
    annual_price_cents: priceCents,
    tier: finalTier,
    badge: nullIfBlank(formData.get("badge")),
    most_popular: mostPopular,
    features: parseFeatures(formData.get("features")),
    cadence: nullIfBlank(formData.get("cadence")),
    visits_per_year: parseInt0OrNull(formData.get("visits_per_year")),
    recommended_for: nullIfBlank(formData.get("recommended_for")),
    active,
  };

  // Single-most-popular invariant: clear other rows in this tenant
  // before flipping this one to true.
  if (mostPopular) {
    const { error: clearErr } = await sb
      .from("plans")
      .update({ most_popular: false })
      .eq("tenant_id", session.tenant.id)
      .neq("id", id);
    if (clearErr) {
      console.warn("updatePlan clear-others error", clearErr);
      return { error: "update_failed" };
    }
  }

  const { error } = await sb
    .from("plans")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("updatePlan update error", error);
    return { error: "update_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "plan_updated",
      entity_type: "plan",
      entity_id: id,
      metadata: {
        display_name: displayName,
        tier: finalTier,
        annual_price_cents: priceCents,
        most_popular: mostPopular,
        active,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/plans");
  return { ok: true, planId: id };
}

/**
 * Insert a new custom-tier plan. Tier is forced to "custom" — only the
 * three seeded slots (basics/care/guardian) carry the named-tier
 * semantics, and the (tenant_id, tier) unique constraint prevents
 * collision anyway.
 */
export async function createPlan(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const displayName = nullIfBlank(formData.get("display_name"));
  if (!displayName) return { error: "display_name_required" };

  const priceCents = parsePriceCents(formData.get("annual_price_cents"));
  if (priceCents === null || priceCents <= 0) {
    return { error: "annual_price_cents_invalid" };
  }

  const sb = supabaseAdmin();

  const mostPopular = formData.get("most_popular") === "on";
  const active = formData.get("active") !== "off";

  if (mostPopular) {
    const { error: clearErr } = await sb
      .from("plans")
      .update({ most_popular: false })
      .eq("tenant_id", session.tenant.id);
    if (clearErr) {
      console.warn("createPlan clear-others error", clearErr);
      return { error: "insert_failed" };
    }
  }

  // Bright Lights' default vertical is "lighting" — pull the value off
  // an existing plan so a custom tier inherits the tenant's vertical
  // rather than guessing.
  const { data: anyPlan } = await sb
    .from("plans")
    .select("vertical")
    .eq("tenant_id", session.tenant.id)
    .limit(1)
    .maybeSingle();
  const vertical = (anyPlan as { vertical: string } | null)?.vertical ?? "lighting";

  const { data: inserted, error } = await sb
    .from("plans")
    .insert({
      tenant_id: session.tenant.id,
      vertical,
      tier: "custom",
      display_name: displayName,
      annual_price_cents: priceCents,
      visits_per_year: parseInt0OrNull(formData.get("visits_per_year")),
      cadence: nullIfBlank(formData.get("cadence")),
      features: parseFeatures(formData.get("features")),
      badge: nullIfBlank(formData.get("badge")),
      most_popular: mostPopular,
      recommended_for: nullIfBlank(formData.get("recommended_for")),
      active,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    console.warn("createPlan insert error", error);
    // The unique (tenant_id, tier) constraint can't fire for "custom"
    // since we don't have it on that value, but be defensive.
    return { error: "insert_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "plan_created",
      entity_type: "plan",
      entity_id: inserted.id as string,
      metadata: {
        display_name: displayName,
        tier: "custom",
        annual_price_cents: priceCents,
        most_popular: mostPopular,
        active,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app/plans");
  return { ok: true, planId: inserted.id as string };
}
