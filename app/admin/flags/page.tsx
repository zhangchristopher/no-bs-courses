import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getUnresolvedReviewFlags, getRecentReviewsForCourse } from "@/lib/reviewFlags";
import { resolveReviewFlagAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Stars from "@/components/Stars";

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
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Not authorized
        </h1>
        <p className="mt-2 text-ink/60 dark:text-ink-dark/60">
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
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Review Flags
      </h1>
      <p className="mt-2 text-sm tabular-nums text-ink/60 dark:text-ink-dark/60">
        {flags.length} unresolved flag{flags.length === 1 ? "" : "s"} — courses that received 5+
        reviews within a 24-hour window. Flags never hide reviews or block a course automatically;
        this is only a signal for you to look closer.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {flags.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">No unresolved flags.</p>
        )}
        {flags.map((flag, i) => (
          <Card key={flag.id} tone="warning">
            <div className="flex items-center justify-between">
              <Link
                href={`/courses/${flag.course_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline dark:text-ink-dark"
              >
                {flag.course_title}
              </Link>
              <span className="text-xs tabular-nums text-ink/50 dark:text-ink-dark/50">
                Flagged {formatDate(flag.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/70 dark:text-ink-dark/70">
              {flag.flag_reason} ({formatDate(flag.window_start)} – {formatDate(flag.window_end)})
            </p>

            <div className="mt-3 border border-hairline bg-cream p-3 dark:border-hairline-dark dark:bg-cream-dark">
              <div className="text-xs font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                Recent reviews
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {recentReviewsByCourse[i].map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-hairline pb-2 text-sm last:border-0 last:pb-0 dark:border-hairline-dark"
                  >
                    <Stars rating={review.rating} />{" "}
                    <span className="text-ink/50 dark:text-ink-dark/50">
                      {review.reviewer_display_name ?? "Anonymous"} · {formatDate(review.created_at)}
                    </span>
                    {review.review_text && (
                      <p className="mt-1 text-ink/75 dark:text-ink-dark/75">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form action={resolveReviewFlagAction} className="mt-4">
              <input type="hidden" name="flag_id" value={flag.id} />
              <Button type="submit" variant="secondary" size="sm">
                Mark reviewed
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </main>
  );
}
