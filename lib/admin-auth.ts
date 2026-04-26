import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const COOKIE_NAME = "gt_founders_session";
const SESSION_TTL_DAYS = 30;
const COOKIE_PATH = "/";

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function verifyPassword(plain: string): boolean {
  const expectedHex = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedHex) return false;
  const got = hashPassword(plain);
  if (got.length !== expectedHex.length) return false;
  try {
    return timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(expectedHex, "hex"));
  } catch {
    return false;
  }
}

export function verifyEmail(email: string): boolean {
  const expected = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  if (!expected) return false;
  return email.toLowerCase().trim() === expected;
}

/**
 * Cookie value format: `<expiresAtUnix>.<nonce>.<hmacHex>`
 * HMAC = SHA-256(secret, `${expiresAtUnix}|${nonce}|founder`)
 */
export function createSessionCookieValue(): string {
  const secret = envOrThrow("ADMIN_SESSION_SECRET");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiresAt}|${nonce}|founder`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${expiresAt}.${nonce}.${hmac}`;
}

export function verifySessionCookieValue(raw: string | undefined): boolean {
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, hmacHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${expStr}|${nonce}|founder`)
    .digest("hex");
  if (expected.length !== hmacHex.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hmacHex, "hex"));
  } catch {
    return false;
  }
}

export function buildSetCookieHeader(value: string, opts?: { clear?: boolean }): string {
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
