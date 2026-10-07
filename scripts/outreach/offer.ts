// Everything an outreach email is allowed to say about the product. Drafts may
// state only what is here, and send.ts refuses to run until `confirmed` is
// true. Every price is derived from lib/pricing.ts, the same source checkout
// and the terms page use, so an email can't quote a price the site doesn't
// charge.
import { OWNER_PRICING, FOUNDING_OFFER_OPEN, planSummary, formatUsd, type PricingTier } from "../../lib/pricing";

if (!FOUNDING_OFFER_OPEN) {
  throw new Error("The founding offer is closed (lib/pricing.ts), so founding-owner outreach no longer applies.");
}

// Every dollar amount an email may contain: each price in either tier, plus
// the per-month equivalent of the annual plan.
function allowedAmounts(): Set<string> {
  const out = new Set<string>();
  for (const tier of Object.keys(OWNER_PRICING) as PricingTier[]) {
    const t = OWNER_PRICING[tier];
    if (t.setupFeeCents > 0) out.add(formatUsd(t.setupFeeCents));
    for (const plan of [t.monthly, t.annual]) {
      out.add(formatUsd(plan.recurringCents));
      if (plan.intro) out.add(formatUsd(plan.intro.cents));
    }
    out.add(formatUsd(Math.round(t.annual.recurringCents / 12)));
  }
  return out;
}

export const OFFER = {
  // Flip only after a human has read the pilot drafts. Separately, every
  // recipient needs its own approval (npm run outreach:approve).
  confirmed: false,

  // The first email is about claiming a listing. The paid plan is secondary.
  free: [
    "Claiming an existing listing is free.",
    "Business verification is free, and earns the Registered Business badge.",
    "A free verified owner owns the listing and receives genuine reviews; they just don't get the listing-management tools.",
  ],

  // The optional paid layer. It manages a listing; it never buys credibility.
  paidPlan: {
    purpose: "Optional tools for managing the listing yourself, such as editing its details and claiming more courses.",
    founding: {
      monthly: planSummary("founding", "monthly"),
      annual: planSummary("founding", "annual"),
      setupFee: "no setup fee",
      locked: "the founding rate stays for as long as the subscription stays active",
    },
    standard: {
      monthly: planSummary("standard", "monthly"),
      annual: planSummary("standard", "annual"),
    },
  },

  // Said in every email.
  integrityNote: "Payment never changes your reviews, score, or ranking. Those come only from learners.",

  // Arbitrary pre-launch deadlines are not allowed. The founding offer ends
  // when FOUNDING_OFFER_OPEN is switched off, nothing sooner.
  deadline: null as string | null,

  allowedAmounts: allowedAmounts(),

  signature: { name: "Christopher Zhang", title: "Founder, No BS Courses" },
};
