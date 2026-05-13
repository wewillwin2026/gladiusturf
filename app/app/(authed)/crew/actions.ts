"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true; id: string } | { error: string };

const ROLES = ["owner", "chief", "crew", "admin", "apprentice"] as const;
type Role = (typeof ROLES)[number];

export async function createCrewMember(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "crew").trim();
  const role: Role = (ROLES as readonly string[]).includes(roleRaw)
    ? (roleRaw as Role)
    : "crew";
  const title = String(formData.get("title") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const hourlyRateDollarsRaw = String(formData.get("hourlyRate") ?? "").trim();
  const hourlyRateCents = hourlyRateDollarsRaw
    ? Math.round(Number(hourlyRateDollarsRaw) * 100)
    : null;

  if (!displayName) return { error: "missing_name" };
  if (hourlyRateCents != null && !Number.isFinite(hourlyRateCents)) {
    return { error: "invalid_rate" };
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("crew_members")
    .insert({
      tenant_id: session.tenant.id,
      display_name: displayName,
      role,
      title,
      email,
      phone,
      hourly_rate_cents: hourlyRateCents,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createCrewMember failed", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/crew");
  return { ok: true, id: (data as { id: string }).id };
}

export async function deactivateCrewMember(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("crew_members")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("tenant_id", session.tenant.id)
    .eq("id", id);
  if (error) return { error: "update_failed" };

  revalidatePath("/app/crew");
  return { ok: true };
}

export async function clockIn(
  formData: FormData,
): Promise<{ ok: true; id: string } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const crewMemberId = String(formData.get("crewMemberId") ?? "").trim();
  if (!crewMemberId) return { error: "missing_member" };
  const scheduleItemId =
    String(formData.get("scheduleItemId") ?? "").trim() || null;

  const sb = supabaseAdmin();

  // If there's already an open entry for this member, refuse — they need
  // to clock out first.
  const { data: existing } = await sb
    .from("timesheet_entries")
    .select("id")
    .eq("tenant_id", session.tenant.id)
    .eq("crew_member_id", crewMemberId)
    .eq("status", "open")
    .maybeSingle();
  if (existing) return { error: "already_clocked_in" };

  const { data, error } = await sb
    .from("timesheet_entries")
    .insert({
      tenant_id: session.tenant.id,
      crew_member_id: crewMemberId,
      schedule_item_id: scheduleItemId,
      status: "open",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("clockIn failed", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/timesheets");
  return { ok: true, id: (data as { id: string }).id };
}

export async function clockOut(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "missing_id" };

  const sb = supabaseAdmin();
  const { data: entry, error: fetchErr } = await sb
    .from("timesheet_entries")
    .select(
      "id, started_at, status, crew_members(hourly_rate_cents)",
    )
    .eq("tenant_id", session.tenant.id)
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !entry) return { error: "not_found" };

  type Entry = {
    id: string;
    started_at: string;
    status: string;
    crew_members:
      | { hourly_rate_cents: number | null }
      | { hourly_rate_cents: number | null }[]
      | null;
  };
  const row = entry as Entry;
  if (row.status !== "open") return { error: "not_open" };

  const startedAt = new Date(row.started_at);
  const endedAt = new Date();
  const totalMinutes = Math.max(
    0,
    Math.round((endedAt.getTime() - startedAt.getTime()) / 60000),
  );
  const cm = Array.isArray(row.crew_members)
    ? row.crew_members[0]
    : row.crew_members;
  const hourlyRate = cm?.hourly_rate_cents ?? null;
  const payCents =
    hourlyRate == null ? null : Math.round((hourlyRate * totalMinutes) / 60);

  const { error } = await sb
    .from("timesheet_entries")
    .update({
      status: "closed",
      ended_at: endedAt.toISOString(),
      total_minutes: totalMinutes,
      pay_cents: payCents,
      updated_at: endedAt.toISOString(),
    })
    .eq("tenant_id", session.tenant.id)
    .eq("id", id);

  if (error) {
    console.warn("clockOut failed", error);
    return { error: "update_failed" };
  }

  revalidatePath("/app/timesheets");
  return { ok: true };
}
