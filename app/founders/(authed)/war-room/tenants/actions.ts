"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  FOUNDER_COOKIE_NAME,
  verifyFounderSessionCookieValue,
} from "@/lib/founders/auth";
import {
  ADMIN_COOKIE_NAME,
  verifySessionCookieValue,
} from "@/lib/admin-auth";
import { createTenantMagicToken } from "@/lib/app/tenant-auth";
import { supabaseAdmin } from "@/lib/supabase";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";

function fromAddress(): string {
  const env = (process.env.RESEND_FROM_EMAIL ?? "").trim();
  return env.length > 0 ? env : "GladiusTurf <founders@gladiusturf.com>";
}

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

  // Fetch tenant display name + slug for the welcome email.
  const { data: tenant } = await sb
    .from("tenants")
    .select("display_name, slug")
    .eq("id", tenantId)
    .maybeSingle();

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

  // Send welcome email so the invitee gets a direct sign-in link.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && tenant) {
    try {
      const token = createTenantMagicToken(email, tenant.slug);
      const link = `${SITE_URL}/api/app/auth/verify?token=${encodeURIComponent(token)}`;
      const displayName = tenant.display_name ?? "your workspace";
      const resend = new Resend(apiKey);
      const sendRes = await resend.emails.send({
        from: fromAddress(),
        to: email,
        subject: `You've been invited to ${displayName}`,
        html: [
          `<p>You've been invited to the <strong>${displayName}</strong> workspace on GladiusTurf as <strong>${role}</strong>.</p>`,
          `<p><a href="${link}" style="background:#a3e635;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;margin:8px 0;">Access your workspace →</a></p>`,
          `<p style="color:#888;font-size:13px;">This link expires in 15 minutes. If it does, visit <a href="${SITE_URL}/app/login">${SITE_URL}/app/login</a> and enter your email to get a fresh one.</p>`,
          `<p style="color:#888;font-size:13px;">— GladiusTurf</p>`,
        ].join(""),
        text: [
          `You've been invited to ${displayName} on GladiusTurf as ${role}.`,
          "",
          "Sign in (link valid 15 min):",
          link,
          "",
          `If the link expires, visit ${SITE_URL}/app/login and enter your email for a new one.`,
          "",
          "— GladiusTurf",
        ].join("\n"),
      });
      if (sendRes.error) {
        console.warn("[war-room/addInvitation] welcome email rejected by Resend", sendRes.error);
      }
    } catch (e) {
      console.warn("[war-room/addInvitation] welcome email failed (non-fatal)", e);
    }
  }

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
