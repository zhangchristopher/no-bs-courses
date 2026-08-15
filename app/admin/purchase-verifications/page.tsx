import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingPurchaseVerifications } from "@/lib/purchaseVerifications";
import { approvePurchaseVerificationAction, rejectPurchaseVerificationAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Not authorized
        </h1>
        <p className="mt-2 text-ink/60 dark:text-ink-dark/60">
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
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Purchase Verifications
      </h1>
      <p className="mt-2 text-sm tabular-nums text-ink/60 dark:text-ink-dark/60">
        {pending.length} pending review{pending.length === 1 ? "" : "s"}. Approving grants the
        reviewer a bonus paid-course unlock credit.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">No pending submissions.</p>
        )}
        {pending.map((p) => (
          <Card key={p.review_id}>
            <div className="flex items-center justify-between">
              <Link
                href={`/courses/${p.course_slug}`}
                target="_blank"
                className="font-medium text-ink hover:underline dark:text-ink-dark"
              >
                {p.course_title}
              </Link>
              <span className="text-xs tabular-nums text-ink/50 dark:text-ink-dark/50">
                Submitted {formatDate(p.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Reviewer: {p.reviewer_name || "(no name)"} &lt;{p.reviewer_email}&gt;
            </p>
            <div className="mt-3 border border-hairline bg-ink/[0.02] p-3 text-sm text-ink/75 dark:border-hairline-dark dark:bg-ink-dark/[0.03] dark:text-ink-dark/75">
              <div className="text-xs font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                Evidence
              </div>
              <p className="mt-1 whitespace-pre-line">{p.purchase_evidence}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={approvePurchaseVerificationAction}>
                <input type="hidden" name="review_id" value={p.review_id} />
                <input type="hidden" name="course_id" value={p.course_id} />
                <input type="hidden" name="reviewer_id" value={p.reviewer_id} />
                <Button type="submit" size="sm">
                  Approve
                </Button>
              </form>
              <form action={rejectPurchaseVerificationAction}>
                <input type="hidden" name="review_id" value={p.review_id} />
                <input type="hidden" name="course_id" value={p.course_id} />
                <Button type="submit" variant="secondary" size="sm">
                  Reject
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
