import type { Metadata } from "next";
import ThrowButtons from "./ThrowButtons";
import { throwTestServerActionError } from "./actions";

export const metadata: Metadata = { title: "Sentry Test" };

// Temporary — delete this route once you've confirmed Sentry capture works
// end to end with a real DSN. Not linked from anywhere in the site nav.
export default function SentryTestPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sentry Test</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Each of these deliberately throws, to confirm the corresponding Sentry capture path is
        wired correctly. Delete this route before launch.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <section>
          <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Client-side
          </h2>
          <div className="mt-2">
            <ThrowButtons />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Server action
          </h2>
          <form action={throwTestServerActionError} className="mt-2">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Throw in server action
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Route handler
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Visit{" "}
            <a href="/api/sentry-test" className="underline">
              /api/sentry-test
            </a>{" "}
            directly — same Node runtime shape as the Stripe webhook route.
          </p>
        </section>
      </div>
    </main>
  );
}
