"use client";

import { useState } from "react";

// Two different client-side failure modes, since Sentry handles them
// differently:
// - An error thrown inside an event handler is NOT part of a React render,
//   so it never reaches a React error boundary — it's caught by Sentry's
//   automatic global window.onerror/unhandledrejection listeners instead,
//   no extra code needed.
// - An error thrown during render IS caught by the nearest error boundary
//   (app/error.tsx), which swallows it before it reaches window.onerror —
//   that's why error.tsx has an explicit Sentry.captureException call.
export default function ThrowButtons() {
  const [shouldThrowOnRender, setShouldThrowOnRender] = useState(false);

  if (shouldThrowOnRender) {
    throw new Error("Sentry test: deliberate render-time crash from ThrowButtons");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => {
          throw new Error("Sentry test: deliberate event-handler crash from ThrowButtons");
        }}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        Throw in event handler
      </button>
      <button
        type="button"
        onClick={() => setShouldThrowOnRender(true)}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        Throw during render (triggers error.tsx)
      </button>
    </div>
  );
}
