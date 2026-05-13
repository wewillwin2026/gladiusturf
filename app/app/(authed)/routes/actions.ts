"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true } | { error: string };

type ScheduleItem = {
  id: string;
  customer_id: string | null;
  starts_at: string;
  customers: { service_address: unknown } | { service_address: unknown }[] | null;
};

function extractZip(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "";
  const a = addr as Record<string, unknown>;
  const zip = a.zip ?? a.postal_code ?? a.postalCode ?? a.postcode;
  if (typeof zip === "string") return zip.slice(0, 10);
  return "";
}

/**
 * Reorder a single schedule item — set its route_position. Optimistic UI
 * calls this on drag-end. Tenant-scoped (RLS belt + tenant_id where-clause
 * suspenders).
 */
export async function setRoutePosition(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  const positionRaw = String(formData.get("position") ?? "").trim();
  const position = Number(positionRaw);
  if (!id || !Number.isFinite(position)) return { error: "invalid_input" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("schedule_items")
    .update({ route_position: Math.round(position) })
    .eq("tenant_id", session.tenant.id)
    .eq("id", id);
  if (error) {
    console.warn("setRoutePosition failed", error);
    return { error: "update_failed" };
  }

  revalidatePath("/app/routes");
  return { ok: true };
}

/**
 * Auto-order the day's stops by customer ZIP code, then by start time.
 * v1: deterministic ZIP-asc + time-asc. Good enough for clustering by
 * neighborhood without a real geocoder. v2 will plug in real distance
 * once we have lat/lng on service_address.
 */
export async function autoOrderByZip(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const dayKey = String(formData.get("dayKey") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return { error: "invalid_day" };

  const sb = supabaseAdmin();
  const dayStart = new Date(`${dayKey}T00:00:00Z`).toISOString();
  const dayEnd = new Date(
    new Date(`${dayKey}T00:00:00Z`).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await sb
    .from("schedule_items")
    .select("id, customer_id, starts_at, customers(service_address)")
    .eq("tenant_id", session.tenant.id)
    .gte("starts_at", dayStart)
    .lt("starts_at", dayEnd);

  if (error || !data) {
    console.warn("autoOrderByZip query failed", error);
    return { error: "query_failed" };
  }

  const rows = (data as unknown as ScheduleItem[]).map((r) => {
    const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
    return {
      id: r.id,
      zip: extractZip(cust?.service_address),
      starts: new Date(r.starts_at).getTime(),
    };
  });

  rows.sort((a, b) => {
    if (a.zip && b.zip && a.zip !== b.zip) return a.zip.localeCompare(b.zip);
    if (a.zip && !b.zip) return -1;
    if (!a.zip && b.zip) return 1;
    return a.starts - b.starts;
  });

  // Bulk update sequentially — small N (1 day's stops); avoids RLS roundtrips
  // exceeding plan limits.
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    await sb
      .from("schedule_items")
      .update({ route_position: i + 1 })
      .eq("tenant_id", session.tenant.id)
      .eq("id", r.id);
  }

  // Audit
  await sb.from("audit_log").insert({
    tenant_id: session.tenant.id,
    user_id: null,
    action: "routes_auto_order_by_zip",
    entity_type: "schedule_items",
    entity_id: dayKey,
    metadata: { day: dayKey, count: rows.length },
  });

  revalidatePath("/app/routes");
  return { ok: true };
}
