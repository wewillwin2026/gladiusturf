import { createHmac } from "node:crypto";

/**
 * SMS OTP for the founders portal second factor.
 *
 * Stateless HMAC approach — no DB write needed.
 * Code = first 6 decimal digits of HMAC(secret, `${email}|sms-otp|${window}`)
 * where window = Math.floor(Date.now() / 600_000) (10-minute intervals).
 *
 * We accept the current window AND the previous window so a code received
 * just before a window boundary is still valid (~20-min total).
 *
 * Phone numbers live in env:
 *   GLADIUS_FOUNDER_PHONES=email1:+1NXX...,email2:+1NXX...
 */

const WINDOW_MS = 10 * 60 * 1000;

function sessionSecret(): string {
  return (
    process.env.FOUNDER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "gladius-founder-fallback-secret-not-for-prod-rotate-me"
  );
}

function currentWindow(): number {
  return Math.floor(Date.now() / WINDOW_MS);
}

function makeCode(email: string, window: number): string {
  const raw = createHmac("sha256", sessionSecret())
    .update(`${email.toLowerCase().trim()}|sms-otp|${window}`)
    .digest("hex");
  // First 6 decimal digits extracted from the hex output.
  const decimal = BigInt(`0x${raw.slice(0, 12)}`).toString();
  return decimal.slice(-6).padStart(6, "0");
}

export function generateSmsOtp(email: string): string {
  return makeCode(email, currentWindow());
}

export function verifySmsOtp(email: string, code: string): boolean {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return false;
  const w = currentWindow();
  // Accept current and previous window.
  return makeCode(email, w) === clean || makeCode(email, w - 1) === clean;
}

/** Parse GLADIUS_FOUNDER_PHONES env into a map of lowercased email → E.164 phone. */
export function founderPhoneMap(): Map<string, string> {
  const env = (process.env.GLADIUS_FOUNDER_PHONES || "").trim();
  const map = new Map<string, string>();
  if (!env) return map;
  for (const pair of env.split(",")) {
    const idx = pair.indexOf(":");
    if (idx < 1) continue;
    const email = pair.slice(0, idx).trim().toLowerCase();
    const phone = pair.slice(idx + 1).trim();
    if (email && phone) map.set(email, phone);
  }
  return map;
}

export function founderPhone(email: string): string | null {
  return founderPhoneMap().get(email.toLowerCase().trim()) ?? null;
}

/** Mask a phone number for display: +17867746087 → +1786•••6087 */
export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 4)}•••${phone.slice(-4)}`;
}

/**
 * Send the OTP via Twilio.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 * Falls back gracefully if TWILIO_* env vars are not set.
 */
export async function sendSmsOtp(
  to: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    return { ok: false, error: "twilio_not_configured" };
  }

  const body = `GladiusTurf War Room code: ${code}. Valid 10 min. Don't share this.`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const params = new URLSearchParams({ To: to, From: from, Body: body });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `twilio_${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "twilio_unknown",
    };
  }
}
