import { randomBytes } from "node:crypto";

/**
 * 16-char base62 token used for /close/[token] URLs. The token IS the
 * auth — anyone with the URL can complete payment, so it must be:
 *   - cryptographically random (not Math.random)
 *   - long enough that brute-force is uneconomical (62^16 ≈ 4.7e28)
 *   - URL-safe (no `+` `/` `=` from base64)
 *
 * Per deal-row uniqueness is enforced by the unique constraint on
 * deals.token; on the astronomically-unlikely collision the caller
 * retries.
 */

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateDealToken(): string {
  const bytes = randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
