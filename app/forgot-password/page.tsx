import type { Metadata } from "next";
import { requestPasswordResetAction } from "./actions";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Forgot password</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter the email on your account (learner or business) and we&apos;ll send a reset link.
      </p>

      {sent && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          If an account exists for that email, we&apos;ve sent a password reset link.
        </p>
      )}

      <form action={requestPasswordResetAction} className="mt-6 flex flex-col gap-4">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Send reset link
        </button>
      </form>
    </main>
  );
}
