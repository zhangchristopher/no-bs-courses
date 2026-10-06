import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnerBusinessInfo } from "@/lib/business";
import {
  INTERVAL_LABEL,
  annualValueNote,
  currentOwnerTier,
  isBillingInterval,
  planSummary,
} from "@/lib/pricing";
import EmbeddedStripeCheckout from "@/components/EmbeddedStripeCheckout";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { ArrowIcon } from "@/components/icons";
import { createBusinessCheckoutSessionAction } from "../actions";

export const metadata: Metadata = { title: "Subscribe to Registered Business" };

// Stripe's payment form, embedded on our own page instead of a redirect to
// checkout.stripe.com, for the plan chosen on the dashboard (?plan=monthly
// or ?plan=annual). Eligibility is checked here so an ineligible owner
// never sees the form; the server action re-checks before creating the
// Checkout Session, since it can be called directly.
export default async function BusinessCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  const { plan, error } = await searchParams;
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }
  if (!isBillingInterval(plan)) {
    redirect("/owner/dashboard");
  }

  const business = await getOwnerBusinessInfo(session.user.id);
  if (business?.business_subscription_status === "active") {
    redirect("/owner/dashboard");
  }
  if (business?.business_verification_status !== "verified") {
    redirect(`/owner/dashboard?error=${encodeURIComponent("Complete business verification first.")}`);
  }

  const tier = currentOwnerTier();
  const introEligible = !business.has_subscribed_before;
  const otherPlan = plan === "monthly" ? "annual" : "monthly";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dark/55 hover:underline"
      >
        <ArrowIcon direction="left" className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-eyebrow text-ink-dark/50">
        Registered Business{tier === "founding" ? " · Founding owner" : ""}
      </p>
      <h1 className="mt-1 text-2xl font-black uppercase tracking-headline text-ink-dark">
        {INTERVAL_LABEL[plan]}: {planSummary(tier, plan, { introEligible })}
      </h1>
      <p className="mt-2 text-sm text-ink-dark/60">
        {tier === "founding"
          ? "No setup fee. Your founding rate stays locked in for as long as you stay subscribed. "
          : ""}
        {plan === "annual" ? `Billed once a year: ${annualValueNote(tier, { introEligible })}. ` : ""}
        Renews automatically until you cancel. Unlimited courses, editing control, and the
        Registered Business badge. See the{" "}
        <Link href="/terms#payments-refunds" className="underline hover:no-underline">
          refund terms
        </Link>
        . Payments are processed by Stripe; your card details never touch our servers.
      </p>
      <p className="mt-3 text-sm">
        <Link
          href={`/owner/dashboard/checkout?plan=${otherPlan}`}
          className="text-ink-dark/70 underline hover:text-ink-dark hover:no-underline"
        >
          Switch to {INTERVAL_LABEL[otherPlan].toLowerCase()}: {planSummary(tier, otherPlan, { introEligible })}
        </Link>
      </p>

      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <div className="mt-8">
        {/* key: switching plans remounts the form so it fetches a new session. */}
        <EmbeddedStripeCheckout
          key={plan}
          createSessionAction={createBusinessCheckoutSessionAction.bind(null, plan)}
        />
      </div>
    </main>
  );
}
