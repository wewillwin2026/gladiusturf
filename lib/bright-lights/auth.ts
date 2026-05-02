import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Bright Lights demo gate.
 *
 * One passcode (2598) unlocks the workspace. After correct entry, we set a
 * signed cookie that the middleware honors for 7 days. v1 is intentionally
 * simple — single shared passcode, no per-user accounts. Real auth lands in
 * the post-Sunday "convert demo to real workspace" flow.
 */

export const BL_COOKIE_NAME = "bright_lights_demo";
export const BL_PASSCODE = "2598";
const BL_TTL_DAYS = 7;

function secret(): string {
  return (
    process.env.BRIGHT_LIGHTS_COOKIE_SECRET ||
    process.env.GLADIUS_TRACKING_SALT ||
    "bright-lights-demo-fallback-secret-keep-stable"
  );
}

export function isCorrectPasscode(input: string): boolean {
  const a = Buffer.from(BL_PASSCODE);
  const b = Buffer.from((input || "").trim());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/**
 * Token format: <issued>.<exp>.<sig> where sig = HMAC(issued|exp).
 */
export function issueToken(): string {
  const issued = Date.now();
  const exp = issued + BL_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${issued}|${exp}`;
  return `${issued}.${exp}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedStr, expStr, sig] = parts;
  if (!issuedStr || !expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  if (Date.now() > exp) return false;
  const expected = sign(`${issuedStr}|${expStr}`);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export const BL_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: BL_TTL_DAYS * 24 * 60 * 60,
};
