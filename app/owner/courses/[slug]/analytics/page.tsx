import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnedVerifiedCourse } from "@/lib/ownerCourses";
import { getCourseAnalytics } from "@/lib/courseAnalytics";
import { AuthShell } from "@/components/ui/AuthShell";
import { Card } from "@/components/ui/Card";
import { ArrowIcon } from "@/components/icons";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = { title: "Course Analytics" };

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tabular-nums text-ink dark:text-ink-dark">{value}</div>
    </Card>
  );
}

export default async function CourseAnalyticsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await ownerAuth();

  if (!session?.user?.id) {
    return (
      <AuthShell title="Sign in required" maxWidthClassName="max-w-2xl">
        <Link href="/owner/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
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
      <Link
        href="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:underline dark:text-ink-dark/55"
      >
        <ArrowIcon direction="left" className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Analytics — &ldquo;{course.title}&rdquo;
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Views (30d)" value={analytics.views30d} />
        <StatTile label="Clicks (30d)" value={analytics.clicks30d} />
        <StatTile label="CTR" value={analytics.ctr !== null ? `${analytics.ctr}%` : "—"} />
        <StatTile label="Unique visitors (30d)" value={analytics.uniqueVisitors30d} />
      </div>
      <p className="mt-2 text-xs text-ink/50 dark:text-ink-dark/50">
        CTR = clicks ÷ views. Unique visitors counts distinct signed-in accounts only —
        anonymous visits can&apos;t be deduplicated without additional tracking.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
          Clicks, last 7 days
        </h2>
        {analytics.dailyClicks.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50 dark:text-ink-dark/50">No clicks yet.</p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-3">
            {analytics.dailyClicks.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full bg-ink dark:bg-ink-dark"
                  style={{ height: `${(d.count / maxDailyClicks) * 100}%`, minHeight: 4 }}
                />
                <span className="text-xs tabular-nums text-ink/50 dark:text-ink-dark/50">{d.count}</span>
                <span className="text-xs text-ink/40 dark:text-ink-dark/40">{formatDay(d.date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
          Top traffic sources, last 30 days
        </h2>
        {analytics.topReferrers.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50 dark:text-ink-dark/50">No click data yet.</p>
        ) : (
          <div className="mt-2 flex flex-col gap-1">
            {analytics.topReferrers.map((r) => (
              <div
                key={r.source}
                className="flex items-center justify-between border border-hairline px-3 py-2 text-sm dark:border-hairline-dark"
              >
                <span className="text-ink/75 dark:text-ink-dark/75">{r.source}</span>
                <span className="font-medium tabular-nums text-ink dark:text-ink-dark">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">Reviews</h2>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <StatTile label="Total" value={analytics.totalReviews} />
          <StatTile
            label="Average rating"
            value={analytics.averageRating !== null ? analytics.averageRating.toFixed(1) : "—"}
          />
          <StatTile label="Purchase-verified" value={analytics.verifiedPurchaseReviews} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
          Highest-converting sections
        </h2>
        <p className="mt-1 text-xs text-ink/50 dark:text-ink-dark/50">
          Of visitors who clicked into a section, the % who also clicked &ldquo;Go to
          course&rdquo; (matched by account for signed-in visitors, or a first-party visitor
          cookie for signed-out ones).
        </p>
        {analytics.sectionConversions.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50 dark:text-ink-dark/50">No section clicks yet.</p>
        ) : (
          <div className="mt-2 flex flex-col gap-1">
            {analytics.sectionConversions.map((s) => (
              <div
                key={s.sectionType}
                className="flex items-center justify-between border border-hairline px-3 py-2 text-sm tabular-nums dark:border-hairline-dark"
              >
                <span className="text-ink/75 dark:text-ink-dark/75">{s.label}</span>
                <span className="text-ink/50 dark:text-ink-dark/50">
                  {s.convertedVisitors}/{s.engagedVisitors} visitors
                </span>
                <span className="font-medium text-ink dark:text-ink-dark">{s.conversionRate}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Card tone="warning" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-eyebrow text-ink/70 dark:text-ink-dark/70">
          Not tracked yet
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/60 dark:text-ink-dark/60">
          <li>
            <strong>Conversion rate (CVR)</strong> — we have no signal from your platform about
            whether a click actually became a purchase. &ldquo;Purchase-verified&rdquo; above and
            section conversion below track clicks and reviews, not confirmed sales.
          </li>
        </ul>
      </Card>
    </main>
  );
}
