import { supabaseAdmin } from "@/lib/supabase";

export type CrossTenantReadEvent = {
  /** The tenant whose data was read. */
  tenantId: string;
  /** The founder email reading. */
  actorEmail: string;
  /** Logical surface, e.g. "founders/war-room/customers", "demo-pipeline". */
  surface: string;
  /** What action was taken — typically "read", "export", "support_login". */
  action: string;
  /** Optional resource UUID (customer, invoice, deal) the access targeted. */
  resourceId?: string;
  /** Operator-supplied note (incident #, debugging context). */
  reason?: string;
};

/**
 * Append-only audit row for every founder query that reads another
 * tenant's data. Best-effort — never throws, never blocks the surface
 * being instrumented. Wraps the active support_access_grants lookup so
 * the row references the grant that authorized the access (when one
 * exists; legacy reads without an active grant still log, with the FK
 * left null and operations review notified).
 */
export async function logCrossTenantRead(
  event: CrossTenantReadEvent,
): Promise<void> {
  try {
    const sb = supabaseAdmin();
    const { data: activeGrant } = await sb
      .from("support_access_grants")
      .select("id")
      .eq("tenant_id", event.tenantId)
      .eq("granted_to_email", event.actorEmail)
      .eq("status", "active")
      .maybeSingle();
    await sb.from("cross_tenant_access_log").insert({
      tenant_id: event.tenantId,
      actor_email: event.actorEmail,
      surface: event.surface,
      action: event.action,
      resource_id: event.resourceId ?? null,
      reason: event.reason ?? null,
      granted_by_id: (activeGrant as { id: string } | null)?.id ?? null,
    });
  } catch (err) {
    console.warn("[support-access] log failed", err);
  }
}

/**
 * Returns true if the actor has an active grant against the tenant.
 * Used by the future opt-in UI to decide whether the support surface
 * is available; not currently a hard gate (founders can still read,
 * but every read is logged either way).
 */
export async function hasActiveGrant(
  tenantId: string,
  actorEmail: string,
): Promise<boolean> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("support_access_grants")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("granted_to_email", actorEmail)
      .eq("status", "active")
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}
