import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnedVerifiedCourse } from "@/lib/ownerCourses";
import { getCourseAnalytics } from "@/lib/courseAnalytics";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = { title: "Course Analytics" };

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function CourseAnalyticsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await ownerAuth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in required
        </h1>
        <Link href="/owner/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  // Only returns a row once affiliate_link_status = 'verified' — ownership
  // alone isn't enough, matching how the rest of Verified Course works.
  const course = await getOwnedVerifiedCourse(slug, session.user.id);
  if (!course) notFound();

  const analytics = await getCourseAnalytics(course.id);
  const maxDailyClicks = Math.max(1, ...analytics.dailyClicks.map((d) => d.count));

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/owner/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        &larr; Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Analytics — &ldquo;{course.title}&rdquo;
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">Views (30d)</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {analytics.views30d}
          </div>
        </div>
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">Clicks (30d)</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {analytics.clicks30d}
          </div>
        </div>
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">CTR</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {analytics.ctr !== null ? `${analytics.ctr}%` : "—"}
          </div>
        </div>
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
            Unique visitors (30d)
          </div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {analytics.uniqueVisitors30d}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        CTR = clicks ÷ views. Unique visitors counts distinct signed-in accounts only —
        anonymous visits can&apos;t be deduplicated without additional tracking.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Clicks, last 7 days
        </h2>
        {analytics.dailyClicks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No clicks yet.</p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-3">
            {analytics.dailyClicks.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-zinc-900 dark:bg-zinc-50"
                  style={{ height: `${(d.count / maxDailyClicks) * 100}%`, minHeight: 4 }}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{d.count}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatDay(d.date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Top traffic sources, last 30 days
        </h2>
        {analytics.topReferrers.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No click data yet.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-1">
            {analytics.topReferrers.map((r) => (
              <div
                key={r.source}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <span className="text-zinc-700 dark:text-zinc-300">{r.source}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Reviews</h2>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">Total</div>
            <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {analytics.totalReviews}
            </div>
          </div>
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">Average rating</div>
            <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {analytics.averageRating !== null ? analytics.averageRating.toFixed(1) : "—"}
            </div>
          </div>
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
              Purchase-verified
            </div>
            <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {analytics.verifiedPurchaseReviews}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Highest-converting sections
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Of visitors who clicked into a section, the % who also clicked &ldquo;Go to
          course&rdquo; (matched by account for signed-in visitors, or a first-party visitor
          cookie for signed-out ones).
        </p>
        {analytics.sectionConversions.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No section clicks yet.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-1">
            {analytics.sectionConversions.map((s) => (
              <div
                key={s.sectionType}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <span className="text-zinc-700 dark:text-zinc-300">{s.label}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {s.convertedVisitors}/{s.engagedVisitors} visitors
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {s.conversionRate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-md border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Not tracked yet
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Conversion rate (CVR)</strong> — we have no signal from your platform about
            whether a click actually became a purchase. &ldquo;Purchase-verified&rdquo; above and
            section conversion below track clicks and reviews, not confirmed sales.
          </li>
        </ul>
      </section>
    </main>
  );
}
