"use server";

import { ownerAuth } from "@/owner-auth";
import sql from "@/lib/db";
import stripe from "@/lib/stripe";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { CheckoutSessionResult } from "@/components/EmbeddedStripeCheckout";

// One Checkout Session bills the $99 setup fee immediately and starts the
// $50/mo subscription in the same step (Stripe supports mixing a one-time
// and a recurring line item in a single subscription-mode session).
//
// Embedded mode: the payment form renders inside our own
// /owner/dashboard/checkout page, and Stripe sends the owner to return_url
// when it finishes. Activation itself still happens in the
// checkout.session.completed webhook — the return page only reads status.
export async function createBusinessCheckoutSessionAction(): Promise<CheckoutSessionResult> {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    return { error: "Sign in with your course owner account to subscribe." };
  }

  const [owner] = await sql<
    { business_verification_status: string; business_subscription_status: string }[]
  >`
    SELECT business_verification_status, business_subscription_status
    FROM owners
    WHERE id = ${session.user.id}
  `;

  if (!owner || owner.business_verification_status !== "verified") {
    return { error: "Complete business verification first." };
  }
  if (owner.business_subscription_status === "active") {
    return { error: "Registered Business is already active." };
  }

  const setupFeePriceId = process.env.STRIPE_BUSINESS_SETUP_FEE_PRICE_ID;
  const subscriptionPriceId = process.env.STRIPE_BUSINESS_SUBSCRIPTION_PRICE_ID;
  if (!setupFeePriceId || !subscriptionPriceId) {
    return { error: "Registered Business payments aren't configured yet. No charge was made." };
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: subscriptionPriceId, quantity: 1 },
        { price: setupFeePriceId, quantity: 1 },
      ],
      return_url: `${SITE_URL}/owner/dashboard/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { kind: "business_subscription", owner_id: session.user.id },
      // Match the site's dark palette so the embedded form doesn't sit on
      // the page as a white box.
      branding_settings: {
        display_name: SITE_NAME,
        background_color: "#141414",
        button_color: "#ffffff",
        border_style: "rectangular",
        font_family: "inter",
      },
    });

    if (!checkoutSession.client_secret) {
      throw new Error("Stripe did not return a client secret.");
    }

    return { clientSecret: checkoutSession.client_secret };
  } catch {
    return { error: "Couldn't start checkout. Check your Stripe configuration. No charge was made." };
  }
}
