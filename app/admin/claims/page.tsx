import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingClaims } from "@/lib/ownerCourses";
import { approveClaimAction, rejectClaimAction } from "./actions";

export const metadata: Metadata = { title: "Course Claims" };

export default async function AdminClaimsPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Course Claims</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {pending.length} pending claim{pending.length === 1 ? "" : "s"}. Signed in as{" "}
        {session.email}. Business paperwork is reviewed separately at{" "}
        <Link href="/admin/businesses" className="underline">
          Business Verifications
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending claims.</p>
        )}
        {pending.map((c) => (
          <div key={c.course_id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              <Link href={`/courses/${c.slug}`} className="underline">
                {c.title}
              </Link>
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Provider: {c.provider_name}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Claimed by: {c.owner_name || "(no name)"} &lt;{c.owner_email}&gt;
            </p>

            <div className="mt-4 flex flex-wrap items-start gap-3">
              <form action={approveClaimAction}>
                <input type="hidden" name="course_id" value={c.course_id} />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Approve
                </button>
              </form>
              <form action={rejectClaimAction} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="course_id" value={c.course_id} />
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
    </main>
  );
}
