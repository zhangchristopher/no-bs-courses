"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { Button } from "@/components/ui/Button";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SITE_NAME } from "@/lib/site";

export type CheckoutSessionResult = { clientSecret: string } | { error: string };

// Created once at module scope, as Stripe recommends — loadStripe injects
// the Stripe.js script, and re-running it on every render would reload it.
// Without a publishable key the form can't mount, so it falls back to a
// "not configured" message instead of throwing in the browser.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const GENERIC_ERROR = "Couldn't start checkout. Please reload and try again. No charge was made.";

// Stripe's card fields themed to the site's palette (globals.css: #141414
// ground, white ink, 15% white hairlines, square corners, Inter). Stripe
// renders the fields in its own iframes, so the colors are restated here
// rather than read from CSS variables.
const APPEARANCE: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "#141414",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1a1",
    colorTextPlaceholder: "#737373",
    colorDanger: "#f87171",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSizeBase: "14px",
    borderRadius: "0px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255, 255, 255, 0.15)", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #ffffff", boxShadow: "none" },
    ".Tab": { border: "1px solid rgba(255, 255, 255, 0.15)", boxShadow: "none" },
    ".Tab--selected": { border: "1px solid #ffffff", boxShadow: "none" },
    ".Label": { color: "rgba(255, 255, 255, 0.6)" },
  },
};

const FONTS = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" }];

// Stripe's payment fields (Checkout Sessions in "elements" mode), rendered
// in our own form so they match the site instead of sitting in Stripe's
// white embedded-checkout panel. The plan summary is the page's own
// heading; this shows what's due today, the card fields and the button.
//
// The Checkout Session is created by a server action once this mounts (not
// during the page's server render), so prefetching the page doesn't mint
// stray sessions. Fetching the client secret here means a failure becomes a
// readable banner instead of an unhandled rejection inside Stripe's
// provider.
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
    return <LoadingForm />;
  }

  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret, elementsOptions: { appearance: APPEARANCE, fonts: FONTS } }}
    >
      <PaymentForm />
    </CheckoutElementsProvider>
  );
}

function LoadingForm() {
  return (
    <p
      className="flex min-h-[360px] items-center justify-center border border-hairline-dark text-sm text-ink-dark/50"
      role="status"
    >
      Loading secure payment form…
    </p>
  );
}

function PaymentForm() {
  const checkoutState = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (checkoutState.type === "loading") {
    return <LoadingForm />;
  }
  if (checkoutState.type === "error") {
    return <StatusBanner tone="error">{GENERIC_ERROR}</StatusBanner>;
  }

  const { checkout } = checkoutState;
  const dueToday = checkout.total.total.amount;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setPaymentError(null);
    // On success Stripe redirects to the session's return_url, where the
    // return page reads the outcome. Only failures come back here.
    const result = await checkout.confirm();
    if (result.type === "error") {
      setPaymentError(result.error.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-hairline-dark p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline-dark pb-4">
        <span className="text-[11px] font-bold uppercase tracking-eyebrow text-ink-dark/50">
          Due today
        </span>
        <span className="text-2xl font-black text-ink-dark">{dueToday}</span>
      </div>
      {checkout.email && (
        <p className="mt-4 text-sm text-ink-dark/60">
          Receipts go to <span className="text-ink-dark">{checkout.email}</span>
        </p>
      )}

      <div className="mt-5">
        <PaymentElement />
      </div>

      {paymentError && <StatusBanner tone="error">{paymentError}</StatusBanner>}

      <Button type="submit" disabled={submitting} className="mt-6 w-full">
        {submitting ? "Processing…" : `Subscribe · ${dueToday} today`}
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-ink-dark/50">
        By subscribing, you authorize {SITE_NAME} to charge you according to the{" "}
        <Link href="/terms#payments-refunds" className="underline hover:no-underline">
          terms
        </Link>{" "}
        until you cancel. Payments are processed securely by Stripe.
      </p>
    </form>
  );
}
