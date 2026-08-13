import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures errors from Server Components, Route Handlers, and Server
// Actions automatically — this is what covers app/api/webhooks/stripe and
// every "use server" action (review submission, claim approval, etc.)
// without needing a try/catch in each one.
export const onRequestError = Sentry.captureRequestError;
