import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingBusinessVerifications, getBusinessSubscribers } from "@/lib/business";
import { approveBusinessAction, rejectBusinessAction, markSetupFeeRefundedAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Business Verifications" };

export default async function AdminBusinessesPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Not authorized
        </h1>
        <p className="mt-2 text-ink/60 dark:text-ink-dark/60">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to view business verifications."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const pending = await getPendingBusinessVerifications();
  const subscribers = await getBusinessSubscribers();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Business Verifications
      </h1>
      <p className="mt-2 text-sm tabular-nums text-ink/60 dark:text-ink-dark/60">
        {pending.length} pending submission{pending.length === 1 ? "" : "s"}. This is paperwork
        review only — course ownership claims are at{" "}
        <Link href="/admin/claims" className="underline">
          Course Claims
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">No pending submissions.</p>
        )}
        {pending.map((p) => (
          <Card key={p.owner_id}>
            <p className="font-medium text-ink dark:text-ink-dark">{p.business_name}</p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Owner: {p.owner_name || "(no name)"} &lt;{p.owner_email}&gt;
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Registration #: {p.business_registration_number} · State: {p.business_state}
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Paperwork:{" "}
              <a
                href={p.business_paperwork_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {p.business_paperwork_url}
              </a>
            </p>

            <div className="mt-4 flex flex-wrap items-start gap-3">
              <form action={approveBusinessAction}>
                <input type="hidden" name="owner_id" value={p.owner_id} />
                <Button type="submit" size="sm">
                  Approve
                </Button>
              </form>
              <form action={rejectBusinessAction} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="owner_id" value={p.owner_id} />
                <input
                  type="text"
                  name="reason"
                  placeholder="Rejection reason (optional)"
                  className="min-w-[12rem] flex-1 border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Reject
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-black uppercase tracking-tight text-ink dark:text-ink-dark">
        Registered Business Subscribers
      </h2>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        Owners who&apos;ve paid the $99 setup fee + $50/mo subscription. Refunds are issued
        manually in the Stripe dashboard — use the button below only after you&apos;ve actually
        issued the refund there, to record it.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {subscribers.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">No subscribers yet.</p>
        )}
        {subscribers.map((s) => (
          <Card key={s.owner_id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-ink dark:text-ink-dark">
                {s.business_name || s.owner_name || "(no name)"}
              </p>
              <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">{s.owner_email}</p>
              <p className="mt-1 text-sm tabular-nums text-ink/55 dark:text-ink-dark/55">
                Subscription: {s.business_subscription_status}
                {s.business_setup_fee_refunded_at && (
                  <>
                    {" "}
                    · Setup fee refunded{" "}
                    {new Date(s.business_setup_fee_refunded_at).toLocaleDateString()}
                  </>
                )}
              </p>
            </div>
            {!s.business_setup_fee_refunded_at && (
              <form action={markSetupFeeRefundedAction}>
                <input type="hidden" name="owner_id" value={s.owner_id} />
                <Button type="submit" variant="secondary" size="sm">
                  Mark setup fee as refunded
                </Button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
