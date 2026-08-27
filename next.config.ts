import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
