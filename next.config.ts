import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Stripe's publishable key, for the embedded checkout form. Accepts the
// standard NEXT_PUBLIC_ name or PUBLIC_STRIPE_PUBLISHABLE_KEY (the name it
// was first added under in Vercel). Whatever is here gets compiled into
// browser code, so refuse to build with anything but a publishable (pk_)
// key — a secret key pasted here by mistake would otherwise be public.
const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (stripePublishableKey && !stripePublishableKey.startsWith("pk_")) {
  throw new Error(
    "The Stripe publishable key env var must hold a publishable key starting with pk_. " +
      "It looks like a different key was used — never put a secret (sk_/rk_) key in a public variable."
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "picsum.photos" },
      // Course cover images pulled from each listing's own source page
      // during research. Deliberately does NOT include assets.skool.com or
      // whop.com — both platforms' Terms of Service explicitly prohibit
      // automated tools collecting/compiling their content, which is what
      // fetching their og:image amounts to. Those courses fall back to the
      // typographic tile (see CourseCard) until an owner claims the listing
      // and supplies their own image, or a licensed source exists.
      { hostname: "storage.googleapis.com" },
      { hostname: "precisionaiacademy.com" },
      { hostname: "cs50.harvard.edu" },
      { hostname: "www.theodinproject.com" },
      { hostname: "s3.amazonaws.com" },
      { hostname: "137828.fs1.hubspotusercontent-na1.net" },
      { hostname: "cdn.kastatic.org" },
    ],
  },
  // Single SENTRY_DSN env var (see .env.local) covers both server and
  // client — Sentry DSNs are meant to be public (they end up embedded in
  // the browser bundle regardless), so aliasing it under NEXT_PUBLIC_ here
  // avoids needing to keep two copies of the same value in sync.
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // No SENTRY_AUTH_TOKEN yet (see .env.local) — the plugin silently skips
  // source map upload without one, so this is safe to leave wrapped even
  // before a real Sentry account exists.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
