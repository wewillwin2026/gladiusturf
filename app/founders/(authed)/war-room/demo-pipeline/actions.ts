"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, verifySessionCookieValue } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

type ActionResult = { ok: true } | { error: string };

const ALLOWED_STATUSES = new Set([
  "new",
  "scheduled",
  "demoed",
  "won",
  "lost",
  "no_show",
]);
const ALLOWED_ASSIGNEES = new Set(["ricardo", "joshua", ""]);

function pickActor(value: FormDataEntryValue | null): string {
  const raw = String(value ?? "").trim();
  if (raw === "ricardo" || raw === "joshua") return raw;
  return "system";
}

export async function updateBooking(formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionCookieValue(session)) {
    return { error: "unauthorized" };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "missing id" };

  const newStatus = String(formData.get("status") ?? "").trim();
  const newAssignedRaw = String(formData.get("assigned_to") ?? "").trim();
  const notesRaw = formData.get("notes");
  const conversionRaw = String(formData.get("conversion_value_cents") ?? "").trim();
  const actor = pickActor(formData.get("actor"));

  if (newStatus && !ALLOWED_STATUSES.has(newStatus)) {
    return { error: "invalid status" };
  }
  if (newAssignedRaw && !ALLOWED_ASSIGNEES.has(newAssignedRaw)) {
    return { error: "invalid assignee" };
  }

  const sb = supabaseAdmin();

  // Load current row to compute diffs.
  const { data: current, error: loadErr } = await sb
    .from("demo_requests")
    .select("id, status, assigned_to, notes, conversion_value_cents")
    .eq("id", id)
    .maybeSingle();
  if (loadErr || !current) {
    return { error: "not found" };
  }

  const updates: Record<string, unknown> = {};
  const events: Array<{
    booking_id: string;
    event_type: string;
    from_value: string | null;
    to_value: string | null;
    note: string | null;
    actor: string;
  }> = [];

  if (newStatus && newStatus !== current.status) {
    updates.status = newStatus;
    events.push({
      booking_id: id,
      event_type: "status_changed",
      from_value: current.status ?? null,
      to_value: newStatus,
      note: null,
      actor,
    });
  }

  // Treat empty string as "unassigned" (null).
  const desiredAssigned = newAssignedRaw === "" ? null : newAssignedRaw;
  if (newAssignedRaw !== "" || formData.has("assigned_to")) {
    if (desiredAssigned !== (current.assigned_to ?? null)) {
      updates.assigned_to = desiredAssigned;
      events.push({
        booking_id: id,
        event_type: "assigned",
        from_value: current.assigned_to ?? null,
        to_value: desiredAssigned,
        note: null,
        actor,
      });
    }
  }

  if (notesRaw !== null) {
    const next = String(notesRaw);
    const prev = current.notes ?? "";
    if (next !== prev) {
      updates.notes = next.length === 0 ? null : next;
      events.push({
        booking_id: id,
        event_type: "note",
        from_value: null,
        to_value: null,
        note: next.length === 0 ? "(notes cleared)" : next,
        actor,
      });
    }
  }

  if (conversionRaw !== "") {
    const parsed = Number(conversionRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { error: "invalid conversion value" };
    }
    const cents = Math.round(parsed);
    if (cents !== (current.conversion_value_cents ?? -1)) {
      updates.conversion_value_cents = cents;
      events.push({
        booking_id: id,
        event_type: "note",
        from_value: String(current.conversion_value_cents ?? ""),
        to_value: String(cents),
        note: `pipeline value updated to $${(cents / 100).toFixed(0)}`,
        actor,
      });
    }
  }

  if (Object.keys(updates).length === 0 && events.length === 0) {
    return { ok: true };
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await sb
      .from("demo_requests")
      .update(updates)
      .eq("id", id);
    if (updateErr) {
      return { error: updateErr.message };
    }
  }

  if (events.length > 0) {
    const { error: insertErr } = await sb.from("pipeline_events").insert(events);
    if (insertErr) {
      console.warn("pipeline_events insert failed (non-fatal)", insertErr);
    }
  }

  revalidatePath("/founders/war-room");
  return { ok: true };
}
