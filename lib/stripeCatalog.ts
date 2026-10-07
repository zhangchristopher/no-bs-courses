import {
  BILLING_INTERVALS,
  OWNER_PRICING,
  ownerPlanName,
  type BillingInterval,
  type PricingTier,
} from "@/lib/pricing";

// The Stripe objects that lib/pricing.ts implies, derived from it so the
// two can't disagree. Shared by scripts/setupStripePricing.ts (which
// creates them) and lib/ownerCheckout.ts (which looks them up and checks
// them before every checkout). No Stripe client here, so the setup script
// can import it before its own Stripe client is configured.
//
// How the founding intro works in Stripe: the subscription is on the
// post-intro price (e.g. $25/mo or $240/yr) with a coupon taking the difference
// off for the intro period (e.g. $24 off for 12 months; $228 off the first
// year). Checkout then shows the real recurring rate alongside today's
// charge, and when the coupon ends the subscription simply keeps the
// price it's on — that's the "locked in" founding rate.

export const STRIPE_PRODUCTS = {
  subscription: {
    id: "nobs_registered_business",
    // Follows the offer flag: "Founding Owner" while it's open, "Owner Plan"
    // after. scripts/setupStripePricing.ts renames the product to match.
    name: ownerPlanName(),
    description: "Listing editing, unlimited course claims, and review replies. Verification and badges are free and not part of this plan.",
  },
  setupFee: {
    id: "nobs_registered_business_setup_fee",
    name: `${ownerPlanName()} setup fee`,
    description: "One-time setup fee for standard (post-launch) Owner Plan subscriptions.",
  },
} as const;

export type ExpectedPrice = {
  lookupKey: string;
  productId: string;
  unitAmountCents: number;
  // null for a one-time price.
  recurringInterval: "month" | "year" | null;
  nickname: string;
};

export type ExpectedCoupon = {
  id: string;
  name: string;
  amountOffCents: number;
  duration: "once" | "repeating";
  durationInMonths: number | null;
};

export const CURRENCY = "usd";

const STRIPE_INTERVAL: Record<BillingInterval, "month" | "year"> = {
  monthly: "month",
  annual: "year",
};

export function subscriptionPrice(tier: PricingTier, interval: BillingInterval): ExpectedPrice {
  return {
    lookupKey: `registered_business_${tier}_${interval}`,
    productId: STRIPE_PRODUCTS.subscription.id,
    unitAmountCents: OWNER_PRICING[tier][interval].recurringCents,
    recurringInterval: STRIPE_INTERVAL[interval],
    nickname: `${ownerPlanName(tier)} — ${interval}`,
  };
}

// Only standard tiers charge a setup fee; null when the tier has none.
export function setupFeePrice(tier: PricingTier): ExpectedPrice | null {
  const cents = OWNER_PRICING[tier].setupFeeCents;
  if (cents <= 0) return null;
  return {
    lookupKey: `registered_business_setup_fee_${tier}`,
    productId: STRIPE_PRODUCTS.setupFee.id,
    unitAmountCents: cents,
    recurringInterval: null,
    nickname: `${ownerPlanName(tier)} setup fee`,
  };
}

// The intro discount for a plan, or null if the plan has no intro rate.
// The coupon ID encodes the amounts, so changing the intro pricing in
// lib/pricing.ts produces a new coupon instead of silently reusing an old
// one (a coupon's amount can't be edited in Stripe).
export function introCoupon(tier: PricingTier, interval: BillingInterval): ExpectedCoupon | null {
  const plan = OWNER_PRICING[tier][interval];
  if (!plan.intro) return null;
  const amountOffCents = plan.recurringCents - plan.intro.cents;
  const months = interval === "monthly" ? plan.intro.periods : plan.intro.periods * 12;
  // An annual plan with a one-year intro discounts exactly one invoice.
  const once = interval === "annual" && plan.intro.periods === 1;
  return {
    id: `rb_${tier}_${interval}_intro_${amountOffCents}off_${once ? "once" : `${months}m`}`,
    name: `${tier === "founding" ? "Founding" : "Intro"} ${interval} intro`,
    amountOffCents,
    duration: once ? "once" : "repeating",
    durationInMonths: once ? null : months,
  };
}

// Everything that must exist in Stripe for the current pricing.
export function allExpectedPrices(): ExpectedPrice[] {
  const tiers: PricingTier[] = ["founding", "standard"];
  return tiers.flatMap((tier) => [
    ...BILLING_INTERVALS.map((interval) => subscriptionPrice(tier, interval)),
    ...(setupFeePrice(tier) ? [setupFeePrice(tier)!] : []),
  ]);
}

export function allExpectedCoupons(): ExpectedCoupon[] {
  const tiers: PricingTier[] = ["founding", "standard"];
  return tiers.flatMap((tier) =>
    BILLING_INTERVALS.map((interval) => introCoupon(tier, interval)).filter(
      (c): c is ExpectedCoupon => c !== null
    )
  );
}
