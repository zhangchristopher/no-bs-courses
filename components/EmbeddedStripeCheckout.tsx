"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { StatusBanner } from "@/components/ui/StatusBanner";

export type CheckoutSessionResult = { clientSecret: string } | { error: string };

// Created once at module scope, as Stripe recommends — loadStripe injects
// the Stripe.js script, and re-running it on every render would reload it.
// Without a publishable key the form can't mount, so it falls back to a
// "not configured" message instead of throwing in the browser.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const GENERIC_ERROR = "Couldn't start checkout. Please reload and try again. No charge was made.";

// Stripe's Embedded Checkout, rendered in an iframe on our own page rather
// than redirecting to checkout.stripe.com. The Checkout Session is created
// by a server action once this mounts (not during the page's server
// render), so prefetching the page doesn't mint stray sessions. Fetching
// the client secret here — rather than handing Stripe a fetchClientSecret
// callback — means a failure becomes a readable banner instead of an
// unhandled rejection inside Stripe's provider.
export default function EmbeddedStripeCheckout({
  createSessionAction,
}: {
  createSessionAction: () => Promise<CheckoutSessionResult>;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePromise) return;
    let cancelled = false;

    // Stripe.js comes from js.stripe.com; an ad blocker or a strict network
    // can stop it loading, which would otherwise leave an empty box.
    stripePromise.catch(() => {
      if (!cancelled) {
        setError(
          "Couldn't load the secure payment form. Check your connection or disable any content blocker for this page, then reload. No charge was made."
        );
      }
    });

    createSessionAction()
      .then((result) => {
        if (cancelled) return;
        if ("error" in result) setError(result.error);
        else setClientSecret(result.clientSecret);
      })
      .catch(() => {
        if (!cancelled) setError(GENERIC_ERROR);
      });

    return () => {
      cancelled = true;
    };
  }, [createSessionAction]);

  if (!stripePromise) {
    return (
      <StatusBanner tone="error">
        Payments aren&apos;t configured yet. No charge was made.
      </StatusBanner>
    );
  }

  if (error) {
    return <StatusBanner tone="error">{error}</StatusBanner>;
  }

  if (!clientSecret) {
    return (
      <p className="flex min-h-[480px] items-center justify-center text-sm text-ink-dark/50" role="status">
        Loading secure payment form…
      </p>
    );
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout className="min-h-[480px]" />
    </EmbeddedCheckoutProvider>
  );
}
