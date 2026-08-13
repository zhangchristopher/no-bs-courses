import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getUnresolvedReviewFlags, getRecentReviewsForCourse } from "@/lib/reviewFlags";
import { resolveReviewFlagAction } from "./actions";

export const metadata: Metadata = { title: "Review Flags" };

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminFlagsPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to view flagged reviews."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const flags = await getUnresolvedReviewFlags();
  const recentReviewsByCourse = await Promise.all(
    flags.map((flag) => getRecentReviewsForCourse(flag.course_id))
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Review Flags</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {flags.length} unresolved flag{flags.length === 1 ? "" : "s"} — courses that received 5+
        reviews within a 24-hour window. Flags never hide reviews or block a course automatically;
        this is only a signal for you to look closer.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {flags.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No unresolved flags.</p>
        )}
        {flags.map((flag, i) => (
          <div
            key={flag.id}
            className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/courses/${flag.course_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-900 underline dark:text-zinc-50"
              >
                {flag.course_title}
              </Link>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Flagged {formatDate(flag.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              {flag.flag_reason} ({formatDate(flag.window_start)} – {formatDate(flag.window_end)})
            </p>

            <div className="mt-3 rounded-lg bg-white p-3 dark:bg-zinc-900">
              <div className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Recent reviews
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {recentReviewsByCourse[i].map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-zinc-100 pb-2 text-sm last:border-0 last:pb-0 dark:border-zinc-800"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>{" "}
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {review.reviewer_display_name ?? "Anonymous"} · {formatDate(review.created_at)}
                    </span>
                    {review.review_text && (
                      <p className="mt-1 text-zinc-700 dark:text-zinc-300">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form action={resolveReviewFlagAction} className="mt-4">
              <input type="hidden" name="flag_id" value={flag.id} />
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Mark reviewed
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
