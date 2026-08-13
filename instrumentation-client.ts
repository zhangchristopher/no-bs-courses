import * as Sentry from "@sentry/nextjs";

// Placeholder DSN until a real Sentry project exists — see .env.local for
// where to drop in the real one. With a placeholder/missing DSN, Sentry.init
// still runs and captures events locally (visible with debug: true below),
// it just can't deliver them anywhere real yet.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  debug: process.env.NODE_ENV === "development",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
