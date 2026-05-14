import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
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

export type TenantRole = "owner" | "admin" | "operator" | "viewer";

/**
 * Look up an active invitation for `email`. Backed by the
 * `public.tenant_invitations` table (migration 20260505_e_tenant_invitations).
 *
 * Founders manage this via the War Room — adding a new tenant + a row here
 * provisions a new pilot without code changes. The query joins to the
 * `tenants` table to resolve the slug, since the invitation row only carries
 * `tenant_id`.
 *
 * Returns null on miss OR on db error — the magic-link API treats both as
 * "not invited" and silently 200s (anti-enumeration). We don't fail the
 * request for a transient lookup hiccup; the user can simply retry.
 */
export async function tenantInvitationFor(
  email: string,
): Promise<{ tenantSlug: string; role: TenantRole } | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenant_invitations")
    .select("role, tenants!inner(slug)")
    .eq("email", email.toLowerCase().trim())
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.warn("tenantInvitationFor lookup error", error);
    return null;
  }
  if (!data) return null;
  // Supabase types the joined relation as Tenant[]; we know it's a single
  // row because of the 1:M FK and `inner` join, but TS doesn't.
  const tenants = (data as unknown as { role: TenantRole; tenants: { slug: string } | { slug: string }[] }).tenants;
  const slug = Array.isArray(tenants) ? tenants[0]?.slug : tenants?.slug;
  if (!slug) return null;
  return { tenantSlug: slug, role: (data as unknown as { role: TenantRole }).role };
}

export async function isInvitedEmail(email: string): Promise<boolean> {
  return (await tenantInvitationFor(email)) !== null;
}

const FALLBACK_SECRET = "gladius-tenant-fallback-secret-not-for-prod-rotate-me";

function sessionSecret(): string {
  const explicit =
    process.env.TENANT_SESSION_SECRET || process.env.FOUNDER_SESSION_SECRET;
  if (explicit) return explicit;
  // Hard-fail in production rather than silently using the public fallback.
  // Anyone with the source could otherwise mint valid tokens.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "TENANT_SESSION_SECRET (or FOUNDER_SESSION_SECRET) must be set in production",
    );
  }
  return FALLBACK_SECRET;
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

/**
 * Verify the HMAC token. Pure crypto, no DB lookup — callers cross-check
 * the email/tenant against the live invitation table separately. Splitting
 * it this way keeps the token-verification code synchronous + side-effect-
 * free and makes db hiccups a different failure mode (instead of
 * "looks like a forged token").
 */
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
  marketing_tab_enabled: boolean;
};

export async function getTenantBySlug(slug: string): Promise<TenantRow | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenants")
    .select(
      "id, slug, display_name, vertical, plan_tier, brand_primary_hex, brand_accent_hex, primary_language, bilingual, active, marketing_tab_enabled",
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

// ---- partial auth tokens (issued after password verify when MFA enrolled) ----

const PARTIAL_TOKEN_TTL_SECONDS = 5 * 60; // 5 min

/**
 * Issued after password verification when the user has TOTP enrolled.
 * The client posts this back with the 6-digit code to /api/app/auth/totp.
 * If the partial-token verifies, we know the password step was already
 * passed (trusted), so we only need to check the second factor.
 */
export function createPartialAuthToken(email: string, tenantSlug: string): string {
  const exp = Math.floor(Date.now() / 1000) + PARTIAL_TOKEN_TTL_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const e = email.toLowerCase().trim();
  const t = tenantSlug.toLowerCase().trim();
  const payload = `${exp}|${nonce}|${e}|${t}|tenant-partial`;
  const hmac = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return [
    exp,
    nonce,
    Buffer.from(e).toString("hex"),
    Buffer.from(t).toString("hex"),
    hmac,
  ].join(".");
}

export function verifyPartialAuthToken(
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
    .update(`${exp}|${nonce}|${email}|${tenantSlug}|tenant-partial`)
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

// ---- password (Supabase Auth–backed) ----

/**
 * Verify a tenant user's password via Supabase Auth's signInWithPassword.
 * Returns the user id on success, null on failure (wrong password OR
 * user doesn't exist OR network hiccup — never reveal which).
 *
 * Note: signInWithPassword issues a Supabase session token we don't use —
 * we discard it and rely on our own HMAC cookie. We're using Supabase
 * purely as a password-verification oracle.
 */
export async function verifyTenantPassword(
  email: string,
  password: string,
): Promise<string | null> {
  if (!email || !password) return null;
  const sb = supabaseAdmin();
  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    if (error) return null;
    return data?.user?.id ?? null;
  } catch (err) {
    console.warn("verifyTenantPassword exception", err);
    return null;
  }
}

/**
 * Set or change a tenant user's password. Used by /app/account/security.
 * Caller MUST have already verified the user's identity (active session +
 * either current password OR fresh magic-link) before calling this.
 */
export async function setTenantPassword(
  email: string,
  newPassword: string,
): Promise<{ ok: true } | { error: string }> {
  if (newPassword.length < 12) return { error: "password_too_short" };
  if (newPassword.length > 200) return { error: "password_too_long" };

  const userId = await ensureAuthUser(email);
  const sb = supabaseAdmin();
  try {
    const { error } = await sb.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) {
      console.warn("setTenantPassword updateUserById error", error);
      return { error: "update_failed" };
    }
  } catch (err) {
    console.warn("setTenantPassword exception", err);
    return { error: "update_failed" };
  }

  // Stamp tenant_user_secrets.password_set_at — defensive read; the row
  // may not exist yet for first-time setters.
  try {
    const now = new Date().toISOString();
    await sb
      .from("tenant_user_secrets")
      .upsert(
        { email: email.toLowerCase().trim(), password_set_at: now },
        { onConflict: "email" },
      );
  } catch (err) {
    console.warn("password_set_at stamp failed (non-fatal)", err);
  }

  return { ok: true };
}

