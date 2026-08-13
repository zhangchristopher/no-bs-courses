import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingPurchaseVerifications } from "@/lib/purchaseVerifications";
import { approvePurchaseVerificationAction, rejectPurchaseVerificationAction } from "./actions";

export const metadata: Metadata = { title: "Purchase Verifications" };

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminPurchaseVerificationsPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to view purchase verifications."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const pending = await getPendingPurchaseVerifications();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Purchase Verifications
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {pending.length} pending review{pending.length === 1 ? "" : "s"}. Signed in as{" "}
        {session.email}. Approving grants the reviewer a bonus paid-course unlock credit.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending submissions.</p>
        )}
        {pending.map((p) => (
          <div key={p.review_id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <Link
                href={`/courses/${p.course_slug}`}
                target="_blank"
                className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
              >
                {p.course_title}
              </Link>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Submitted {formatDate(p.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Reviewer: {p.reviewer_name || "(no name)"} &lt;{p.reviewer_email}&gt;
            </p>
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <div className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Evidence
              </div>
              <p className="mt-1 whitespace-pre-line">{p.purchase_evidence}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={approvePurchaseVerificationAction}>
                <input type="hidden" name="review_id" value={p.review_id} />
                <input type="hidden" name="course_id" value={p.course_id} />
                <input type="hidden" name="reviewer_id" value={p.reviewer_id} />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Approve
                </button>
              </form>
              <form action={rejectPurchaseVerificationAction}>
                <input type="hidden" name="review_id" value={p.review_id} />
                <input type="hidden" name="course_id" value={p.course_id} />
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
    </main>
  );
}
