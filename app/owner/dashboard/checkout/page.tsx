import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnerBusinessInfo } from "@/lib/business";
import EmbeddedStripeCheckout from "@/components/EmbeddedStripeCheckout";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { ArrowIcon } from "@/components/icons";
import { createBusinessCheckoutSessionAction } from "../actions";

export const metadata: Metadata = { title: "Subscribe to Registered Business" };

// Stripe's payment form, embedded on our own page instead of a redirect to
// checkout.stripe.com. Eligibility is checked here so an ineligible owner
// never sees the form; the server action re-checks before creating the
// Checkout Session, since it can be called directly.
export default async function BusinessCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const business = await getOwnerBusinessInfo(session.user.id);
  if (business?.business_subscription_status === "active") {
    redirect("/owner/dashboard");
  }
  if (business?.business_verification_status !== "verified") {
    redirect(`/owner/dashboard?error=${encodeURIComponent("Complete business verification first.")}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dark/55 hover:underline"
      >
        <ArrowIcon direction="left" className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-black uppercase tracking-headline text-ink-dark">
        Registered Business
      </h1>
      <p className="mt-2 text-sm text-ink-dark/60">
        $99 one-time setup fee today, then $50/month, renewing monthly until you cancel. Unlimited
        courses, editing control, and the Registered Business badge. See the{" "}
        <Link href="/terms#payments-refunds" className="underline hover:no-underline">
          refund terms
        </Link>
        . Payments are processed by Stripe; your card details never touch our servers.
      </p>

      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <div className="mt-8">
        <EmbeddedStripeCheckout createSessionAction={createBusinessCheckoutSessionAction} />
      </div>
    </main>
  );
}
