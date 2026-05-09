import { getStripe } from "./server";

/**
 * Find-or-create the canonical "GladiusTurf Subscription" Stripe Product
 * and the per-tier ad-hoc Price for each deal. A single Product holds all
 * tier Prices in Stripe's data model — that's the recommended Stripe
 * pattern. Prices are immutable; per-deal custom pricing creates a fresh
 * Price each time (which is cheap on Stripe's side — no fee for Prices).
 *
 * The first deal created on a fresh Stripe account auto-bootstraps the
 * Product. Subsequent deals reuse it via metadata.gladiusturf_canonical=true.
 */

const PRODUCT_NAME = "GladiusTurf Subscription";
const PRODUCT_TAG = "gladiusturf_canonical";

let cachedProductId: string | null = null;

export async function findOrCreateCanonicalProduct(): Promise<string> {
  if (cachedProductId) return cachedProductId;
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY not set");

  // Search for an existing canonical product. Stripe's search API works
  // here; if the org's Stripe doesn't have search enabled (some legacy
  // accounts), fall through to listProducts and filter client-side.
  try {
    const search = await stripe.products.search({
      query: `metadata['${PRODUCT_TAG}']:'true'`,
      limit: 1,
    });
    if (search.data.length > 0) {
      cachedProductId = search.data[0].id;
      return cachedProductId;
    }
  } catch {
    // Some accounts don't have search; fall through.
  }

  // Fallback list scan.
  try {
    const list = await stripe.products.list({ limit: 100, active: true });
    const found = list.data.find(
      (p) => p.metadata?.[PRODUCT_TAG] === "true",
    );
    if (found) {
      cachedProductId = found.id;
      return cachedProductId;
    }
  } catch {
    /* fall through to create */
  }

  const created = await stripe.products.create({
    name: PRODUCT_NAME,
    description: "GladiusTurf operator subscription. Per-crew, monthly.",
    metadata: { [PRODUCT_TAG]: "true" },
  });
  cachedProductId = created.id;
  return cachedProductId;
}

/**
 * Create an ad-hoc monthly Price for the deal. Returns the Stripe Price
 * id which is then attached to the Subscription items. Custom prices
 * are how we grandfather Bright Lights at $397, ship pilot pricing for
 * the first 5 in each market, etc.
 */
export async function createDealPrice(args: {
  unitAmountCents: number;
  tier: "starter" | "growth" | "enterprise";
  dealId: string;
}): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY not set");
  if (args.unitAmountCents < 0 || args.unitAmountCents > 1_000_000) {
    throw new Error("unitAmountCents out of bounds");
  }
  const productId = await findOrCreateCanonicalProduct();
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: args.unitAmountCents,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: {
      tier: args.tier,
      deal_id: args.dealId,
    },
  });
  return price.id;
}

/**
 * BDC addon — fixed $499/mo. Reuses the same canonical product so it
 * shows on the same Stripe invoice as the base subscription line.
 */
const BDC_ADDON_CENTS = 49900;

export async function createBdcAddonPrice(dealId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY not set");
  const productId = await findOrCreateCanonicalProduct();
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: BDC_ADDON_CENTS,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { tier: "addon_bdc", deal_id: dealId },
  });
  return price.id;
}
