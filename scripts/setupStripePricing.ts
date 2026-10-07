// Creates — or just checks — the Stripe products, prices and coupons that
// lib/pricing.ts describes (see lib/stripeCatalog.ts for how they map).
//
//   npm run stripe:setup-pricing              create anything missing
//   npm run stripe:setup-pricing -- --check   verify only; change nothing
//
// Reads STRIPE_SECRET_KEY from the environment, or from .env.local. Run it
// once with the test-mode key and once with the live-mode key: test and
// live are separate in Stripe. It never prints the key.
//
// Safe to re-run. Prices are found by lookup key and coupons by ID, so
// anything that already matches is reused. If a price in lib/pricing.ts
// changes, a new Stripe price is created and the lookup key moves to it;
// the old price stays in place, so existing subscribers keep paying what
// they signed up for.
import path from "node:path";
import dotenv from "dotenv";
import Stripe from "stripe";
import {
  CURRENCY,
  STRIPE_PRODUCTS,
  allExpectedCoupons,
  allExpectedPrices,
  type ExpectedPrice,
} from "../lib/stripeCatalog";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const CHECK_ONLY = process.argv.includes("--check");

function priceMatches(price: Stripe.Price, expected: ExpectedPrice): boolean {
  return (
    price.active &&
    price.product === expected.productId &&
    price.unit_amount === expected.unitAmountCents &&
    price.currency === CURRENCY &&
    (price.recurring?.interval ?? null) === expected.recurringInterval &&
    (expected.recurringInterval === null || price.recurring?.interval_count === 1)
  );
}

function isMissing(err: unknown): boolean {
  return err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing";
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY is not set (environment or .env.local).");
    process.exit(1);
  }
  const mode = /^(sk|rk)_live_/.test(key) ? "LIVE" : "test";
  const stripe = new Stripe(key);
  console.log(`Stripe mode: ${mode}${CHECK_ONLY ? " (check only — no changes)" : ""}\n`);

  let problems = 0;

  // Products: fixed IDs, so re-runs find them.
  for (const product of Object.values(STRIPE_PRODUCTS)) {
    try {
      const existing = await stripe.products.retrieve(product.id);
      if (!existing.active) {
        if (CHECK_ONLY) {
          console.log(`  ✗ product ${product.id} is archived`);
          problems++;
        } else {
          await stripe.products.update(product.id, { active: true });
          console.log(`  ↺ product ${product.id} re-activated`);
        }
      } else if (existing.name !== product.name || (existing.description ?? "") !== product.description) {
        // Customer-facing name/description follow the offer flag (see
        // lib/stripeCatalog.ts); Stripe lets these be edited in place.
        if (CHECK_ONLY) {
          console.log(`  ✗ product ${product.id} is named "${existing.name}", expected "${product.name}"`);
          problems++;
        } else {
          await stripe.products.update(product.id, { name: product.name, description: product.description });
          console.log(`  ↺ product ${product.id} renamed to "${product.name}"`);
        }
      } else {
        console.log(`  ✓ product ${product.id}`);
      }
    } catch (err) {
      if (!isMissing(err)) throw err;
      if (CHECK_ONLY) {
        console.log(`  ✗ product ${product.id} missing`);
        problems++;
      } else {
        await stripe.products.create({ id: product.id, name: product.name, description: product.description });
        console.log(`  + product ${product.id} created`);
      }
    }
  }

  // Prices: looked up by lookup key.
  console.log("");
  const expectedPrices = allExpectedPrices();
  const { data: found } = await stripe.prices.list({
    lookup_keys: expectedPrices.map((p) => p.lookupKey),
    limit: 100,
  });
  const byKey = new Map(found.map((p) => [p.lookup_key, p]));

  for (const expected of expectedPrices) {
    const label = `${expected.lookupKey} = ${(expected.unitAmountCents / 100).toFixed(2)} ${CURRENCY}${
      expected.recurringInterval ? `/${expected.recurringInterval}` : " one-time"
    }`;
    const existing = byKey.get(expected.lookupKey);
    if (existing && priceMatches(existing, expected)) {
      if ((existing.nickname ?? "") !== expected.nickname) {
        if (CHECK_ONLY) {
          console.log(`  ✗ ${label}  — nickname is "${existing.nickname}", expected "${expected.nickname}"`);
          problems++;
        } else {
          await stripe.prices.update(existing.id, { nickname: expected.nickname });
          console.log(`  ↺ ${label}  (${existing.id}) — nickname updated`);
        }
        continue;
      }
      console.log(`  ✓ ${label}  (${existing.id})`);
      continue;
    }
    const why = existing ? `doesn't match (${existing.id})` : "missing";
    const replaced = existing ? `replaces ${existing.id}, which didn't match` : "was missing";
    if (CHECK_ONLY) {
      console.log(`  ✗ ${label}  — ${why}`);
      problems++;
      continue;
    }
    const created = await stripe.prices.create({
      product: expected.productId,
      unit_amount: expected.unitAmountCents,
      currency: CURRENCY,
      ...(expected.recurringInterval ? { recurring: { interval: expected.recurringInterval } } : {}),
      lookup_key: expected.lookupKey,
      // Moves the lookup key off an old price if pricing changed; the old
      // price keeps billing its existing subscribers.
      transfer_lookup_key: true,
      nickname: expected.nickname,
      metadata: { managed_by: "scripts/setupStripePricing.ts" },
    });
    console.log(`  + ${label}  (${created.id}) — ${replaced}`);
  }

  // Coupons: fixed IDs that encode their amounts.
  console.log("");
  for (const expected of allExpectedCoupons()) {
    const label = `coupon ${expected.id} = ${(expected.amountOffCents / 100).toFixed(2)} ${CURRENCY} off, ${
      expected.duration === "once" ? "first invoice" : `${expected.durationInMonths} months`
    }`;
    try {
      const coupon = await stripe.coupons.retrieve(expected.id);
      const ok =
        coupon.valid &&
        coupon.amount_off === expected.amountOffCents &&
        coupon.currency === CURRENCY &&
        coupon.duration === expected.duration &&
        (coupon.duration_in_months ?? null) === expected.durationInMonths;
      if (ok) {
        console.log(`  ✓ ${label}`);
      } else {
        // A coupon's amount can't be edited, and the ID encodes the amount,
        // so this only happens if someone changed or expired it by hand.
        console.log(`  ✗ ${label}  — exists but is invalid or different; delete it in Stripe and re-run`);
        problems++;
      }
    } catch (err) {
      if (!isMissing(err)) throw err;
      if (CHECK_ONLY) {
        console.log(`  ✗ ${label}  — missing`);
        problems++;
        continue;
      }
      await stripe.coupons.create({
        id: expected.id,
        name: expected.name,
        amount_off: expected.amountOffCents,
        currency: CURRENCY,
        duration: expected.duration,
        ...(expected.durationInMonths ? { duration_in_months: expected.durationInMonths } : {}),
        // Only ever discounts the subscription, never a setup fee.
        applies_to: { products: [STRIPE_PRODUCTS.subscription.id] },
        metadata: { managed_by: "scripts/setupStripePricing.ts" },
      });
      console.log(`  + ${label}  created`);
    }
  }

  console.log("");
  if (problems > 0) {
    console.log(`${problems} problem(s). ${CHECK_ONLY ? "Run without --check to fix." : ""}`);
    process.exit(1);
  }
  console.log(`Stripe ${mode} mode matches lib/pricing.ts.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
