import * as Sentry from "@sentry/nextjs";

// Covers middleware and any edge-runtime route handlers. This app doesn't
// currently use the edge runtime anywhere (auth, webhooks, and API routes
// are all Node), but Next.js loads this file regardless — see
// instrumentation.ts's NEXT_RUNTIME check.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  debug: process.env.NODE_ENV === "development",
});
