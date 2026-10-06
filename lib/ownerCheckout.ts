import type Stripe from "stripe";
import stripe from "@/lib/stripe";
import type { BillingInterval, PricingTier } from "@/lib/pricing";
import {
  CURRENCY,
  introCoupon,
  setupFeePrice,
  subscriptionPrice,
  type ExpectedCoupon,
  type ExpectedPrice,
} from "@/lib/stripeCatalog";

// Thrown when Stripe doesn't hold what lib/pricing.ts says it should —
// usually because `npm run stripe:setup-pricing` hasn't been run against
// this Stripe account/mode yet. The message is for logs and admins, not
// shown to owners.
export class PricingConfigError extends Error {}

function checkPrice(found: Stripe.Price | undefined, expected: ExpectedPrice): Stripe.Price {
  if (!found) {
    throw new PricingConfigError(
      `No active Stripe price with lookup key "${expected.lookupKey}". Run npm run stripe:setup-pricing.`
    );
  }
  const interval = found.recurring?.interval ?? null;
  const intervalCount = found.recurring?.interval_count ?? null;
  const ok =
    found.unit_amount === expected.unitAmountCents &&
    found.currency === CURRENCY &&
    interval === expected.recurringInterval &&
    (expected.recurringInterval === null || intervalCount === 1);
  if (!ok) {
    throw new PricingConfigError(
      `Stripe price "${expected.lookupKey}" (${found.id}) doesn't match lib/pricing.ts: ` +
        `expected ${expected.unitAmountCents} ${CURRENCY} per ${expected.recurringInterval ?? "one-time"}, ` +
        `found ${found.unit_amount} ${found.currency} per ${interval ?? "one-time"}. Run npm run stripe:setup-pricing.`
    );
  }
  return found;
}

async function checkCoupon(expected: ExpectedCoupon): Promise<void> {
  let coupon: Stripe.Coupon;
  try {
    coupon = await stripe.coupons.retrieve(expected.id);
  } catch {
    throw new PricingConfigError(
      `Stripe coupon "${expected.id}" doesn't exist. Run npm run stripe:setup-pricing.`
    );
  }
  const ok =
    coupon.valid &&
    coupon.amount_off === expected.amountOffCents &&
    coupon.currency === CURRENCY &&
    coupon.duration === expected.duration &&
    (coupon.duration_in_months ?? null) === expected.durationInMonths;
  if (!ok) {
    throw new PricingConfigError(
      `Stripe coupon "${expected.id}" isn't valid or doesn't match lib/pricing.ts. Run npm run stripe:setup-pricing.`
    );
  }
}

// Line items and discounts for a Registered Business Checkout Session,
// checked against lib/pricing.ts before anything is charged.
export async function buildOwnerCheckoutItems(
  tier: PricingTier,
  interval: BillingInterval,
  { introEligible }: { introEligible: boolean }
): Promise<{
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
  discounts: Stripe.Checkout.SessionCreateParams.Discount[];
}> {
  const subscription = subscriptionPrice(tier, interval);
  const setupFee = setupFeePrice(tier);
  const lookupKeys = [subscription.lookupKey, ...(setupFee ? [setupFee.lookupKey] : [])];

  const { data } = await stripe.prices.list({ lookup_keys: lookupKeys, active: true, limit: 10 });
  const byKey = new Map(data.map((p) => [p.lookup_key, p]));

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: checkPrice(byKey.get(subscription.lookupKey), subscription).id, quantity: 1 },
  ];
  if (setupFee) {
    line_items.push({ price: checkPrice(byKey.get(setupFee.lookupKey), setupFee).id, quantity: 1 });
  }

  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
  const coupon = introEligible ? introCoupon(tier, interval) : null;
  if (coupon) {
    await checkCoupon(coupon);
    discounts.push({ coupon: coupon.id });
  }

  return { line_items, discounts };
}
