import { authenticator } from "otplib";

/**
 * TOTP wrapper for the tenant-side MFA upgrade. Mirrors lib/founders/totp.ts
 * exactly — same window, digits, and step — so authenticator apps that already
 * work for founders work identically for tenant users.
 */

authenticator.options = {
  window: 1, // ±30s drift tolerance
  digits: 6,
  step: 30,
};

export function generateTotpSecret(): string {
  return authenticator.generateSecret(20); // 20 bytes base32
}

export function tenantTotpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, "GladiusTurf", secret);
}

export function verifyTotpCode(secret: string, code: string): boolean {
  if (!secret || !code) return false;
  try {
    return authenticator.check(code.replace(/\s+/g, ""), secret);
  } catch {
    return false;
  }
}
