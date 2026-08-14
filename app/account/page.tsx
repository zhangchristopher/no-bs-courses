import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAccountSummary } from "@/lib/paywall";
import { startCustomerPlanCheckoutAction } from "./actions";

export const metadata: Metadata = { title: "Your Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string }>;
}) {
  const { error, plan } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in required
        </h1>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const summary = await getAccountSummary(session.user.id);
  const isPaidPlan = summary.plan_subscription_status === "active";

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Your account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{summary.email}</p>

      {plan === "success" && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Payment received. It can take a few seconds for Stripe to confirm — refresh if your
          plan still shows free.
        </p>
      )}
      {plan === "cancelled" && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Checkout was cancelled. No charge was made.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        {isPaidPlan ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            ✓ Paid plan — $5/mo, unlimited access to every paid course.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Free plan — {summary.unlocksThisMonth} of 3 free paid-course unlocks used this
              month.
            </p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Bonus unlock credits: {summary.bonus_unlock_credits} (earned from verified
              reviews)
            </p>
            <form action={startCustomerPlanCheckoutAction} className="mt-3">
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Upgrade — $5/mo
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