// ---- TOTP secret persistence ----

export type TenantUserSecret = {
  email: string;
  totp_secret: string | null;
  enrolled_at: string | null;
  last_login_at: string | null;
  recovery_codes_hashed: string[] | null;
  password_set_at: string | null;
};

export async function getTenantUserSecret(
  email: string,
): Promise<TenantUserSecret | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenant_user_secrets")
    .select(
      "email, totp_secret, enrolled_at, last_login_at, recovery_codes_hashed, password_set_at",
    )
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) {
    // Migration may not be applied yet. Return null so callers degrade.
    return null;
  }
  return (data as TenantUserSecret | null) ?? null;
}

export async function upsertTenantTotpSecret(
  email: string,
  totpSecret: string,
): Promise<void> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await sb
    .from("tenant_user_secrets")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        totp_secret: totpSecret,
        enrolled_at: now,
      },
      { onConflict: "email" },
    );
  if (error) throw error;
}

export async function clearTenantTotpSecret(email: string): Promise<void> {
  const sb = supabaseAdmin();
  await sb
    .from("tenant_user_secrets")
    .update({ totp_secret: null, enrolled_at: null })
    .eq("email", email.toLowerCase().trim());
}

export async function recordTenantLogin(email: string): Promise<void> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  await sb
    .from("tenant_user_secrets")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        last_login_at: now,
      },
      { onConflict: "email" },
    );
}

// ---- Recovery codes ----

function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.replace(/\s+/g, "").toLowerCase()).digest("hex");
}

/**
 * Generate 10 one-time recovery codes (8 hex chars each, presented as
 * groups of 4 like "a1b2-c3d4"). Stores their hashes; returns the
 * plaintext codes to display to the user ONCE.
 */
export async function regenerateRecoveryCodes(email: string): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const raw = randomBytes(4).toString("hex");
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
  }
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  await sb
    .from("tenant_user_secrets")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        recovery_codes_hashed: codes.map(hashRecoveryCode),
        recovery_codes_generated_at: now,
      },
      { onConflict: "email" },
    );
  return codes;
}

/**
 * Try to consume a recovery code. Returns true on success (code was valid +
 * has now been removed); false otherwise. Constant-time comparison via
 * SHA-256 hashing — the plaintext is never compared.
 */
export async function consumeRecoveryCode(
  email: string,
  code: string,
): Promise<boolean> {
  const secret = await getTenantUserSecret(email);
  const hashes = secret?.recovery_codes_hashed ?? [];
  if (hashes.length === 0) return false;
  const target = hashRecoveryCode(code);
  if (!hashes.includes(target)) return false;
  const remaining = hashes.filter((h) => h !== target);
  const sb = supabaseAdmin();
  await sb
    .from("tenant_user_secrets")
    .update({ recovery_codes_hashed: remaining })
    .eq("email", email.toLowerCase().trim());
  return true;
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
