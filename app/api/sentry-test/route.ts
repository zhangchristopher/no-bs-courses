export const runtime = "nodejs";

// Deliberately throws, unguarded — structurally identical to the Stripe
// webhook route (same Node runtime Route Handler shape), so this proves
// the same automatic capture path (instrumentation.ts's onRequestError)
// applies there too.
export async function GET(): Promise<never> {
  throw new Error("Sentry test: deliberate route handler crash from /api/sentry-test");
}
