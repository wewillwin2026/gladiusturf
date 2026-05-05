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
  // FormData ids alone.
  const [{ data: customer }, { data: plan }] = await Promise.all([
    sb
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .eq("tenant_id", session.tenant.id)
      .maybeSingle(),
    sb
      .from("plans")
      .select("id")
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

  // Best-effort audit
  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "plan_subscribed",
      entity_type: "plan_subscription",
      entity_id: customerId,
      metadata: { plan_id: planId, customer_id: customerId },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath(`/app/customers/${customerId}`);
  revalidatePath("/app/plans");
  return { ok: true } as const;
}
