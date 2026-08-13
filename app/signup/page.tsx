import Link from "next/link";
import type { Metadata } from "next";
import AccountTypeToggle from "@/components/AccountTypeToggle";
import Honeypot from "@/components/Honeypot";
import { registerAction } from "./actions";

export const metadata: Metadata = { title: "Sign Up" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create an account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        A personal account is for taking and reviewing courses. Managing or listing courses
        needs a business account instead.
      </p>
      <AccountTypeToggle active="personal" callbackUrl={callbackUrl} />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={registerAction} className="mt-6 flex flex-col gap-4">
        <Honeypot />
        {callbackUrl && <input type="hidden" name="callback_url" value={callbackUrl} />}
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Display name
          <input
            name="display_name"
            type="text"
            placeholder="Shown on your reviews"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Phone
          <input
            name="phone"
            type="tel"
            placeholder="Optional"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" name="email_marketing_opt_in" className="accent-zinc-900" />
            Send me course recommendations and review reminders by email
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" name="sms_marketing_opt_in" className="accent-zinc-900" />
            Send me text updates
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign up
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href={callbackUrl ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signin"}
          className="underline"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}
