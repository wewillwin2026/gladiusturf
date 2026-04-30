import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Auth for the prospect-facing demo CRM at `/app`.
 *
 * Completely separate from /founders/** which uses Supabase Auth + TOTP for the
 * War Room. Hardcoded creds — admin@gladiuscrm.com / test123 — are intentionally
 * weak/shareable so any prospect on a sales call can log in.
 *
 * Migrated from lib/preview-auth.ts (cookie renamed gt_preview_session →
 * gladius_demo_session). The old cookie is still honored for a 24h grace period
 * so morning smoke-test sessions don't break.
 */

const COOKIE_NAME = "gladius_demo_session";
const LEGACY_COOKIE_NAME = "gt_preview_session";
const SESSION_TTL_DAYS = 14;
const COOKIE_PATH = "/";

export const APP_COOKIE_NAME = COOKIE_NAME;
export const LEGACY_APP_COOKIE_NAME = LEGACY_COOKIE_NAME;

// Hardcoded demo credentials — never read from env. Intentional per spec:
// `/app/login` shows a tooltip with these exact creds so prospects can self-serve.
export const DEMO_EMAIL = "admin@gladiuscrm.com";
export const DEMO_PASSWORD = "test123";

const SECRET_FALLBACK =
  "gladius-demo-not-secret-but-still-signed-c0c3c2c6639ff0ca1e5ede8923fbbdab01c616957dbe3eb6de5bb6f3423efd18";

function secret(): string {
  // Reuse PREVIEW_SESSION_SECRET if set (so existing prod cookies stay valid
  // during the migration). Else fall back to a hardcoded constant — these are
  // demo creds anyway, the cookie just needs to be tamper-evident.
  return (
    process.env.APP_SESSION_SECRET ||
    process.env.PREVIEW_SESSION_SECRET ||
    SECRET_FALLBACK
  );
}

export function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function verifyAppPassword(plain: string): boolean {
  return plain === DEMO_PASSWORD;
}

export function verifyAppEmail(email: string): boolean {
  return email.toLowerCase().trim() === DEMO_EMAIL;
}

export function createAppSessionCookieValue(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiresAt}|${nonce}|app`;
  const hmac = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${expiresAt}.${nonce}.${hmac}`;
}

export function verifyAppSessionCookieValue(raw: string | undefined): boolean {
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false;

  // Try both new label "app" and legacy "preview" so old cookies stay valid.
  for (const label of ["app", "preview"] as const) {
    const expected = createHmac("sha256", secret())
      .update(`${expStr}|${nonce}|${label}`)
      .digest("hex");
    if (expected.length !== hmacHex.length) continue;
    try {
      if (timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hmacHex, "hex"))) {
        return true;
      }
    } catch {
      // continue
    }
  }
  return false;
}

export function buildAppSetCookieHeader(
  value: string,
  opts?: { clear?: boolean },
): string {
  const parts = [
    `${COOKIE_NAME}=${opts?.clear ? "" : value}`,
    `Path=${COOKIE_PATH}`,
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ];
  if (opts?.clear) {
    parts.push("Max-Age=0");
  } else {
    parts.push(`Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`);
  }
  return parts.join("; ");
}

/**
 * One-shot helper: clear the legacy /preview cookie alongside any current cookie
 * so users coming from a stale /preview session don't double-cookie.
 */
export function buildLegacyClearHeader(): string {
  return [
    `${LEGACY_COOKIE_NAME}=`,
    `Path=${COOKIE_PATH}`,
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    "Max-Age=0",
  ].join("; ");
}
