import Link from "next/link";
import type { Metadata } from "next";
import AccountTypeToggle from "@/components/AccountTypeToggle";
import Honeypot from "@/components/Honeypot";
import { registerOwnerAction } from "./actions";

export const metadata: Metadata = { title: "Owner Sign Up" };

export default async function OwnerSignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Create a business account
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        For course providers who want to claim and manage their listings. This is separate
        from a personal learner account.
      </p>
      <AccountTypeToggle active="business" callbackUrl={callbackUrl} />

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={registerOwnerAction} className="mt-6 flex flex-col gap-4">
        <Honeypot />
        {callbackUrl && <input type="hidden" name="callback_url" value={callbackUrl} />}
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Display name
          <input
            name="name"
            type="text"
            placeholder="An alias or online handle works fine"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <span className="mt-1 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
            Only ever seen by the No BS Courses team, never shown publicly — use an alias if
            you&apos;d rather keep your real name private. You can change it anytime from your
            profile. Your legal business name is captured separately (and kept private) during
            business verification.
          </span>
        </label>
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
          Phone
          <input
            name="phone"
            type="tel"
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" name="email_marketing_opt_in" className="accent-zinc-900" />
            Send me owner tips and platform updates by email
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" name="sms_marketing_opt_in" className="accent-zinc-900" />
            Send me text updates
          </label>
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
        Already have a business account?{" "}
        <Link
          href={
            callbackUrl ? `/owner/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/owner/signin"
          }
          className="underline"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}
