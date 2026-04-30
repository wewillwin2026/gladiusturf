import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * War Room auth — replaces the legacy shared-creds HMAC cookie.
 *
 * Flow:
 *  1. POST /api/founders/magic { email } → if email ∈ founders, send Resend
 *     magic link with a signed token to /founders/verify?token=…
 *  2. /founders/verify → token verified → if no TOTP yet, redirect to /enroll;
 *     else prompt for 6-digit TOTP code.
 *  3. On TOTP success → set `gladius_founder_session` cookie (HttpOnly, Secure,
 *     SameSite=Lax, 7-day TTL) → redirect to /founders/war-room.
 *
 * Storage: a `founder_secrets` row per allowed email holds the TOTP secret
 *   (created on first enrollment) and a `last_login_at` timestamp.
 *
 * We do NOT use Supabase Auth's session machinery directly because we want a
 * single self-contained cookie + the mandatory TOTP gate. We use the service
 * role to read/write `founder_secrets`.
 */

export const FOUNDER_COOKIE_NAME = "gladius_founder_session";
const SESSION_TTL_DAYS = 7;
const MAGIC_TOKEN_TTL_SECONDS = 15 * 60; // 15 min

const HARDCODED_FALLBACK_FOUNDERS = [
  "ricardo.gamon99@icloud.com",
  "joshuapyorke@gmail.com",
];

export function founderEmails(): string[] {
  const env = (process.env.GLADIUS_FOUNDER_EMAILS || "").trim();
  if (!env) return HARDCODED_FALLBACK_FOUNDERS.map((e) => e.toLowerCase());
  return env
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isFounderEmail(email: string): boolean {
  return founderEmails().includes(email.toLowerCase().trim());
}

function sessionSecret(): string {
  return (
    process.env.FOUNDER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "gladius-founder-fallback-secret-not-for-prod-rotate-me"
  );
}

// ---- magic link tokens ----

export function createMagicToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAGIC_TOKEN_TTL_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${exp}|${nonce}|${email.toLowerCase().trim()}|magic`;
  const hmac = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${exp}.${nonce}.${Buffer.from(email.toLowerCase().trim()).toString("hex")}.${hmac}`;
}

export function verifyMagicToken(
  raw: string | undefined,
): { email: string } | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [expStr, nonce, emailHex, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  let email: string;
  try {
    email = Buffer.from(emailHex, "hex").toString("utf8");
  } catch {
    return null;
  }
  if (!isFounderEmail(email)) return null;
  const expected = createHmac("sha256", sessionSecret())
    .update(`${exp}|${nonce}|${email}|magic`)
    .digest("hex");
  if (expected.length !== hmacHex.length) return null;
  try {
    if (
      !timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hmacHex, "hex"))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return { email };
}

// ---- session cookie ----

export function createFounderSessionCookieValue(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${exp}|${nonce}|${email.toLowerCase().trim()}|founder`;
  const hmac = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${exp}.${nonce}.${Buffer.from(email.toLowerCase().trim()).toString("hex")}.${hmac}`;
}

export function verifyFounderSessionCookieValue(
  raw: string | undefined,
): { email: string } | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [expStr, nonce, emailHex, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  let email: string;
  try {
    email = Buffer.from(emailHex, "hex").toString("utf8");
  } catch {
    return null;
  }
  if (!isFounderEmail(email)) return null;
  const expected = createHmac("sha256", sessionSecret())
    .update(`${exp}|${nonce}|${email}|founder`)
    .digest("hex");
  if (expected.length !== hmacHex.length) return null;
  try {
    if (
      !timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hmacHex, "hex"))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return { email };
}

export function buildFounderSetCookieHeader(
  value: string,
  opts?: { clear?: boolean },
): string {
  const parts = [
    `${FOUNDER_COOKIE_NAME}=${opts?.clear ? "" : value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ];
  if (opts?.clear) parts.push("Max-Age=0");
  else parts.push(`Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`);
  return parts.join("; ");
}

// ---- TOTP secret persistence ----

export type FounderSecret = {
  email: string;
  totp_secret: string | null;
  enrolled_at: string | null;
  last_login_at: string | null;
};

export async function getFounderSecret(email: string): Promise<FounderSecret | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("founder_secrets")
    .select("email, totp_secret, enrolled_at, last_login_at")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) {
    console.warn("getFounderSecret error", error);
    return null;
  }
  return (data as FounderSecret | null) ?? null;
}

export async function upsertFounderTotpSecret(
  email: string,
  totpSecret: string,
): Promise<void> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await sb
    .from("founder_secrets")
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

export async function recordFounderLogin(email: string): Promise<void> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  await sb
    .from("founder_secrets")
    .update({ last_login_at: now })
    .eq("email", email.toLowerCase().trim());
}
