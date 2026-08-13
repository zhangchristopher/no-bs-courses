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
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in required
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Sign in with your course owner account to view your dashboard.
        </p>
        <Link href="/owner/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Your courses</h1>
        <Link
          href="/courses/new"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Add a course
        </Link>
      </div>

      {businessParam === "success" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Payment received. It can take a few seconds for Stripe to confirm — refresh this page
          if Registered Business still shows inactive.
        </p>
      )}
      {businessParam === "cancelled" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Checkout was cancelled. No charge was made — you can try again below.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
          Registered Business
        </h2>
        {!business || business.business_verification_status === "none" ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/owner/business" className="underline">
              Submit your business paperwork
            </Link>{" "}
            to become eligible to claim courses.
          </p>
        ) : business.business_verification_status === "pending" ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Your paperwork is awaiting admin review.
          </p>
        ) : business.business_verification_status === "rejected" ? (
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            Your paperwork was rejected.{" "}
            <Link href="/owner/business" className="underline">
              Resubmit
            </Link>
            .
          </p>
        ) : hasControl ? (
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
            ✓ Active — unlimited courses, editing control, and the Registered Business badge.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Business verified. You can claim one course for free. Subscribe for editing
              control, unlimited courses, and the badge.
            </p>
            <form action={startBusinessSubscriptionCheckoutAction}>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Subscribe — $99 + $50/mo
              </button>
            </form>
          </div>
        )}
      </section>

      {pendingListings.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Pending listing review
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {pendingListings.map((listing) => (
              <div
                key={listing.course_id}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
              >
                {listing.title} — awaiting admin content review.
              </div>
            ))}
          </div>
        </section>
      )}

      {pendingClaims.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Pending claim review
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {pendingClaims.map((claim) => (
              <Link
                key={claim.course_id}
                href={`/courses/${claim.slug}`}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:underline dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
              >
                {claim.title} — awaiting admin claim review.
              </Link>
            ))}
          </div>
        </section>
      )}

      {rejectedClaims.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Rejected claims
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {rejectedClaims.map((claim) => (
              <Link
                key={claim.course_id}
                href={`/courses/${claim.slug}`}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:underline dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              >
                {claim.title} — {claim.claim_rejection_reason} (click to appeal)
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">
          Owned courses
        </h2>
        {courses.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
                <div
                  key={course.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
                >
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {course.title}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {course.provider_name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
                        <>🔒 Get your affiliate link verified to unlock click analytics</>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    {hasControl ? (
                      <Link
                        href={`/owner/courses/${course.slug}/edit`}
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
                      >
                        Edit listing
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        No control — subscribe to edit
                      </span>
                    )}
                    {hasControl && (
                      <Link
                        href={`/owner/courses/${course.slug}/verify`}
                        className="text-xs text-zinc-500 underline dark:text-zinc-400"
                      >
                        {course.affiliate_link_status === "verified"
                          ? "✓ Verified Course — update affiliate link"
                          : course.affiliate_link_status === "pending"
                            ? "Affiliate link pending admin review"
                            : course.affiliate_link_status === "rejected"
                              ? "Affiliate link rejected — resubmit"
                              : "Add affiliate link for Verified Course"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
