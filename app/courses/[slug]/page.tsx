import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Breadcrumbs from "@/components/Breadcrumbs";
import StarRating from "@/components/StarRating";
import ReviewSection from "@/components/ReviewSection";
import TrackedSection from "@/components/TrackedSection";
import { RegisteredBusinessBadge, VerifiedCourseBadge } from "@/components/CourseBadges";
import { Button } from "@/components/ui/Button";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Card } from "@/components/ui/Card";
import { ArrowIcon, PlayIcon } from "@/components/icons";
import { categorySlug, getCourseBySlug } from "@/lib/courses";
import { getCourseModerationStatus } from "@/lib/verifications";
import { getReviewsForCourse, getUserReviewForCourse } from "@/lib/reviews";
import { getOwnedCourseCount } from "@/lib/ownerCourses";
import { getOwnerBusinessInfo } from "@/lib/business";
import { checkCourseAccess } from "@/lib/paywall";
import { getCourseSections, sectionTypeLabel } from "@/lib/courseSections";
import { logCoursePageView } from "@/lib/pageViews";
import { auth } from "@/auth";
import { ownerAuth } from "@/owner-auth";
import { getAdminSession } from "@/lib/admin";
import { claimCourseAction } from "./claim-actions";
import {
  spendBonusCreditAction,
  startCourseUnlockCheckoutAction,
  startCustomerPlanCheckoutAction,
} from "@/app/account/actions";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ error?: string; submitted?: string; unlocked?: string }>;

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + "…";
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return { title: "Course not found" };
  }

  const session = await auth();
  const ownerSession = await ownerAuth();
  const access = await checkCourseAccess(
    course.id,
    course.price,
    session?.user?.id ?? null,
    ownerSession?.user?.id ?? null
  );

  if (!access.unlocked) {
    return {
      title: course.title,
      description: `Pricing, description, and reviews for ${course.title} are available to signed-in members.`,
    };
  }

  return {
    title: `${course.title} by ${course.provider_name}`,
    description: course.description
      ? truncate(course.description, 160)
      : `${course.title} — a ${course.category ?? "course"} by ${course.provider_name}.`,
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { error, submitted, unlocked: unlockedParam } = await searchParams;
  const course = await getCourseBySlug(slug);
  const session = await auth();
  const ownerSession = await ownerAuth();

  if (!course) {
    // Not published — either it doesn't exist, or it's still awaiting
    // admin review. Only the person who submitted it, or an admin, gets a
    // "pending review" notice instead of the same 404 everyone else sees
    // (a pending listing's content shouldn't be discoverable by the public
    // just by guessing/visiting its slug).
    const moderation = await getCourseModerationStatus(slug);
    if (moderation && moderation.listing_status !== "published") {
      const adminSession = await getAdminSession();
      const isSubmitter =
        (session?.user?.id && moderation.added_by_user_id === session.user.id) ||
        (ownerSession?.user?.id && moderation.added_by_owner_id === ownerSession.user.id);

      if (isSubmitter || adminSession.authorized) {
        return (
          <main className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight text-ink dark:text-ink-dark">
              &ldquo;{moderation.title}&rdquo;
            </h1>
            <p className="mt-3 text-sm text-ink/60 dark:text-ink-dark/60">
              {moderation.listing_status === "rejected"
                ? "This submission was rejected by an admin and isn't public."
                : "This course is pending admin review and isn't public yet."}
            </p>
          </main>
        );
      }
    }
    notFound();
  }

  const access = await checkCourseAccess(
    course.id,
    course.price,
    session?.user?.id ?? null,
    ownerSession?.user?.id ?? null
  );
  const unlocked = access.unlocked;

  if (unlocked) {
    const requestHeaders = await headers();
    await logCoursePageView({
      courseId: course.id,
      userId: session?.user?.id ?? null,
      referrer: requestHeaders.get("referer"),
    });
  }

  const reviews = unlocked ? await getReviewsForCourse(course.id) : [];
  const myReview =
    unlocked && session?.user?.id ? await getUserReviewForCourse(course.id, session.user.id) : null;
  const sections = unlocked ? await getCourseSections(course.id) : [];

  const isVerifiedCourse = course.affiliate_link_status === "verified";
  const isRegisteredBusiness =
    course.owner_business_verification_status === "verified" &&
    course.owner_business_subscription_status === "active";
  const isOwnerOfThisCourse = Boolean(
    ownerSession?.user?.id && course.verified_owner_id === ownerSession.user.id && isVerifiedCourse
  );

  let claimEligibility: { canClaim: boolean; reason?: "business_required" | "cap_reached" } | null =
    null;
  if (course.verification_status === "unclaimed" && ownerSession?.user?.id) {
    const business = await getOwnerBusinessInfo(ownerSession.user.id);
    if (!business || business.business_verification_status !== "verified") {
      claimEligibility = { canClaim: false, reason: "business_required" };
    } else if (business.business_subscription_status !== "active") {
      const ownedCount = await getOwnedCourseCount(ownerSession.user.id);
      claimEligibility =
        ownedCount >= 1 ? { canClaim: false, reason: "cap_reached" } : { canClaim: true };
    } else {
      claimEligibility = { canClaim: true };
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          ...(course.category
            ? [{ label: course.category, href: `/courses/category/${categorySlug(course.category)}` }]
            : []),
          { label: course.title },
        ]}
      />

      {unlocked && course.thumbnail_url && (
        <div className="relative mt-6 h-56 w-full overflow-hidden bg-ink/5 sm:h-72 dark:bg-ink-dark/10">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="border border-hairline px-3 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-ink/70 dark:border-hairline-dark dark:text-ink-dark/70">
          {course.category ?? "Uncategorized"}
        </span>
        {course.verification_status !== "verified" && (
          <span className="border border-dashed border-ink/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-ink/70 dark:border-ink-dark/40 dark:text-ink-dark/70">
            {course.verification_status}
          </span>
        )}
        {isRegisteredBusiness && <RegisteredBusinessBadge />}
        {isVerifiedCourse && <VerifiedCourseBadge />}
      </div>

      {submitted && (
        <StatusBanner tone="success">
          Your claim has been submitted for admin review. We&apos;ll email you once it&apos;s
          decided.
        </StatusBanner>
      )}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      {course.verification_status === "pending" &&
        ownerSession?.user?.id === course.verified_owner_id && (
          <StatusBanner tone="warning">Your claim on this course is awaiting admin review.</StatusBanner>
        )}

      {course.verification_status === "unclaimed" &&
        ownerSession?.user?.id === course.claim_rejection_owner_id &&
        course.claim_rejection_reason && (
          <StatusBanner tone="error">
            Your claim on this course was rejected: {course.claim_rejection_reason}. You can
            claim it again below to appeal.
          </StatusBanner>
        )}

      {course.verification_status === "unclaimed" && (
        <div className="mt-4 text-sm text-ink/60 dark:text-ink-dark/60">
          {!ownerSession?.user?.id ? (
            <>
              Are you the creator of this course?{" "}
              <Link href="/owner/signin" className="underline">
                Sign in as an owner
              </Link>{" "}
              to claim it.
            </>
          ) : claimEligibility?.reason === "business_required" ? (
            <>
              Are you the creator?{" "}
              <Link href="/owner/business" className="underline">
                Complete business verification
              </Link>{" "}
              to claim this course.
            </>
          ) : claimEligibility?.reason === "cap_reached" ? (
            <>
              Are you the creator?{" "}
              <Link href="/owner/dashboard" className="underline">
                Subscribe to Registered Business
              </Link>{" "}
              to claim more than one course.
            </>
          ) : (
            <form action={claimCourseAction} className="flex items-center gap-2">
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="slug" value={course.slug} />
              <input type="hidden" name="category" value={course.category ?? ""} />
              <input type="hidden" name="title" value={course.title} />
              <span>Are you the creator of this course?</span>
              <button type="submit" className="underline">
                Claim this course
              </button>
            </form>
          )}
        </div>
      )}

      <h1 className="mt-3 text-3xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        {course.title}
      </h1>

      {access.unlocked ? (
        <>
          <div className="mt-2">
            <StarRating score={course.overall_score} reviewCount={course.total_reviews} />
          </div>
          <p className="mt-1 text-ink/60 dark:text-ink-dark/60">by {course.provider_name}</p>

          <Button href={`/go/${course.slug}`} target="_blank" rel="noopener noreferrer" className="group mt-4">
            Go to course
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="mt-6 grid grid-cols-2 gap-4 border border-hairline p-4 sm:grid-cols-3 dark:border-hairline-dark">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                Price
              </div>
              <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                <span className="font-medium text-ink dark:text-ink-dark">
                  {course.price ? `$${course.price}` : "N/A"}
                </span>
                {course.compare_at_price &&
                  course.price &&
                  Number(course.compare_at_price) > Number(course.price) && (
                    <span className="text-sm text-ink/40 line-through dark:text-ink-dark/40">
                      ${course.compare_at_price}
                    </span>
                  )}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                Duration
              </div>
              <div className="mt-1 font-medium tabular-nums text-ink dark:text-ink-dark">
                {course.duration_hours ? `${course.duration_hours} hours` : "N/A"}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                Prerequisites
              </div>
              <div className="mt-1 font-medium text-ink dark:text-ink-dark">
                {course.prerequisites || "None listed"}
              </div>
            </div>
          </div>

          {course.description && (
            <section className="mt-8">
              <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-ink/75 dark:text-ink-dark/75">
                {course.description}
              </p>
            </section>
          )}

          {course.syllabus && (
            <section className="mt-8">
              <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
                Syllabus
              </h2>
              <p className="mt-2 whitespace-pre-line text-ink/75 dark:text-ink-dark/75">
                {course.syllabus}
              </p>
            </section>
          )}

          {sections.map((section) => (
            <TrackedSection
              key={section.id}
              courseId={course.id}
              sectionId={section.id}
              className="mt-8"
            >
              <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
                {sectionTypeLabel(section.section_type)}
              </h2>
              <p className="mt-2 whitespace-pre-line text-ink/75 dark:text-ink-dark/75">
                {section.content}
              </p>
              {section.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary owner-supplied URLs, not in next/image's remotePatterns allowlist
                <img
                  src={section.image_url}
                  alt={sectionTypeLabel(section.section_type)}
                  className="mt-3 max-h-80 w-full object-cover"
                />
              )}
              {section.video_url && (
                <a
                  href={section.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline"
                >
                  <PlayIcon className="h-4 w-4" /> Watch video
                </a>
              )}
            </TrackedSection>
          ))}

          {unlockedParam && (
            <StatusBanner tone="success">
              Payment received — it can take a few seconds for Stripe to confirm. Refresh if this
              still shows locked.
            </StatusBanner>
          )}

          <ReviewSection
            courseId={course.id}
            slug={course.slug}
            category={course.category}
            providerName={course.provider_name}
            reviews={reviews}
            myReview={myReview}
            currentUserId={session?.user?.id ?? null}
            isSignedIn={Boolean(session?.user?.id)}
            isOwnerOfThisCourse={isOwnerOfThisCourse}
            error={error}
          />
        </>
      ) : (
        <Card className="mt-6 text-center">
          <p className="text-sm text-ink/60 dark:text-ink-dark/60">
            Pricing, description, syllabus, rating, and reviews for this course are locked.
          </p>
          {access.reason === "signin_required" ? (
            <p className="mt-3 text-sm">
              <Link href="/signin" className="underline">
                Sign in
              </Link>{" "}
              to view — free accounts get 3 paid courses unlocked per month.
            </p>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-2">
              {access.bonusCredits > 0 && (
                <form action={spendBonusCreditAction}>
                  <input type="hidden" name="course_id" value={course.id} />
                  <input type="hidden" name="slug" value={course.slug} />
                  <Button type="submit" variant="secondary" size="sm">
                    Use 1 bonus credit ({access.bonusCredits} available)
                  </Button>
                </form>
              )}
              <form action={startCourseUnlockCheckoutAction}>
                <input type="hidden" name="course_id" value={course.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <Button type="submit" size="sm">
                  Unlock this course — $0.99
                </Button>
              </form>
              <form action={startCustomerPlanCheckoutAction}>
                <button type="submit" className="text-sm underline">
                  Or upgrade to unlimited — $5/mo
                </button>
              </form>
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
