import Stripe from "stripe";

/**
 * Single canonical Stripe SDK instance. Lazy-initialized so a module
 * import doesn't throw if STRIPE_SECRET_KEY is unset (e.g. during
 * dev / preview deploys without the env wired). Callers must check
 * `getStripe()` and surface a friendly error if the result is null.
 *
 * apiVersion pinned. Do not bump without checking the migration guide
 * — Stripe occasionally renames fields between versions.
 */

let cachedClient: Stripe | null = null;
let cachedKey: string | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (cachedClient && cachedKey === key) return cachedClient;
  cachedClient = new Stripe(key, {
    apiVersion: "2024-06-20",
    typescript: true,
  });
  cachedKey = key;
  return cachedClient;
}

export function getStripePublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY || null;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET || null;
}

/**
 * Returns the live/test mode based on the secret key prefix. `sk_live_*`
 * keys mean real money. UI surfaces use this to render a "TEST MODE"
 * pill so we never confuse one for the other in the war-room.
 */
export function getStripeMode(): "live" | "test" | "unset" {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return "unset";
  if (key.startsWith("sk_live_")) return "live";
  return "test";
}
