import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingBusinessVerifications, getBusinessSubscribers } from "@/lib/business";
import { approveBusinessAction, rejectBusinessAction, markSetupFeeRefundedAction } from "./actions";

export const metadata: Metadata = { title: "Business Verifications" };

export default async function AdminBusinessesPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Business Verifications
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {pending.length} pending submission{pending.length === 1 ? "" : "s"}. Signed in as{" "}
        {session.email}. This is paperwork review only — course ownership claims are at{" "}
        <Link href="/admin/claims" className="underline">
          Course Claims
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending submissions.</p>
        )}
        {pending.map((p) => (
          <div key={p.owner_id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{p.business_name}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Owner: {p.owner_name || "(no name)"} &lt;{p.owner_email}&gt;
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Registration #: {p.business_registration_number} · State: {p.business_state}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Approve
                </button>
              </form>
              <form action={rejectBusinessAction} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="owner_id" value={p.owner_id} />
                <input
                  type="text"
                  name="reason"
                  placeholder="Rejection reason (optional)"
                  className="min-w-[12rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Reject
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Registered Business Subscribers
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Owners who&apos;ve paid the $99 setup fee + $50/mo subscription. Refunds are issued
        manually in the Stripe dashboard — use the button below only after you&apos;ve actually
        issued the refund there, to record it.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {subscribers.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No subscribers yet.</p>
        )}
        {subscribers.map((s) => (
          <div
            key={s.owner_id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {s.business_name || s.owner_name || "(no name)"}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.owner_email}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Mark setup fee as refunded
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
