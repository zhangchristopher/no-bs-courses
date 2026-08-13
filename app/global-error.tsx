"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Only used if the root layout itself throws (e.g. SiteHeader's session
// lookup fails) — that's why this defines its own <html>/<body> instead of
// relying on app/layout.tsx, which may be what's broken.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-sans">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Something went wrong.
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Not on you — something broke on our end. Try reloading the page.
        </p>
        <button
          onClick={reset}
          className="mt-8 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
