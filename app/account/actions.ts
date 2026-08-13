"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import stripe from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { spendBonusCredit } from "@/lib/paywall";

function isRedirectSignal(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && "digest" in err);
}

export async function startCustomerPlanCheckoutAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const priceId = process.env.STRIPE_CUSTOMER_PLAN_PRICE_ID;
  if (!priceId) {
    redirect(`/account?error=${encodeURIComponent("Plan payments aren't configured yet.")}`);
  }

  let checkoutUrl: string;
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/account?plan=success`,
      cancel_url: `${SITE_URL}/account?plan=cancelled`,
      metadata: { kind: "customer_plan", user_id: session.user.id },
    });
    if (!checkoutSession.url) throw new Error("Stripe did not return a checkout URL.");
    checkoutUrl = checkoutSession.url;
  } catch (err) {
    if (isRedirectSignal(err)) throw err;
    redirect(`/account?error=${encodeURIComponent("Couldn't start checkout. Check your Stripe configuration.")}`);
  }

  redirect(checkoutUrl);
}

export async function spendBonusCreditAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const ok = await spendBonusCredit(session.user.id, courseId);
  if (!ok) {
    redirect(`/courses/${slug}?error=${encodeURIComponent("No bonus credits available.")}`);
  }

  redirect(`/courses/${slug}`);
}

export async function startCourseUnlockCheckoutAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const priceId = process.env.STRIPE_PAY_PER_VIEW_PRICE_ID;
  if (!priceId) {
    redirect(`/courses/${slug}?error=${encodeURIComponent("Pay-per-view isn't configured yet.")}`);
  }

  let checkoutUrl: string;
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/courses/${slug}?unlocked=1`,
      cancel_url: `${SITE_URL}/courses/${slug}`,
      metadata: { kind: "course_unlock", user_id: session.user.id, course_id: courseId },
    });
    if (!checkoutSession.url) throw new Error("Stripe did not return a checkout URL.");
    checkoutUrl = checkoutSession.url;
  } catch (err) {
    if (isRedirectSignal(err)) throw err;
    redirect(`/courses/${slug}?error=${encodeURIComponent("Couldn't start checkout. Check your Stripe configuration.")}`);
  }

  redirect(checkoutUrl);
}
