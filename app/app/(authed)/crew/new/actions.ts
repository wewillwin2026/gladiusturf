"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

// Role values MUST match the crew_members.role CHECK constraint
// (migration 20260513_b): owner | chief | crew | admin | apprentice.
// We expose 3 friendly options (chief/crew/apprentice) — owner/admin
// overlap with tenant access roles and don't belong on this form.
export type CrewRole = "chief" | "crew" | "apprentice";

export type CreateCrewMemberInput = {
  display_name: string;
  role: CrewRole;
  title: string | null;
  email: string | null;
  phone: string | null;
  hourly_rate_dollars: number | null;
  hire_date: string | null;
  notes: string | null;
};

export type CreateCrewMemberResult =
  | { ok: true; id: string }
  | { error: string };

const ROLES = ["chief", "crew", "apprentice"] as const;

/**
 * Create a single crew member for the authenticated tenant. Used by the
 * /app/crew/new manual-entry form. Mirrors the proven createCustomer
 * server action under /app/customers/new.
 */
export async function createCrewMember(
  input: CreateCrewMemberInput,
): Promise<CreateCrewMemberResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }

  const name = (input.display_name ?? "").trim();
  if (!name) return { error: "missing_name" };

  const role: CrewRole = (ROLES as readonly string[]).includes(input.role)
    ? input.role
    : "crew";

  const hourlyRateCents =
    input.hourly_rate_dollars != null &&
    Number.isFinite(input.hourly_rate_dollars)
      ? Math.round(input.hourly_rate_dollars * 100)
      : null;

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("crew_members")
    .insert({
      tenant_id: session.tenant.id,
      display_name: name,
      role,
      title: input.title?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
      hourly_rate_cents: hourlyRateCents,
      hire_date: input.hire_date?.trim() || null,
      active: true,
      notes: input.notes?.trim() || null,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createCrewMember error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/crew");
  return { ok: true, id: (data as { id: string }).id };
}
