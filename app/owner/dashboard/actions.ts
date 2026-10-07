"use server";

import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { ownerAuth } from "@/owner-auth";
import sql from "@/lib/db";
import stripe from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { currentOwnerTier, isBillingInterval, type BillingInterval } from "@/lib/pricing";
import { buildOwnerCheckoutItems, PricingConfigError } from "@/lib/ownerCheckout";
import type { CheckoutSessionResult } from "@/components/EmbeddedStripeCheckout";

// Starts a owner-plan subscription in Stripe's embedded Checkout
// for the chosen billing interval. Prices come from lib/pricing.ts via
// buildOwnerCheckoutItems, which checks Stripe holds matching prices and
// coupons first. Founding owners get no setup fee and an intro coupon on
// their first subscription; standard owners get the setup fee as a
// one-time line item in the same session.
//
// The payment form renders inside our own /owner/dashboard/checkout page,
// and Stripe sends the owner to return_url once the payment succeeds. Activation
// itself still happens in the checkout.session.completed webhook — the
// return page only reads status.
//
// Called with the interval bound in by the checkout page; it's still
// validated here since a client can call a server action directly.
// Where Stripe sends the owner back to: the site they're actually on.
// SITE_URL is the canonical (production) address, which is wrong on a
// Vercel preview or localhost and would strand the owner on another site
// right after paying. The host only ever comes from the owner's own
// request, so it can't redirect anyone else.
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host"))?.split(",")[0].trim();
  if (!host) return SITE_URL;
  const proto = (h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https"))
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

export async function createBusinessCheckoutSessionAction(
  interval: BillingInterval
): Promise<CheckoutSessionResult> {
  if (!isBillingInterval(interval)) {
    return { error: "Choose a monthly or annual plan." };
  }

  const session = await ownerAuth();
  if (!session?.user?.id) {
    return { error: "Sign in with your course owner account to subscribe." };
  }

  const [owner] = await sql<
    {
      email: string;
      business_verification_status: string;
      business_subscription_status: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
    }[]
  >`
    SELECT email, business_verification_status, business_subscription_status,
      stripe_customer_id, stripe_subscription_id
    FROM owners
    WHERE id = ${session.user.id}
  `;

  if (!owner || owner.business_verification_status !== "verified") {
    return { error: "Complete business verification first." };
  }
  if (owner.business_subscription_status === "active") {
    return { error: "Your plan is already active." };
  }

  const tier = currentOwnerTier();
  // The intro rate is for an owner's first subscription only, so
  // cancelling and resubscribing doesn't restart the $1 period.
  const introEligible = !owner.stripe_subscription_id;
  const metadata = {
    kind: "business_subscription",
    owner_id: session.user.id,
    pricing_tier: tier,
    billing_interval: interval,
  };

  try {
    const items = await buildOwnerCheckoutItems(tier, interval, { introEligible });

    const checkoutSession = await stripe.checkout.sessions.create({
      // "elements": Stripe's card fields inside our own form, themed to the
      // site (see components/EmbeddedStripeCheckout.tsx).
      ui_mode: "elements",
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: items.line_items,
      ...(items.discounts.length > 0 ? { discounts: items.discounts } : {}),
      // Reuse the owner's Stripe customer if they've paid before.
      ...(owner.stripe_customer_id
        ? { customer: owner.stripe_customer_id }
        : { customer_email: owner.email }),
      return_url: `${await requestOrigin()}/owner/dashboard/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
      // Also on the subscription, so it's visible in Stripe for support.
      subscription_data: { metadata },
    });

    if (!checkoutSession.client_secret) {
      throw new Error("Stripe did not return a client secret.");
    }

    return { clientSecret: checkoutSession.client_secret };
  } catch (err) {
    // Owners get a plain message; the detail (e.g. which Stripe price is
    // missing) goes to Sentry and the server log for whoever runs Stripe.
    Sentry.captureException(err, { tags: { area: "owner_checkout", pricing_tier: tier, interval } });
    console.error("Owner checkout failed:", err instanceof Error ? err.message : err);
    return {
      error:
        err instanceof PricingConfigError
          ? "Checkout isn't available right now — our pricing setup needs attention. No charge was made."
          : "Couldn't start checkout. Please try again. No charge was made.",
    };
  }
}
