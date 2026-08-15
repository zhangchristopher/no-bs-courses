import Link from "next/link";
import type { Metadata } from "next";
import { ownerAuth } from "@/owner-auth";
import {
  getCoursesOwnedBy,
  getOwnerPendingListings,
  getOwnerPendingClaims,
  getOwnerRejectedClaims,
} from "@/lib/ownerCourses";
import { getOwnerBusinessInfo } from "@/lib/business";
import { getClickCounts } from "@/lib/affiliateClicks";
import { startBusinessSubscriptionCheckoutAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckMarkIcon, LockIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Owner Dashboard" };

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; business?: string }>;
}) {
  const { error, business: businessParam } = await searchParams;
  const session = await ownerAuth();

  if (!session?.user?.id) {
    return (
      <AuthShell title="Sign in required" maxWidthClassName="max-w-2xl">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          Sign in with your course owner account to view your dashboard.
        </p>
        <Link href="/owner/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  const [courses, pendingListings, pendingClaims, rejectedClaims, business] = await Promise.all([
    getCoursesOwnedBy(session.user.id),
    getOwnerPendingListings(session.user.id),
    getOwnerPendingClaims(session.user.id),
    getOwnerRejectedClaims(session.user.id),
    getOwnerBusinessInfo(session.user.id),
  ]);

  const clickCounts = await getClickCounts(courses.map((c) => c.id));
  const hasControl = business?.business_subscription_status === "active";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Your courses
        </h1>
        <Button href="/courses/new" variant="secondary" size="sm">
          Add a course
        </Button>
      </div>

      {businessParam === "success" && (
        <StatusBanner tone="success">
          Payment received. It can take a few seconds for Stripe to confirm — refresh this page
          if Registered Business still shows inactive.
        </StatusBanner>
      )}
      {businessParam === "cancelled" && (
        <StatusBanner tone="warning">
          Checkout was cancelled. No charge was made — you can try again below.
        </StatusBanner>
      )}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <Card className="mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
          Registered Business
        </h2>
        {!business || business.business_verification_status === "none" ? (
          <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
            <Link href="/owner/business" className="underline">
              Submit your business paperwork
            </Link>{" "}
            to become eligible to claim courses.
          </p>
        ) : business.business_verification_status === "pending" ? (
          <p className="mt-2 text-sm text-ink/70 dark:text-ink-dark/70">
            Your paperwork is awaiting admin review.
          </p>
        ) : business.business_verification_status === "rejected" ? (
          <p className="mt-2 text-sm text-ink dark:text-ink-dark">
            Your paperwork was rejected.{" "}
            <Link href="/owner/business" className="underline">
              Resubmit
            </Link>
            .
          </p>
        ) : hasControl ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
            <CheckMarkIcon className="h-4 w-4 shrink-0" />
            Active — unlimited courses, editing control, and the Registered Business badge.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink/60 dark:text-ink-dark/60">
              Business verified. You can claim one course for free. Subscribe for editing
              control, unlimited courses, and the badge.
            </p>
            <form action={startBusinessSubscriptionCheckoutAction}>
              <Button type="submit" size="sm" className="shrink-0">
                Subscribe — $99 + $50/mo
              </Button>
            </form>
          </div>
        )}
      </Card>

      {pendingListings.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
            Pending listing review
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {pendingListings.map((listing) => (
              <Card key={listing.course_id} tone="warning" className="text-sm text-ink/70 dark:text-ink-dark/70">
                {listing.title} — awaiting admin content review.
              </Card>
            ))}
          </div>
        </section>
      )}

      {pendingClaims.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
            Pending claim review
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {pendingClaims.map((claim) => (
              <Link key={claim.course_id} href={`/courses/${claim.slug}`}>
                <Card tone="warning" className="text-sm text-ink/70 hover:underline dark:text-ink-dark/70">
                  {claim.title} — awaiting admin claim review.
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {rejectedClaims.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
            Rejected claims
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {rejectedClaims.map((claim) => (
              <Link key={claim.course_id} href={`/courses/${claim.slug}`}>
                <Card tone="danger" className="text-sm text-ink hover:underline dark:text-ink-dark">
                  {claim.title} — {claim.claim_rejection_reason} (click to appeal)
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
          Owned courses
        </h2>
        {courses.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50 dark:text-ink-dark/50">
            You don&apos;t own any courses yet.{" "}
            <Link href="/courses" className="underline">
              Browse courses
            </Link>{" "}
            to find and claim yours.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-3">
            {courses.map((course) => {
              const isVerifiedCourse = course.affiliate_link_status === "verified";
              const clicks = clickCounts.get(course.id) ?? 0;

              return (
                <Card key={course.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-ink dark:text-ink-dark">{course.title}</div>
                    <div className="text-sm text-ink/55 dark:text-ink-dark/55">{course.provider_name}</div>
                    <div className="mt-1 text-xs tabular-nums text-ink/55 dark:text-ink-dark/55">
                      {isVerifiedCourse ? (
                        <>
                          {clicks} click{clicks === 1 ? "" : "s"} in the last 30 days ·{" "}
                          <Link
                            href={`/owner/courses/${course.slug}/analytics`}
                            className="underline"
                          >
                            View detailed analytics
                          </Link>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <LockIcon className="h-3.5 w-3.5" /> Get your affiliate link verified to unlock click analytics
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    {hasControl ? (
                      <Button href={`/owner/courses/${course.slug}/edit`} variant="secondary" size="sm">
                        Edit listing
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-ink/70 dark:text-ink-dark/70">
                        <LockIcon className="h-3.5 w-3.5" /> No control — subscribe to edit
                      </span>
                    )}
                    {hasControl && (
                      <Link
                        href={`/owner/courses/${course.slug}/verify`}
                        className="inline-flex items-center gap-1 text-xs text-ink/55 underline dark:text-ink-dark/55"
                      >
                        {course.affiliate_link_status === "verified" ? (
                          <>
                            <CheckMarkIcon className="h-3 w-3 shrink-0" /> Verified Course — update affiliate link
                          </>
                        ) : course.affiliate_link_status === "pending" ? (
                          "Affiliate link pending admin review"
                        ) : course.affiliate_link_status === "rejected" ? (
                          "Affiliate link rejected — resubmit"
                        ) : (
                          "Add affiliate link for Verified Course"
                        )}
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
