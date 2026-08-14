import Link from "next/link";
import type { Metadata } from "next";
import { resetPasswordAction } from "./actions";

export const metadata: Metadata = { title: "Reset Password" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "This reset link isn't valid.",
  expired: "This reset link has expired — request a new one.",
  used: "This reset link has already been used.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; status?: string; reason?: string }>;
}) {
  const { token, error, status, reason } = await searchParams;

  if (status === "error") {
    return (
      <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Couldn&apos;t reset password
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {ERROR_MESSAGES[reason ?? ""] ?? "Something went wrong with this link."}
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block underline text-sm">
          Request a new link
        </Link>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Missing reset link
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Open the reset link from your email, or{" "}
          <Link href="/forgot-password" className="underline">
            request a new one
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Set a new password</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={resetPasswordAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Confirm new password
          <input
            name="confirm_password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Reset password
        </button>
      </form>
    </main>
  );
}
