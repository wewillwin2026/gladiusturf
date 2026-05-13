import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sterling Lawn Co demo gate (2026-05-12).
 *
 * Mirrors the Bright Lights pattern (lib/bright-lights/auth.ts). One shared
 * passcode (LAWN24) unlocks the sales-demo workspace. After correct entry
 * we set a signed cookie that the workspace layout honors for 7 days.
 *
 * v1 intentionally simple: single shared passcode, no per-user accounts.
 * This is a sales-demo surface, not a real tenant.
 */

export const SL_COOKIE_NAME = "sterling_lawn_demo";
export const SL_PASSCODE = "LAWN24";
const SL_TTL_DAYS = 7;

function secret(): string {
  return (
    process.env.STERLING_LAWN_COOKIE_SECRET ||
    process.env.GLADIUS_TRACKING_SALT ||
    "sterling-lawn-demo-fallback-secret-keep-stable"
  );
}

export function isCorrectPasscode(input: string): boolean {
  const a = Buffer.from(SL_PASSCODE);
  const b = Buffer.from((input || "").trim().toUpperCase());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function issueToken(): string {
  const issued = Date.now();
  const exp = issued + SL_TTL_DAYS * 24 * 60 * 60 * 1000;
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

export const SL_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: SL_TTL_DAYS * 24 * 60 * 60,
};
