// Proves what each owner-plan checkout would charge today, using
// the same code path as the site (lib/ownerCheckout.ts) against Stripe's TEST
// mode. Creates an unpaid Checkout Session per plan, reads the amount Stripe
// says is due now, and expires the session. No payment is made and nothing is
// charged. Refuses to run with a live-mode key.
//
//   npm run stripe:verify-checkout
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local"), quiet: true });

async function main() {
  if (!/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY ?? "")) {
    console.error("Refusing to run: STRIPE_SECRET_KEY is not a test-mode key.");
    process.exitCode = 1;
    return;
  }
  // Imported after dotenv: lib/stripe.ts reads the key at import time.
  const { default: stripe } = await import("../lib/stripe");
  const { buildOwnerCheckoutItems } = await import("../lib/ownerCheckout");
  const { currentOwnerTier, OWNER_PRICING, planSummary } = await import("../lib/pricing");

  type Tier = "founding" | "standard";
  type Interval = "monthly" | "annual";
  const cases: { label: string; tier: Tier; interval: Interval; introEligible: boolean }[] = [
    { label: "founding monthly, first subscription", tier: "founding", interval: "monthly", introEligible: true },
    { label: "founding annual, first subscription", tier: "founding", interval: "annual", introEligible: true },
    { label: "founding monthly, returning owner (no intro)", tier: "founding", interval: "monthly", introEligible: false },
    { label: "founding annual, returning owner (no intro)", tier: "founding", interval: "annual", introEligible: false },
    { label: "standard monthly", tier: "standard", interval: "monthly", introEligible: true },
    { label: "standard annual", tier: "standard", interval: "annual", introEligible: true },
  ];

  console.log(`Tier offered to new signups right now: ${currentOwnerTier()}\n`);
  let failures = 0;
  for (const c of cases) {
    const plan = OWNER_PRICING[c.tier][c.interval];
    const expectedNow =
      (c.introEligible && plan.intro ? plan.intro.cents : plan.recurringCents) + OWNER_PRICING[c.tier].setupFeeCents;

    const { line_items, discounts } = await buildOwnerCheckoutItems(c.tier, c.interval, { introEligible: c.introEligible });
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items,
      discounts,
      success_url: "https://www.nobscourses.com/owner/dashboard",
      cancel_url: "https://www.nobscourses.com/owner/dashboard",
    });
    const items = await stripe.checkout.sessions.listLineItems(session.id);
    const recurring = items.data.find((i) => i.price?.recurring);
    await stripe.checkout.sessions.expire(session.id);

    const ok = session.amount_total === expectedNow;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${c.label}\n` +
        `      due today: $${((session.amount_total ?? 0) / 100).toFixed(2)} (expected $${(expectedNow / 100).toFixed(2)})\n` +
        `      then: $${((recurring?.price?.unit_amount ?? 0) / 100).toFixed(2)} per ${recurring?.price?.recurring?.interval}\n` +
        `      site copy: ${planSummary(c.tier, c.interval, { introEligible: c.introEligible })}\n`
    );
  }
  if (failures) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
