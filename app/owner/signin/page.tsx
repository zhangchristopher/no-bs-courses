import Link from "next/link";
import type { Metadata } from "next";
import { ownerSigninAction } from "./actions";

export const metadata: Metadata = { title: "Owner Sign In" };

export default async function OwnerSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; reset?: string }>;
}) {
  const { error, callbackUrl, reset } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Course owner sign in
      </h1>

      {reset && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Password reset. Sign in with your new password.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={ownerSigninAction} className="mt-6 flex flex-col gap-4">
        {callbackUrl && <input type="hidden" name="callback_url" value={callbackUrl} />}
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign in
        </button>
      </form>

      <p className="mt-3 text-sm">
        <Link href="/forgot-password" className="underline text-zinc-600 dark:text-zinc-400">
          Forgot password?
        </Link>
      </p>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an owner account?{" "}
        <Link
          href={
            callbackUrl ? `/owner/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/owner/signup"
          }
          className="underline"
        >
          Sign up
        </Link>
      </p>
    </main>
  );
}
