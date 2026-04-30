import { authenticator } from "otplib";

authenticator.options = {
  window: 1, // ±30s drift tolerance
  digits: 6,
  step: 30,
};

export function generateTotpSecret(): string {
  return authenticator.generateSecret(20); // 20 bytes base32
}

export function totpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, "GladiusTurf War Room", secret);
}

export function verifyTotpCode(secret: string, code: string): boolean {
  if (!secret || !code) return false;
  try {
    return authenticator.check(code.replace(/\s+/g, ""), secret);
  } catch {
    return false;
  }
}
