"use server";

// Deliberately throws, unguarded — this is what proves Sentry's automatic
// Server Action capture (via instrumentation.ts's onRequestError) works
// without needing a try/catch in every action, the same way review
// submission or claim approval would be captured.
export async function throwTestServerActionError() {
  throw new Error("Sentry test: deliberate server action crash from /sentry-test");
}
