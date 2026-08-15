import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingClaims } from "@/lib/ownerCourses";
import { approveClaimAction, rejectClaimAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Course Claims" };

export default async function AdminClaimsPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Not authorized
        </h1>
        <p className="mt-2 text-ink/60 dark:text-ink-dark/60">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to view course claims."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const pending = await getPendingClaims();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Course Claims
      </h1>
      <p className="mt-2 text-sm tabular-nums text-ink/60 dark:text-ink-dark/60">
        {pending.length} pending claim{pending.length === 1 ? "" : "s"}. Business paperwork is
        reviewed separately at{" "}
        <Link href="/admin/businesses" className="underline">
          Business Verifications
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">No pending claims.</p>
        )}
        {pending.map((c) => (
          <Card key={c.course_id}>
            <p className="font-medium text-ink dark:text-ink-dark">
              <Link href={`/courses/${c.slug}`} className="underline">
                {c.title}
              </Link>
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Provider: {c.provider_name}
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Claimed by: {c.owner_name || "(no name)"} &lt;{c.owner_email}&gt;
            </p>

            <div className="mt-4 flex flex-wrap items-start gap-3">
              <form action={approveClaimAction}>
                <input type="hidden" name="course_id" value={c.course_id} />
                <Button type="submit" size="sm">
                  Approve
                </Button>
              </form>
              <form action={rejectClaimAction} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="course_id" value={c.course_id} />
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
    </main>
  );
}
