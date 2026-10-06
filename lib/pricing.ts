// Single source of truth for Registered Business pricing.
//
// Every user-facing price on the site (dashboard, checkout page, business
// page, claim-limit error, Terms, admin page) is built from these numbers,
// and `npm run stripe:setup-pricing` creates the matching Stripe prices and
// coupons from them. Checkout refuses to start if what's in Stripe doesn't
// match what's here, so the price a page shows and the price Stripe charges
// can't silently drift apart.
//
// To change pricing: edit this file, run the setup script against Stripe
// (test mode, then live), and deploy. Existing subscribers keep the Stripe
// price they signed up on — prices are immutable in Stripe — which is what
// keeps founding pricing locked in for as long as they stay subscribed.
//
// Safe to import from client components: amounts only, no Stripe calls.

export type PricingTier = "founding" | "standard";
export type BillingInterval = "monthly" | "annual";

// Everyone who subscribes while this is true is a founding owner. Flip it
// to false at launch: new owners then get standard pricing, and existing
// founding subscriptions are untouched.
export const FOUNDING_OFFER_OPEN = true;

type PlanPrice = {
  // What each billing period costs once any intro offer has ended.
  recurringCents: number;
  // Optional intro rate for an owner's first subscription.
  intro?: { cents: number; periods: number };
};

type TierPricing = {
  setupFeeCents: number;
  monthly: PlanPrice;
  annual: PlanPrice;
};

export const OWNER_PRICING: Record<PricingTier, TierPricing> = {
  founding: {
    setupFeeCents: 0,
    // $1/mo for the first 12 months, then $25/mo.
    monthly: { recurringCents: 2500, intro: { cents: 100, periods: 12 } },
    // $12 for the first year, then $240/yr ($20/mo equivalent).
    annual: { recurringCents: 24000, intro: { cents: 1200, periods: 1 } },
  },
  standard: {
    setupFeeCents: 5000,
    // $30/mo + $50 setup fee.
    monthly: { recurringCents: 3000 },
    // $300/yr ($25/mo equivalent) + $50 setup fee.
    annual: { recurringCents: 30000 },
  },
};

export const BILLING_INTERVALS: BillingInterval[] = ["monthly", "annual"];

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "annual";
}

export function currentOwnerTier(): PricingTier {
  return FOUNDING_OFFER_OPEN ? "founding" : "standard";
}

// $1, $25, $240 — whole dollars without ".00"; cents only when needed.
export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

const UNIT: Record<BillingInterval, string> = { monthly: "/mo", annual: "/yr" };

export const INTERVAL_LABEL: Record<BillingInterval, string> = {
  monthly: "Monthly",
  annual: "Annual",
};

function introPhrase(interval: BillingInterval, intro: { cents: number; periods: number }): string {
  if (interval === "monthly") {
    return intro.periods === 1
      ? `${formatUsd(intro.cents)} for the first month`
      : `${formatUsd(intro.cents)}/mo for ${intro.periods} months`;
  }
  return intro.periods === 1
    ? `${formatUsd(intro.cents)} for the first year`
    : `${formatUsd(intro.cents)}/yr for the first ${intro.periods} years`;
}

// The one-line price shown on the dashboard and checkout page, e.g.
//   founding monthly: "$1/mo for 12 months, then $25/mo"
//   founding annual:  "$12 for the first year, then $240/yr"
//   standard monthly: "$30/mo + $50 setup fee"
// An owner who has subscribed before doesn't get the intro rate again, so
// pass introEligible: false to show what they'd actually pay.
export function planSummary(
  tier: PricingTier,
  interval: BillingInterval,
  { introEligible = true }: { introEligible?: boolean } = {}
): string {
  const plan = OWNER_PRICING[tier][interval];
  const recurring = `${formatUsd(plan.recurringCents)}${UNIT[interval]}`;
  const price =
    plan.intro && introEligible ? `${introPhrase(interval, plan.intro)}, then ${recurring}` : recurring;
  const setupFee = OWNER_PRICING[tier].setupFeeCents;
  return setupFee > 0 ? `${price} + ${formatUsd(setupFee)} setup fee` : price;
}

// "$20/mo equivalent" for an annual plan.
export function annualMonthlyEquivalent(tier: PricingTier): string {
  return `${formatUsd(Math.round(OWNER_PRICING[tier].annual.recurringCents / 12))}/mo`;
}

// How much annual billing saves per month versus monthly, once intro
// pricing has ended — "$5/mo" for both tiers.
export function annualMonthlySavings(tier: PricingTier): string {
  const { monthly, annual } = OWNER_PRICING[tier];
  return `${formatUsd(monthly.recurringCents - Math.round(annual.recurringCents / 12))}/mo`;
}

// The annual plan's value note, e.g. "$20/mo equivalent after the first
// year — saves $5/mo vs. monthly". During an intro offer both plans cost
// the same in year one, so the saving is stated from when it applies.
export function annualValueNote(
  tier: PricingTier,
  { introEligible = true }: { introEligible?: boolean } = {}
): string {
  const hasIntro = Boolean(OWNER_PRICING[tier].annual.intro) && introEligible;
  return `${annualMonthlyEquivalent(tier)} equivalent${hasIntro ? " after the first year" : ""} — saves ${annualMonthlySavings(tier)} vs. monthly`;
}

// Both plans in one sentence, for places that only have room for a
// mention (business page, claim-limit error): e.g.
// "$1/mo for 12 months, then $25/mo, or $12 for the first year, then $240/yr".
export function pricingSentence(tier: PricingTier = currentOwnerTier()): string {
  return `${planSummary(tier, "monthly")}, or ${planSummary(tier, "annual")}`;
}
