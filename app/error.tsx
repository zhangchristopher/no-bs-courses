"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import BSMark from "@/components/BSMark";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // This is what actually catches a React render crash — Next's error
    // boundary swallows it before it ever reaches window.onerror, so
    // Sentry's automatic browser instrumentation alone wouldn't see it.
    Sentry.captureException(error);
    // Log for our own debugging — never shown to the user, since surfacing
    // raw error internals to visitors is a real information-disclosure risk.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <BSMark size={64} className="opacity-80" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Something went wrong.
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Not on you — something broke on our end. Try again, or head back home.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
