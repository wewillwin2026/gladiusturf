/**
 * In-memory token-bucket rate limiter for short-lived edge bursts.
 *
 * Engineering Director's P1: customer-facing Server Actions on
 * /quote/[id] currently have no replay/throttle. This module provides
 * a per-key bucket suitable for stamping IP-hashed keys against. The
 * bucket lives in process memory — Vercel Functions reuse instances
 * across concurrent requests under Fluid Compute, so a single hot
 * function instance covers most of the abuse surface; instances that
 * cold-start grant a fresh budget which is the same trade-off most
 * other in-memory rate-limit libraries make. Upgrade path: swap the
 * Map for Vercel KV if/when sustained protection is needed.
 *
 * Buckets self-evict on miss to keep memory bounded.
 */

export type RateLimitOptions = {
  /** Bucket capacity — burst size. */
  capacity: number;
  /** Refill rate in tokens per second. */
  refillPerSec: number;
};

type Bucket = {
  tokens: number;
  updatedAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5000;

export function consume(
  key: string,
  opts: RateLimitOptions = { capacity: 5, refillPerSec: 1 / 60 },
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  let bucket: Bucket;
  if (!existing) {
    bucket = { tokens: opts.capacity - 1, updatedAt: now };
  } else {
    const elapsedSec = (now - existing.updatedAt) / 1000;
    const refilled = Math.min(
      opts.capacity,
      existing.tokens + elapsedSec * opts.refillPerSec,
    );
    if (refilled >= 1) {
      bucket = { tokens: refilled - 1, updatedAt: now };
    } else {
      // No tokens — compute retry-after.
      const need = 1 - refilled;
      const retryAfterMs = Math.ceil((need / opts.refillPerSec) * 1000);
      // Keep the existing bucket; do not consume a fractional token.
      buckets.set(key, { tokens: refilled, updatedAt: now });
      return { allowed: false, remaining: 0, retryAfterMs };
    }
  }
  buckets.set(key, bucket);

  // Cap the map. When over the watermark, drop the oldest entries
  // (Map preserves insertion order).
  if (buckets.size > MAX_KEYS) {
    const drop = buckets.size - MAX_KEYS;
    let i = 0;
    for (const k of buckets.keys()) {
      buckets.delete(k);
      i += 1;
      if (i >= drop) break;
    }
  }

  return {
    allowed: true,
    remaining: Math.floor(bucket.tokens),
    retryAfterMs: 0,
  };
}

/**
 * Hash an IP-equivalent string into a stable bucket key. Trims to a
 * /24 for IPv4 and /48 for IPv6 to limit per-individual-IP memory and
 * align with privacy-preserving rate-limit norms.
 */
export function ipKey(ipLike: string | null | undefined): string {
  if (!ipLike) return "anon";
  const trimmed = ipLike.split(",")[0].trim();
  if (trimmed.includes(":")) {
    // IPv6 → first 3 groups (≈ /48).
    const parts = trimmed.split(":");
    return `v6:${parts.slice(0, 3).join(":")}`;
  }
  // IPv4 → first 3 octets (/24).
  const parts = trimmed.split(".");
  if (parts.length === 4) return `v4:${parts.slice(0, 3).join(".")}`;
  return `raw:${trimmed.slice(0, 64)}`;
}
