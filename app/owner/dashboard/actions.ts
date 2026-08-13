"use server";

import { redirect } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import sql from "@/lib/db";
import stripe from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

// One Checkout Session bills the $99 setup fee immediately and starts the
// $50/mo subscription in the same step (Stripe supports mixing a one-time
// and a recurring line item in a single subscription-mode session).
export async function startBusinessSubscriptionCheckoutAction() {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const [owner] = await sql<
    { business_verification_status: string; business_subscription_status: string }[]
  >`
    SELECT business_verification_status, business_subscription_status
    FROM owners
    WHERE id = ${session.user.id}
  `;

  if (!owner || owner.business_verification_status !== "verified") {
    redirect(
      `/owner/dashboard?error=${encodeURIComponent("Complete business verification first.")}`
    );
  }
  if (owner.business_subscription_status === "active") {
    redirect(`/owner/dashboard?error=${encodeURIComponent("Registered Business is already active.")}`);
  }

  const setupFeePriceId = process.env.STRIPE_BUSINESS_SETUP_FEE_PRICE_ID;
  const subscriptionPriceId = process.env.STRIPE_BUSINESS_SUBSCRIPTION_PRICE_ID;
  if (!setupFeePriceId || !subscriptionPriceId) {
    redirect(
      `/owner/dashboard?error=${encodeURIComponent("Registered Business payments aren't configured yet.")}`
    );
  }

  let checkoutUrl: string;
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: subscriptionPriceId, quantity: 1 },
        { price: setupFeePriceId, quantity: 1 },
      ],
      success_url: `${SITE_URL}/owner/dashboard?business=success`,
      cancel_url: `${SITE_URL}/owner/dashboard?business=cancelled`,
      metadata: { kind: "business_subscription", owner_id: session.user.id },
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    checkoutUrl = checkoutSession.url;
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      // Next.js redirect()/notFound() signals — let them propagate.
      throw err;
    }
    redirect(
      `/owner/dashboard?error=${encodeURIComponent("Couldn't start checkout. Check your Stripe configuration.")}`
    );
  }

  redirect(checkoutUrl);
}
