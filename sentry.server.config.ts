import * as Sentry from "@sentry/nextjs";

// Placeholder DSN until a real Sentry project exists — see .env.local.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  debug: process.env.NODE_ENV === "development",
});
