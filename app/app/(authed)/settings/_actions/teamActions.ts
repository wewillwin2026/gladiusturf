"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import {
  TENANT_COOKIE_NAME,
  verifyTenantSessionCookieValue,
  createTenantMagicToken,
  getTenantBySlug,
} from "@/lib/app/tenant-auth";

type ActionResult = { ok: true } | { error: string };

const ALLOWED_ROLES = new Set(["owner", "admin", "operator", "viewer"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANAGER_ROLES = new Set(["owner", "admin"]);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";

async function requireTenantSession(): Promise<{
  email: string;
  tenantSlug: string;
} | null> {
  const store = await cookies();
  return (
    verifyTenantSessionCookieValue(store.get(TENANT_COOKIE_NAME)?.value) ?? null
  );
}

async function getRequesterRole(
  email: string,
  tenantId: string,
): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("tenant_invitations")
    .select("role")
    .eq("email", email.toLowerCase())
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .maybeSingle();
  return (data as { role: string } | null)?.role ?? null;
}

function fromAddress(): string {
  const env = (process.env.RESEND_FROM_EMAIL ?? "").trim();
  return env.length > 0 ? env : "GladiusTurf <founders@gladiusturf.com>";
}

export async function inviteTeamMember(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTenantSession();
  if (!session) return { error: "unauthenticated" };

  const tenant = await getTenantBySlug(session.tenantSlug);
  if (!tenant) return { error: "tenant_not_found" };

  const requesterRole = await getRequesterRole(session.email, tenant.id);
  if (!requesterRole || !MANAGER_ROLES.has(requesterRole)) {
    return { error: "Only owners and admins can invite team members" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "").trim();

  if (!EMAIL_RE.test(email)) return { error: "Invalid email address" };
  if (!ALLOWED_ROLES.has(role)) return { error: "Invalid role" };

  if ((role === "owner" || role === "admin") && requesterRole !== "owner") {
    return { error: "Only owners can invite owners or admins" };
  }

  const sb = supabaseAdmin();
  const { error: dbError } = await sb.from("tenant_invitations").upsert(
    {
      tenant_id: tenant.id,
      email,
      role,
      status: "active",
      invited_by: session.email,
    },
    { onConflict: "email,tenant_id" },
  );
  if (dbError) return { error: dbError.message };

  // Send welcome email immediately so they get a direct link.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const token = createTenantMagicToken(email, session.tenantSlug);
      const link = `${SITE_URL}/api/app/auth/verify?token=${encodeURIComponent(token)}`;
      const resend = new Resend(apiKey);
      const sendRes = await resend.emails.send({
        from: fromAddress(),
        to: email,
        subject: `You've been invited to ${tenant.display_name}`,
        html: [
          `<p>You've been invited to the <strong>${tenant.display_name}</strong> workspace on GladiusTurf as <strong>${role}</strong>.</p>`,
          `<p><a href="${link}" style="background:#a3e635;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;margin:8px 0;">Access your workspace →</a></p>`,
          `<p style="color:#888;font-size:13px;">This link expires in 15 minutes. If it does, visit <a href="${SITE_URL}/app/login">${SITE_URL}/app/login</a> and enter your email to get a fresh one.</p>`,
          `<p style="color:#888;font-size:13px;">— GladiusTurf</p>`,
        ].join(""),
        text: [
          `You've been invited to ${tenant.display_name} on GladiusTurf as ${role}.`,
          "",
          `Sign in (link valid 15 min):`,
          link,
          "",
          `If the link expires, visit ${SITE_URL}/app/login and enter your email for a new one.`,
          "",
          "— GladiusTurf",
        ].join("\n"),
      });
      if (sendRes.error) {
        console.warn("[team/invite] welcome email rejected by Resend", sendRes.error);
      }
    } catch (e) {
      console.warn("[team/invite] welcome email failed (non-fatal)", e);
    }
  }

  revalidatePath("/app/settings");
  return { ok: true };
}

export async function revokeTeamMember(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTenantSession();
  if (!session) return { error: "unauthenticated" };

  const tenant = await getTenantBySlug(session.tenantSlug);
  if (!tenant) return { error: "tenant_not_found" };

  const requesterRole = await getRequesterRole(session.email, tenant.id);
  if (!requesterRole || !MANAGER_ROLES.has(requesterRole)) {
    return { error: "insufficient_permissions" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Missing email" };
  if (email === session.email.toLowerCase()) {
    return { error: "You can't revoke your own access" };
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenant_invitations")
    .update({ status: "revoked" })
    .eq("tenant_id", tenant.id)
    .eq("email", email);
  if (error) return { error: error.message };

  revalidatePath("/app/settings");
  return { ok: true };
}

export async function resendInviteEmail(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTenantSession();
  if (!session) return { error: "unauthenticated" };

  const tenant = await getTenantBySlug(session.tenantSlug);
  if (!tenant) return { error: "tenant_not_found" };

  const requesterRole = await getRequesterRole(session.email, tenant.id);
  if (!requesterRole || !MANAGER_ROLES.has(requesterRole)) {
    return { error: "insufficient_permissions" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Invalid email" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "Email not configured" };

  try {
    const token = createTenantMagicToken(email, session.tenantSlug);
    const link = `${SITE_URL}/api/app/auth/verify?token=${encodeURIComponent(token)}`;
    const resend = new Resend(apiKey);
    const sendRes = await resend.emails.send({
      from: fromAddress(),
      to: email,
      subject: `Your sign-in link for ${tenant.display_name}`,
      html: [
        `<p>Here is your sign-in link for the <strong>${tenant.display_name}</strong> workspace.</p>`,
        `<p><a href="${link}" style="background:#a3e635;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;margin:8px 0;">Sign in →</a></p>`,
        `<p style="color:#888;font-size:13px;">Expires in 15 minutes.</p>`,
        `<p style="color:#888;font-size:13px;">— GladiusTurf</p>`,
      ].join(""),
      text: [`Sign-in link for ${tenant.display_name} (valid 15 min):`, link, "", "— GladiusTurf"].join("\n"),
    });
    if (sendRes.error) return { error: sendRes.error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "send_failed" };
  }

  return { ok: true };
}
