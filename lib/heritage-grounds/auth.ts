import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Heritage Grounds demo gate (2026-05-13).
 * Mirrors lib/sterling-lawn/auth.ts — see that file for the canonical
 * pattern. Passcode LAND26.
 */

export const HG_COOKIE_NAME = "heritage_grounds_demo";
export const HG_PASSCODE = "LAND26";
const HG_TTL_DAYS = 7;

function secret(): string {
  return (
    process.env.HERITAGE_GROUNDS_COOKIE_SECRET ||
    process.env.GLADIUS_TRACKING_SALT ||
    "heritage-grounds-demo-fallback-secret-keep-stable"
  );
}

export function isCorrectPasscode(input: string): boolean {
  const a = Buffer.from(HG_PASSCODE);
  const b = Buffer.from((input || "").trim().toUpperCase());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function issueToken(): string {
  const issued = Date.now();
  const exp = issued + HG_TTL_DAYS * 24 * 60 * 60 * 1000;
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

export const HG_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: HG_TTL_DAYS * 24 * 60 * 60,
};
