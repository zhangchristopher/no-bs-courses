import { redirect } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import stripe from "@/lib/stripe";
import { isBillingInterval } from "@/lib/pricing";

// Stripe's return_url for the embedded owner-plan checkout. This
// page only reads the session's status and routes the owner to the right
// screen — the subscription itself is activated by the
// checkout.session.completed webhook, which stays the source of truth.
export default async function BusinessCheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }
  if (!sessionId) {
    redirect("/owner/dashboard");
  }

  let status: string | null = null;
  let plan: string | null = null;
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    // Only trust a session that was created for this owner's subscription.
    if (
      checkoutSession.metadata?.kind === "business_subscription" &&
      checkoutSession.metadata?.owner_id === session.user.id
    ) {
      status = checkoutSession.status;
      plan = checkoutSession.metadata?.billing_interval ?? null;
    }
  } catch {
    status = null;
  }

  if (status === "complete") {
    redirect("/owner/dashboard?business=success");
  }
  if (status === "open") {
    // Payment didn't go through (e.g. a declined card after 3-D Secure);
    // send them back to the form to try again.
    const error = encodeURIComponent("Payment didn't go through. Please try again.");
    redirect(
      isBillingInterval(plan)
        ? `/owner/dashboard/checkout?plan=${plan}&error=${error}`
        : `/owner/dashboard?error=${error}`
    );
  }
  redirect("/owner/dashboard?business=cancelled");
}
