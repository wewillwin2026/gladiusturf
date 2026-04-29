import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Auth for the prospect-facing product demo at `/preview`.
 *
 * Completely separate from `lib/admin-auth.ts` (which gates the founders' War
 * Room at /founders). Different cookie name, different env vars, weaker creds
 * because these are sales-demo creds we share with prospects.
 */

const COOKIE_NAME = "gt_preview_session";
const SESSION_TTL_DAYS = 14;
const COOKIE_PATH = "/";

export const PREVIEW_COOKIE_NAME = COOKIE_NAME;

function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function verifyPreviewPassword(plain: string): boolean {
  const expectedHex = process.env.PREVIEW_PASSWORD_HASH;
  if (!expectedHex) return false;
  const got = hashPassword(plain);
  if (got.length !== expectedHex.length) return false;
  try {
    return timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(expectedHex, "hex"));
  } catch {
    return false;
  }
}

export function verifyPreviewEmail(email: string): boolean {
  const expected = (process.env.PREVIEW_EMAIL || "").toLowerCase().trim();
  if (!expected) return false;
  return email.toLowerCase().trim() === expected;
}

export function createPreviewSessionCookieValue(): string {
  const secret = envOrThrow("PREVIEW_SESSION_SECRET");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiresAt}|${nonce}|preview`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${expiresAt}.${nonce}.${hmac}`;
}

export function verifyPreviewSessionCookieValue(raw: string | undefined): boolean {
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false;

  const secret = process.env.PREVIEW_SESSION_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${expStr}|${nonce}|preview`)
    .digest("hex");
  if (expected.length !== hmacHex.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hmacHex, "hex"));
  } catch {
    return false;
  }
}

export function buildPreviewSetCookieHeader(value: string, opts?: { clear?: boolean }): string {
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
