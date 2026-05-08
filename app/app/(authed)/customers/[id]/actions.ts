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
