import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAccountSummary } from "@/lib/paywall";
import { startCustomerPlanCheckoutAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckMarkIcon } from "@/components/icons";

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
      <AuthShell title="Sign in required">
        <Link href="/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  const summary = await getAccountSummary(session.user.id);
  const isPaidPlan = summary.plan_subscription_status === "active";

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Your account
      </h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">{summary.email}</p>

      {plan === "success" && (
        <StatusBanner tone="success">
          Payment received. It can take a few seconds for Stripe to confirm — refresh if your
          plan still shows free.
        </StatusBanner>
      )}
      {plan === "cancelled" && (
        <StatusBanner tone="warning">Checkout was cancelled. No charge was made.</StatusBanner>
      )}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <Card className="mt-6">
        {isPaidPlan ? (
          <p className="flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
            <CheckMarkIcon className="h-4 w-4 shrink-0" />
            Paid plan — $5/mo, unlimited access to every paid course.
          </p>
        ) : (
          <>
            <p className="text-sm tabular-nums text-ink/75 dark:text-ink-dark/75">
              Free plan — {summary.unlocksThisMonth} of 3 free paid-course unlocks used this
              month.
            </p>
            <p className="mt-1 text-sm tabular-nums text-ink/75 dark:text-ink-dark/75">
              Bonus unlock credits: {summary.bonus_unlock_credits} (earned from verified
              reviews)
            </p>
            <form action={startCustomerPlanCheckoutAction} className="mt-3">
              <Button type="submit" size="sm">
                Upgrade — $5/mo
              </Button>
            </form>
          </>
        )}
      </Card>
    </main>
  );
}
