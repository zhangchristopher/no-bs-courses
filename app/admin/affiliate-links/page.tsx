import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingAffiliateLinks } from "@/lib/affiliateLinkVerifications";
import { approveAffiliateLinkAction, rejectAffiliateLinkAction } from "./actions";

export const metadata: Metadata = { title: "Affiliate Link Verifications" };

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminAffiliateLinksPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to view affiliate link verifications."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const pending = await getPendingAffiliateLinks();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Affiliate Link Verifications
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {pending.length} pending submission{pending.length === 1 ? "" : "s"}. Signed in as{" "}
        {session.email}. Approving activates the Verified Course badge, click analytics, review
        responses, and switches /go/ redirects to this affiliate link.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {pending.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending submissions.</p>
        )}
        {pending.map((link) => (
          <div
            key={link.course_id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/courses/${link.slug}`}
                target="_blank"
                className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
              >
                {link.title}
              </Link>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Signed {formatDate(link.contract_signed_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Owner: {link.owner_name || "(no name)"} &lt;{link.owner_email}&gt;
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Signed as: {link.contract_signed_name}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Official platform URL
                </div>
                <a
                  href={link.platform_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-zinc-700 underline dark:text-zinc-300"
                >
                  {link.platform_url}
                </a>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Submitted affiliate URL
                </div>
                <a
                  href={link.affiliate_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-zinc-700 underline dark:text-zinc-300"
                >
                  {link.affiliate_url}
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={approveAffiliateLinkAction}>
                <input type="hidden" name="course_id" value={link.course_id} />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Approve
                </button>
              </form>
              <form action={rejectAffiliateLinkAction} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="course_id" value={link.course_id} />
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
