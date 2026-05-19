"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export type ScheduleItemType =
  | "install"
  | "service"
  | "warranty"
  | "plan_visit"
  | "quote_visit"
  | "storm_response"
  | "holiday_install"
  | "other";

export type CreateScheduleItemInput = {
  title: string;
  type: ScheduleItemType;
  customer_id: string | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
};

export type CreateScheduleItemResult =
  | { ok: true; id: string }
  | { error: string };

const VALID_TYPES: readonly ScheduleItemType[] = [
  "install",
  "service",
  "warranty",
  "plan_visit",
  "quote_visit",
  "storm_response",
  "holiday_install",
  "other",
];

/**
 * Create a single schedule_items row for the authenticated tenant. Used by
 * the /app/jobs/new "Schedule a job" manual-entry form. A job is a scheduled
 * visit — install, service, warranty, plan visit, etc. Accepting a quote
 * elsewhere also auto-creates an install slot in this same table.
 */
export async function createScheduleItem(
  input: CreateScheduleItemInput,
): Promise<CreateScheduleItemResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }

  const title = (input.title ?? "").trim();
  if (!title) return { error: "missing_title" };

  const type = VALID_TYPES.includes(input.type) ? input.type : "service";

  const start = new Date(input.starts_at);
  if (Number.isNaN(start.getTime())) return { error: "invalid_start" };

  let end = new Date(input.ends_at);
  if (Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + 90 * 60 * 1000);
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("schedule_items")
    .insert({
      tenant_id: session.tenant.id,
      type,
      title,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "scheduled",
      customer_id: input.customer_id || null,
      notes: input.notes?.trim() || null,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("createScheduleItem error", error);
    return { error: "insert_failed" };
  }

  revalidatePath("/app/jobs");
  revalidatePath("/app/schedule");
  return { ok: true, id: data.id as string };
}
