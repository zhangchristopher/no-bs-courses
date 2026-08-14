import Link from "next/link";
import type { Metadata } from "next";
import { confirmEmailVerificationAction } from "./actions";

export const metadata: Metadata = { title: "Verify Email" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "This verification link isn't valid.",
  expired: "This verification link has expired — sign up again or request a new one from your account.",
  used: "This verification link has already been used.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string; reason?: string; type?: string }>;
}) {
  const { token, status, reason, type } = await searchParams;

  if (status === "success") {
    return (
      <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Email verified</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your {type === "owner" ? "business" : "learner"} account email is confirmed.
        </p>
        <Link
          href={type === "owner" ? "/owner/dashboard" : "/courses"}
          className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Continue
        </Link>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Couldn&apos;t verify email
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {ERROR_MESSAGES[reason ?? ""] ?? "Something went wrong verifying this link."}
        </p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Missing verification link
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Open the verification link from your email to continue.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Confirm your email address
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Click below to finish verifying your No BS Courses account email.
      </p>
      <form action={confirmEmailVerificationAction} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Verify email
        </button>
      </form>
    </main>
  );
}
