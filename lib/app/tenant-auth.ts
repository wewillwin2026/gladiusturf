import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Tenant auth — real customer login at /app/login.
 *
 * Flow:
 *  1. POST /api/app/auth/magic { email } → if email is in the tenant
 *     invitation map, send Resend magic link to /app/auth/verify?token=…
 *  2. /app/auth/verify → token verified → ensure auth.users row exists
 *     (create via service role if not), ensure tenant_members row exists,
 *     set `gladius_tenant_session` cookie (HttpOnly, Secure, SameSite=Lax,
 *     7-day TTL) → redirect to /app
 *
 * The cookie carries `tenant_slug` in addition to `email` so the workspace
 * shell can read tenant identity without a DB hit on every request. The
 * actual data scoping happens via Supabase RLS using `is_tenant_member()`
 * — the cookie is not the security boundary.
 *
 * This is deliberately separate from /api/app/login (the demo creds path)
 * so the existing sales-demo flow continues to work.
 */

export const TENANT_COOKIE_NAME = "gladius_tenant_session";
const SESSION_TTL_DAYS = 7;
const MAGIC_TOKEN_TTL_SECONDS = 15 * 60; // 15 min

/**
 * v1 invitation map: email → tenant slug + role. When a customer signs in
 * for the first time via magic link, we look them up here and grant them
 * membership in the listed tenant. v2 will replace this with a
 * `tenant_invitations` table managed in the founders' War Room.
 */
const INVITATIONS: Record<string, { tenantSlug: string; role: TenantRole }> = {
  // Bright Lights pilot owners (Felipe + Cristian when their emails are
  // confirmed; founders for testing in the meantime).
  "ricardo.gamon99@icloud.com": { tenantSlug: "bright-lights-encina", role: "owner" },
  "joshuapyorke@gmail.com": { tenantSlug: "bright-lights-encina", role: "owner" },
};

export type TenantRole = "owner" | "admin" | "operator" | "viewer";

export function tenantInvitationFor(
  email: string,
): { tenantSlug: string; role: TenantRole } | null {
  return INVITATIONS[email.toLowerCase().trim()] ?? null;
}

export function isInvitedEmail(email: string): boolean {
  return tenantInvitationFor(email) !== null;
}

function sessionSecret(): string {
  return (
    process.env.TENANT_SESSION_SECRET ||
    process.env.FOUNDER_SESSION_SECRET ||
    "gladius-tenant-fallback-secret-not-for-prod-rotate-me"
  );
}

// ---- magic link tokens (email + tenant slug in payload) ----

export function createTenantMagicToken(email: string, tenantSlug: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAGIC_TOKEN_TTL_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const e = email.toLowerCase().trim();
  const t = tenantSlug.toLowerCase().trim();
  const payload = `${exp}|${nonce}|${e}|${t}|tenant-magic`;
  const hmac = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return [
    exp,
    nonce,
    Buffer.from(e).toString("hex"),
    Buffer.from(t).toString("hex"),
    hmac,
  ].join(".");
}

export function verifyTenantMagicToken(
  raw: string | undefined,
): { email: string; tenantSlug: string } | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 5) return null;
  const [expStr, nonce, emailHex, tenantHex, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  let email: string;
  let tenantSlug: string;
  try {
    email = Buffer.from(emailHex, "hex").toString("utf8");
    tenantSlug = Buffer.from(tenantHex, "hex").toString("utf8");
  } catch {
    return null;
  }
  // Cross-check the email/tenant pair against the invitation map.
  const invite = tenantInvitationFor(email);
  if (!invite || invite.tenantSlug !== tenantSlug) return null;
  const expected = createHmac("sha256", sessionSecret())
    .update(`${exp}|${nonce}|${email}|${tenantSlug}|tenant-magic`)
    .digest("hex");
  if (expected.length !== hmacHex.length) return null;
  try {
    if (
      !timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(hmacHex, "hex"),
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return { email, tenantSlug };
}

// ---- session cookie (email + tenant slug in payload) ----

export function createTenantSessionCookieValue(
  email: string,
  tenantSlug: string,
): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60;
  const nonce = randomBytes(16).toString("hex");
  const e = email.toLowerCase().trim();
  const t = tenantSlug.toLowerCase().trim();
  const payload = `${exp}|${nonce}|${e}|${t}|tenant-session`;
  const hmac = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return [
    exp,
    nonce,
    Buffer.from(e).toString("hex"),
    Buffer.from(t).toString("hex"),
    hmac,
  ].join(".");
}

export function verifyTenantSessionCookieValue(
  raw: string | undefined,
): { email: string; tenantSlug: string } | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 5) return null;
  const [expStr, nonce, emailHex, tenantHex, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  let email: string;
  let tenantSlug: string;
  try {
    email = Buffer.from(emailHex, "hex").toString("utf8");
    tenantSlug = Buffer.from(tenantHex, "hex").toString("utf8");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", sessionSecret())
    .update(`${exp}|${nonce}|${email}|${tenantSlug}|tenant-session`)
    .digest("hex");
  if (expected.length !== hmacHex.length) return null;
  try {
    if (
      !timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(hmacHex, "hex"),
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return { email, tenantSlug };
}

export function buildTenantSetCookieHeader(
  value: string,
  opts?: { clear?: boolean },
): string {
  const parts = [
    `${TENANT_COOKIE_NAME}=${opts?.clear ? "" : value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ];
  if (opts?.clear) parts.push("Max-Age=0");
  else parts.push(`Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`);
  return parts.join("; ");
}

// ---- Tenant + membership helpers (service role) ----

export type TenantRow = {
  id: string;
  slug: string;
  display_name: string;
  vertical: string;
  plan_tier: string;
  brand_primary_hex: string | null;
  brand_accent_hex: string | null;
  primary_language: string;
  bilingual: boolean;
  active: boolean;
};

export async function getTenantBySlug(slug: string): Promise<TenantRow | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenants")
    .select(
      "id, slug, display_name, vertical, plan_tier, brand_primary_hex, brand_accent_hex, primary_language, bilingual, active",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.warn("getTenantBySlug error", error);
    return null;
  }
  return (data as TenantRow | null) ?? null;
}

/**
 * Idempotent: looks up the auth.users row for the email; if missing, creates
 * one via the Supabase admin API. Returns the user id.
 *
 * Uses email_confirm: true since the magic-link verification IS the email
 * confirmation step. We don't need a second confirmation roundtrip.
 */
export async function ensureAuthUser(email: string): Promise<string> {
  const sb = supabaseAdmin();
  const lower = email.toLowerCase().trim();

  // Try to find existing user.
  const { data: list } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === lower);
  if (existing) return existing.id;

  // Create new user.
  const { data, error } = await sb.auth.admin.createUser({
    email: lower,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) throw new Error("auth.admin.createUser returned no user");
  return data.user.id;
}

/**
 * Idempotent: ensures the (tenant_id, user_id, role) row exists.
 */
export async function ensureTenantMembership(
  tenantId: string,
  userId: string,
  role: TenantRole,
  displayName?: string,
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("tenant_members")
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        role,
        display_name: displayName ?? null,
      },
      { onConflict: "tenant_id,user_id" },
    );
  if (error) throw error;
}
