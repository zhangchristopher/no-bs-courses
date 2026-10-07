// Everything an outreach email is allowed to say about the product. Drafts may
// state only what is here, and send.ts refuses to run until `confirmed` is
// true. Every price is derived from lib/pricing.ts, the same source checkout
// and the terms page use, so an email can't quote a price the site doesn't
// charge.
import { OWNER_PRICING, FOUNDING_OFFER_OPEN, formatUsd, ownerPlanName, type PricingTier } from "../../lib/pricing";

if (!FOUNDING_OFFER_OPEN) {
  throw new Error("The founding offer is closed (lib/pricing.ts), so Founding Owner outreach no longer applies.");
}

const founding = OWNER_PRICING.founding;
const monthlyIntro = founding.monthly.intro!;
const annualIntro = founding.annual.intro!;

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

  // The free layer: what email 1 is actually about.
  free: [
    "Claiming your first course listing is free.",
    "Business verification is free, and earns the Verified Business badge.",
    "A free verified owner owns the listing and receives genuine reviews; they just don't get the listing-management tools.",
  ],

  // The optional paid layer. It manages a listing; it never buys credibility.
  paidPlan: {
    name: ownerPlanName("founding"),
    purpose: "Optional listing-management tools: editing the listing, claiming more courses, owner tools.",
    // The only pricing sentence in email 1. Detailed pricing lives on the
    // pricing and checkout pages.
    short:
      `${formatUsd(monthlyIntro.cents)}/month for the first ${monthlyIntro.periods} months ` +
      `(or ${formatUsd(annualIntro.cents)} upfront for the first year), with no setup fee and ` +
      `discounted founder pricing after that`,
  },

  // Said in every email.
  integrityNote: "Payment never affects reviews, scores, verification, or ranking.",

  // No deadlines. The founding offer ends when FOUNDING_OFFER_OPEN is switched
  // off, nothing sooner.
  deadline: null as string | null,

  allowedAmounts: allowedAmounts(),

  signature: { name: "Christopher Zhang", title: "Founder, No BS Courses" },
};
