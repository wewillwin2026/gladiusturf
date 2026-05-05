"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import {
  ADMIN_COOKIE_NAME,
  verifySessionCookieValue,
} from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

type ActionResult = { ok: true } | { error: string };

const ALLOWED_ROLES = new Set(["owner", "admin", "operator", "viewer"]);
// Tight enough to reject obvious garbage; the magic-link flow re-validates
// at sign-in time, so this is purely for input hygiene here.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireFounderEmail(): Promise<string | null> {
  const store = await cookies();
  const founder = verifyFounderSessionCookieValue(
    store.get(FOUNDER_COOKIE_NAME)?.value,
  );
  if (founder) return founder.email;
  // Mirror the layout's 24h grace for the legacy admin cookie so a
  // currently-signed-in founder isn't suddenly locked out of writes.
  if (verifySessionCookieValue(store.get(ADMIN_COOKIE_NAME)?.value)) {
    return "legacy-admin";
  }
  return null;
}

export async function addInvitation(
  formData: FormData,
): Promise<ActionResult> {
  const founder = await requireFounderEmail();
  if (!founder) return { error: "unauthenticated" };

  const tenantId = String(formData.get("tenant_id") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!tenantId) return { error: "missing tenant_id" };
  if (!EMAIL_RE.test(email)) return { error: "invalid email" };
  if (!ALLOWED_ROLES.has(role)) return { error: "invalid role" };

  const sb = supabaseAdmin();
  const { error } = await sb.from("tenant_invitations").upsert(
    {
      tenant_id: tenantId,
      email,
      role,
      status: "active",
      invited_by: founder === "legacy-admin" ? null : founder,
      notes: notes.length > 0 ? notes : null,
    },
    { onConflict: "email,tenant_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/founders/war-room/tenants");
  return { ok: true };
}

export async function revokeInvitation(
  formData: FormData,
): Promise<ActionResult> {
  const founder = await requireFounderEmail();
  if (!founder) return { error: "unauthenticated" };

  const tenantId = String(formData.get("tenant_id") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!tenantId) return { error: "missing tenant_id" };
  if (!email) return { error: "missing email" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenant_invitations")
    .update({ status: "revoked" })
    .eq("tenant_id", tenantId)
    .eq("email", email);
  if (error) return { error: error.message };

  revalidatePath("/founders/war-room/tenants");
  return { ok: true };
}
