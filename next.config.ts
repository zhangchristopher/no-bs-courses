import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "picsum.photos" },
      // Course cover images pulled from each listing's real source page
      // (og:image) during the Excel import — real course thumbnails, not
      // stock/placeholder art.
      { hostname: "assets.skool.com" },
      { hostname: "storage.googleapis.com" },
      { hostname: "precisionaiacademy.com" },
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
