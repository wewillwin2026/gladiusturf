"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Subscribe a customer to a plan tier. Idempotent on (tenant, customer,
 * plan, starts_at) — same plan + same start day = no duplicate row.
 *
 * Auth: only callable inside an authenticated tenant session. The session
 * helper enforces it; if a non-tenant cookie is present, throws.
 */
export async function subscribeCustomerToPlan(formData: FormData) {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" } as const;
  }

  const customerId = String(formData.get("customer_id") ?? "");
  const planId = String(formData.get("plan_id") ?? "");
  if (!customerId || !planId) {
    return { error: "missing_field" } as const;
  }

  const sb = supabaseAdmin();

  // Sanity check both rows are scoped to this tenant — never trust the
  // FormData ids alone. Pull plan.tier so we can mirror it onto the
  // customer record (Storm Mode reads customers.customer_tier for
  // top-tier-priority routing — see automations/storm/actions.ts).
  const [{ data: customer }, { data: plan }] = await Promise.all([
    sb
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .eq("tenant_id", session.tenant.id)
      .maybeSingle(),
    sb
      .from("plans")
      .select("id, tier")
      .eq("id", planId)
      .eq("tenant_id", session.tenant.id)
      .maybeSingle(),
  ]);
  if (!customer || !plan) {
    return { error: "not_found_in_tenant" } as const;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await sb
    .from("plan_subscriptions")
    .upsert(
      {
        tenant_id: session.tenant.id,
        customer_id: customerId,
        plan_id: planId,
        starts_at: today,
        next_visit_at: null,
        status: "active",
      },
      { onConflict: "tenant_id,customer_id,plan_id,starts_at" },
    );
  if (error) {
    console.warn("subscribeCustomerToPlan error", error);
    return { error: "insert_failed" } as const;
  }

  // Mirror plan.tier onto customers.customer_tier so Storm Mode (and
  // any other tier-aware automation) routes this customer correctly.
  // Defensive: subscription is the primary effect — if the tier sync
  // fails we audit-log and move on rather than reverse the insert.
  const planTier = (plan as { tier: string | null }).tier;
  if (planTier) {
    const { error: tierError } = await sb
      .from("customers")
      .update({ customer_tier: planTier })
      .eq("id", customerId)
      .eq("tenant_id", session.tenant.id);
    if (tierError) {
      console.warn("subscribeCustomerToPlan tier-sync failed", tierError);
      try {
        await sb.from("audit_log").insert({
          tenant_id: session.tenant.id,
          user_id: null,
          action: "plan_subscribed.tier_sync_failed",
          entity_type: "customer",
          entity_id: customerId,
          metadata: {
            plan_id: planId,
            attempted_tier: planTier,
            error: tierError.message,
          },
        });
      } catch (err) {
        console.warn("audit insert failed (non-fatal)", err);
      }
    }
  }

  // Best-effort audit
  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "plan_subscribed",
      entity_type: "plan_subscription",
      entity_id: customerId,
      metadata: {
        plan_id: planId,
        customer_id: customerId,
        synced_tier: planTier ?? null,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  revalidatePath("/app/plans");
  return { ok: true } as const;
}

/**
 * Cancel a customer's active plan subscription(s) and clear their
 * customers.customer_tier so Storm Mode + tier-aware automations
 * stop treating them as a paying-tier member.
 *
 * Defensive: if the tier clear fails we still report success on the
 * cancel itself (audit-logged), since the subscription state change
 * is the primary effect.
 */
export async function unsubscribeCustomerFromPlan(formData: FormData) {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" } as const;
  }

  const customerId = String(formData.get("customer_id") ?? "");
  if (!customerId) {
    return { error: "missing_field" } as const;
  }

  const sb = supabaseAdmin();
  const { data: customer } = await sb
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (!customer) {
    return { error: "not_found_in_tenant" } as const;
  }

  const { error } = await sb
    .from("plan_subscriptions")
    .update({ status: "canceled" })
    .eq("tenant_id", session.tenant.id)
    .eq("customer_id", customerId)
    .eq("status", "active");
  if (error) {
    console.warn("unsubscribeCustomerFromPlan error", error);
    return { error: "update_failed" } as const;
  }

  // Clear the mirrored tier — defensive (audit-only on failure).
  const { error: tierError } = await sb
    .from("customers")
    .update({ customer_tier: null })
    .eq("id", customerId)
    .eq("tenant_id", session.tenant.id);
  if (tierError) {
    console.warn("unsubscribeCustomerFromPlan tier-clear failed", tierError);
    try {
      await sb.from("audit_log").insert({
        tenant_id: session.tenant.id,
        user_id: null,
        action: "plan_unsubscribed.tier_clear_failed",
        entity_type: "customer",
        entity_id: customerId,
        metadata: { error: tierError.message },
      });
    } catch (err) {
      console.warn("audit insert failed (non-fatal)", err);
    }
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "plan_unsubscribed",
      entity_type: "plan_subscription",
      entity_id: customerId,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  revalidatePath("/app/plans");
  return { ok: true } as const;
}

export type LogVisitInput = {
  customerId: string;
  type: "install" | "service" | "warranty" | "storm_response" | "inspection";
  title: string;
  startsAt: string;
  notes?: string | null;
};

export type LogVisitResult =
  | { ok: true; visitId: string }
  | { error: string };

/**
 * Log a completed (or scheduled) service visit on a customer's profile.
 * Inserts a row into schedule_items with the appropriate type tag — the
 * customer detail page already reads this table for the service-history
 * timeline, so the visit appears the moment the action returns.
 */
export async function logServiceVisit(
  input: LogVisitInput,
): Promise<LogVisitResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }
  if (!input.customerId || !input.title?.trim() || !input.startsAt) {
    return { error: "missing_field" };
  }

  const sb = supabaseAdmin();
  const { data: customer } = await sb
    .from("customers")
    .select("id")
    .eq("id", input.customerId)
    .eq("tenant_id", session.tenant.id)
    .maybeSingle();
  if (!customer) return { error: "not_found_in_tenant" };

  const startsAtIso = new Date(input.startsAt).toISOString();
  const status = new Date(input.startsAt).getTime() <= Date.now()
    ? "completed"
    : "scheduled";

  const { data, error } = await sb
    .from("schedule_items")
    .insert({
      tenant_id: session.tenant.id,
      customer_id: input.customerId,
      type: input.type,
      title: input.title.trim(),
      starts_at: startsAtIso,
      status,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("logServiceVisit error", error);
    return { error: "insert_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "visit_logged",
      entity_type: "schedule_item",
      entity_id: data.id as string,
      metadata: {
        customer_id: input.customerId,
        type: input.type,
        starts_at: startsAtIso,
      },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${input.customerId}`);
  revalidatePath("/app/schedule");
  return { ok: true, visitId: data.id as string };
}

// ---------------------------------------------------------------
// Lighting fixtures CRUD — Day-1 of Bright Lights pilot, 2026-05-08.
// ---------------------------------------------------------------

const FIXTURE_BRANDS = ["Cast", "Unique", "FX", "VOLT", "Coastal", "Kichler", "Other"] as const;
const FIXTURE_WARRANTY_STATUSES = ["active", "expiring", "expired", "lifetime"] as const;

type CrudResult = { ok: true } | { error: string };

function nullIfBlank(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}
function intIfNumeric(v: FormDataEntryValue | null): number | null {
  const t = nullIfBlank(v);
  if (t === null) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function tenantOwnedCustomer(sb: ReturnType<typeof supabaseAdmin>, tenantId: string, customerId: string) {
  const { data } = await sb
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  return !!data;
}

export async function createFixture(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const customerId = String(formData.get("customer_id") ?? "");
  const fixtureType = String(formData.get("fixture_type") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  if (!customerId || !fixtureType || !brand) return { error: "missing_field" };
  if (!FIXTURE_BRANDS.includes(brand as (typeof FIXTURE_BRANDS)[number])) return { error: "invalid_brand" };

  const warrantyStatus = nullIfBlank(formData.get("warranty_status"));
  if (warrantyStatus && !FIXTURE_WARRANTY_STATUSES.includes(warrantyStatus as (typeof FIXTURE_WARRANTY_STATUSES)[number])) {
    return { error: "invalid_warranty_status" };
  }
  const installDate = nullIfBlank(formData.get("install_date"));
  const warrantyEnd = nullIfBlank(formData.get("warranty_end"));
  if (installDate && warrantyEnd && warrantyEnd < installDate) {
    return { error: "warranty_end_before_install_date" };
  }

  const sb = supabaseAdmin();
  if (!(await tenantOwnedCustomer(sb, session.tenant.id, customerId))) {
    return { error: "not_found_in_tenant" };
  }

  const { error } = await sb.from("lighting_fixtures").insert({
    tenant_id: session.tenant.id,
    customer_id: customerId,
    external_id: nullIfBlank(formData.get("external_id")),
    fixture_type: fixtureType,
    brand,
    model: nullIfBlank(formData.get("model")),
    wattage_text: nullIfBlank(formData.get("wattage_text")),
    install_date: installDate,
    warranty_status: warrantyStatus,
    warranty_end: warrantyEnd,
    notes: nullIfBlank(formData.get("notes")),
  });
  if (error) {
    console.warn("createFixture error", error);
    return { error: error.message.includes("duplicate") ? "duplicate_external_id" : "insert_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

export async function updateFixture(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const fixtureType = String(formData.get("fixture_type") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  if (!fixtureType || !brand) return { error: "missing_field" };
  if (!FIXTURE_BRANDS.includes(brand as (typeof FIXTURE_BRANDS)[number])) return { error: "invalid_brand" };

  const warrantyStatus = nullIfBlank(formData.get("warranty_status"));
  if (warrantyStatus && !FIXTURE_WARRANTY_STATUSES.includes(warrantyStatus as (typeof FIXTURE_WARRANTY_STATUSES)[number])) {
    return { error: "invalid_warranty_status" };
  }
  const installDate = nullIfBlank(formData.get("install_date"));
  const warrantyEnd = nullIfBlank(formData.get("warranty_end"));
  if (installDate && warrantyEnd && warrantyEnd < installDate) {
    return { error: "warranty_end_before_install_date" };
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_fixtures")
    .update({
      external_id: nullIfBlank(formData.get("external_id")),
      fixture_type: fixtureType,
      brand,
      model: nullIfBlank(formData.get("model")),
      wattage_text: nullIfBlank(formData.get("wattage_text")),
      install_date: installDate,
      warranty_status: warrantyStatus,
      warranty_end: warrantyEnd,
      notes: nullIfBlank(formData.get("notes")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("updateFixture error", error);
    return { error: "update_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

/**
 * Archive a fixture (soft-delete). Sets deleted_at = now() so the row
 * disappears from the active list but warranty_claims.fixture_id keeps
 * its referent — the FK is ON DELETE SET NULL, so a hard delete would
 * orphan every claim that pointed at this fixture. The Archived section
 * in LightingAssets surfaces these for restore + audit.
 */
export async function deleteFixture(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_fixtures")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .is("deleted_at", null);
  if (error) {
    console.warn("deleteFixture error", error);
    return { error: "delete_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "fixture_archived",
      entity_type: "lighting_fixture",
      entity_id: id,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

/**
 * Restore an archived fixture (clear deleted_at). Tenant-scoped and
 * idempotent — restoring a non-archived row is a no-op via the
 * `not.is("deleted_at", null)` guard.
 */
export async function restoreFixture(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_fixtures")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .not("deleted_at", "is", null);
  if (error) {
    console.warn("restoreFixture error", error);
    return { error: "restore_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "fixture_restored",
      entity_type: "lighting_fixture",
      entity_id: id,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

/**
 * Resolve the caller's role inside the current tenant. The session
 * cookie only carries email + slug; role lives on tenant_invitations
 * (mirrored to tenant_members on first login). Cheap single-row lookup.
 */
async function callerRole(
  sb: ReturnType<typeof supabaseAdmin>,
  tenantId: string,
  email: string,
): Promise<string | null> {
  const { data } = await sb
    .from("tenant_invitations")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("email", email.toLowerCase().trim())
    .eq("status", "active")
    .maybeSingle();
  return (data as { role: string } | null)?.role ?? null;
}

/**
 * Permanently delete an archived fixture. Owners-only, archived-only —
 * the `deleted_at is not null` guard prevents accidentally nuking an
 * active fixture. Warranty claims pointing at this fixture get their
 * fixture_id NULLed via the existing ON DELETE SET NULL FK.
 */
export async function purgeFixture(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const role = await callerRole(sb, session.tenant.id, session.email);
  if (role !== "owner") return { error: "forbidden" };

  const { error } = await sb
    .from("lighting_fixtures")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .not("deleted_at", "is", null);
  if (error) {
    console.warn("purgeFixture error", error);
    return { error: "purge_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "fixture_purged",
      entity_type: "lighting_fixture",
      entity_id: id,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

// ---------------------------------------------------------------
// Lighting transformers CRUD
// ---------------------------------------------------------------

export async function createTransformer(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const customerId = String(formData.get("customer_id") ?? "");
  if (!customerId) return { error: "missing_field" };

  const wattsCapacity = intIfNumeric(formData.get("watts_capacity"));
  const wattsLoaded = intIfNumeric(formData.get("watts_loaded"));
  if (wattsCapacity !== null && wattsCapacity < 0) return { error: "negative_capacity" };
  if (wattsLoaded !== null && wattsLoaded < 0) return { error: "negative_load" };
  if (wattsCapacity !== null && wattsLoaded !== null && wattsLoaded > wattsCapacity) {
    return { error: "load_exceeds_capacity" };
  }

  const sb = supabaseAdmin();
  if (!(await tenantOwnedCustomer(sb, session.tenant.id, customerId))) {
    return { error: "not_found_in_tenant" };
  }

  const { error } = await sb.from("lighting_transformers").insert({
    tenant_id: session.tenant.id,
    customer_id: customerId,
    external_id: nullIfBlank(formData.get("external_id")),
    brand: nullIfBlank(formData.get("brand")),
    model: nullIfBlank(formData.get("model")),
    watts_capacity: wattsCapacity,
    watts_loaded: wattsLoaded,
    zones: intIfNumeric(formData.get("zones")),
    install_date: nullIfBlank(formData.get("install_date")),
    location_note: nullIfBlank(formData.get("location_note")),
  });
  if (error) {
    console.warn("createTransformer error", error);
    return { error: error.message.includes("duplicate") ? "duplicate_external_id" : "insert_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

export async function updateTransformer(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const wattsCapacity = intIfNumeric(formData.get("watts_capacity"));
  const wattsLoaded = intIfNumeric(formData.get("watts_loaded"));
  if (wattsCapacity !== null && wattsCapacity < 0) return { error: "negative_capacity" };
  if (wattsLoaded !== null && wattsLoaded < 0) return { error: "negative_load" };
  if (wattsCapacity !== null && wattsLoaded !== null && wattsLoaded > wattsCapacity) {
    return { error: "load_exceeds_capacity" };
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_transformers")
    .update({
      external_id: nullIfBlank(formData.get("external_id")),
      brand: nullIfBlank(formData.get("brand")),
      model: nullIfBlank(formData.get("model")),
      watts_capacity: wattsCapacity,
      watts_loaded: wattsLoaded,
      zones: intIfNumeric(formData.get("zones")),
      install_date: nullIfBlank(formData.get("install_date")),
      location_note: nullIfBlank(formData.get("location_note")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("updateTransformer error", error);
    return { error: "update_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

/**
 * Archive a transformer (soft-delete). Same pattern as deleteFixture —
 * we keep the row so historical context survives even though the
 * lighting_warranty_claims table doesn't FK transformers today (Bright
 * Lights might add transformer-fault claims later, and audit reads
 * benefit from the persisted row regardless).
 */
export async function deleteTransformer(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_transformers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .is("deleted_at", null);
  if (error) {
    console.warn("deleteTransformer error", error);
    return { error: "delete_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "transformer_archived",
      entity_type: "lighting_transformer",
      entity_id: id,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

/**
 * Restore an archived transformer (clear deleted_at).
 */
export async function restoreTransformer(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_transformers")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .not("deleted_at", "is", null);
  if (error) {
    console.warn("restoreTransformer error", error);
    return { error: "restore_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "transformer_restored",
      entity_type: "lighting_transformer",
      entity_id: id,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

/**
 * Permanently delete an archived transformer. Owners-only, archived-only.
 */
export async function purgeTransformer(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const role = await callerRole(sb, session.tenant.id, session.email);
  if (role !== "owner") return { error: "forbidden" };

  const { error } = await sb
    .from("lighting_transformers")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant.id)
    .not("deleted_at", "is", null);
  if (error) {
    console.warn("purgeTransformer error", error);
    return { error: "purge_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "transformer_purged",
      entity_type: "lighting_transformer",
      entity_id: id,
      metadata: { customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

// ---------------------------------------------------------------
// Lighting warranty claims CRUD
// ---------------------------------------------------------------

const CLAIM_STATUSES = ["open", "approved", "denied", "closed"] as const;

export async function createWarrantyClaim(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const customerId = String(formData.get("customer_id") ?? "");
  if (!customerId) return { error: "missing_field" };

  const status = String(formData.get("status") ?? "open");
  if (!CLAIM_STATUSES.includes(status as (typeof CLAIM_STATUSES)[number])) return { error: "invalid_status" };

  const sb = supabaseAdmin();
  if (!(await tenantOwnedCustomer(sb, session.tenant.id, customerId))) {
    return { error: "not_found_in_tenant" };
  }

  const { error } = await sb.from("lighting_warranty_claims").insert({
    tenant_id: session.tenant.id,
    customer_id: customerId,
    fixture_id: nullIfBlank(formData.get("fixture_id")),
    external_id: nullIfBlank(formData.get("external_id")),
    claim_date: nullIfBlank(formData.get("claim_date")) ?? new Date().toISOString().slice(0, 10),
    status,
    manufacturer: nullIfBlank(formData.get("manufacturer")),
    rma_number: nullIfBlank(formData.get("rma_number")),
    resolution: nullIfBlank(formData.get("resolution")),
    notes: nullIfBlank(formData.get("notes")),
  });
  if (error) {
    console.warn("createWarrantyClaim error", error);
    return { error: "insert_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

export async function updateWarrantyClaim(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const status = String(formData.get("status") ?? "open");
  if (!CLAIM_STATUSES.includes(status as (typeof CLAIM_STATUSES)[number])) return { error: "invalid_status" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_warranty_claims")
    .update({
      fixture_id: nullIfBlank(formData.get("fixture_id")),
      external_id: nullIfBlank(formData.get("external_id")),
      claim_date: nullIfBlank(formData.get("claim_date")),
      status,
      manufacturer: nullIfBlank(formData.get("manufacturer")),
      rma_number: nullIfBlank(formData.get("rma_number")),
      resolution: nullIfBlank(formData.get("resolution")),
      notes: nullIfBlank(formData.get("notes")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("updateWarrantyClaim error", error);
    return { error: "update_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}

export async function deleteWarrantyClaim(formData: FormData): Promise<CrudResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!id || !customerId) return { error: "missing_field" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("lighting_warranty_claims")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant.id);
  if (error) {
    console.warn("deleteWarrantyClaim error", error);
    return { error: "delete_failed" };
  }

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true };
}
