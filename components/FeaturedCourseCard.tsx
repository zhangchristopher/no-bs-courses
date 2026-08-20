import Link from "next/link";
import Image from "next/image";
import type { CourseListItem } from "@/lib/courses";
import StarRating from "@/components/StarRating";
import { RegisteredBusinessBadge, VerifiedCourseBadge } from "@/components/CourseBadges";

function TierBadge({ course }: { course: CourseListItem }) {
  if (course.affiliate_link_status === "verified") return <VerifiedCourseBadge size="sm" />;
  if (course.owner_business_subscription_status === "active")
    return <RegisteredBusinessBadge size="sm" />;
  return null;
}

// Admin-picked, not ranked — same card language as CourseCard, just laid
// out wider and given an eyebrow so it reads as a deliberate editorial pick
// rather than "just the first result."
export default function FeaturedCourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group grid grid-cols-1 border border-hairline bg-cream transition-colors hover:border-ink dark:border-hairline-dark dark:bg-cream-dark dark:hover:border-ink-dark sm:grid-cols-[1.1fr_1fr]"
    >
      {course.thumbnail_url ? (
        <div className="relative h-48 w-full bg-ink/5 dark:bg-ink-dark/10 sm:h-full">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-ink p-6 dark:bg-ink-dark sm:h-full">
          <p className="line-clamp-4 text-center font-headline text-2xl font-black uppercase leading-tight tracking-tight text-cream dark:text-cream-dark">
            {course.title}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2 p-6 sm:p-8">
        <span className="text-[11px] font-bold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
          Featured
        </span>
        <h3 className="text-xl font-black uppercase tracking-tight text-ink group-hover:underline dark:text-ink-dark">
          {course.title}
        </h3>
        <p className="text-sm text-ink/55 dark:text-ink-dark/55">{course.provider_name}</p>
        <TierBadge course={course} />
        <StarRating score={course.overall_score} reviewCount={course.total_reviews} />
        {course.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-ink/60 dark:text-ink-dark/60">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-4 pt-2 text-sm tabular-nums">
          <span className="font-medium text-ink dark:text-ink-dark">
            {course.price == null
              ? "Price N/A"
              : Number(course.price) === 0
                ? "Free"
                : `$${course.price}`}
          </span>
          {course.duration_hours && (
            <span className="text-ink/55 dark:text-ink-dark/55">{course.duration_hours}h</span>
          )}
          {course.platform && (
            <span className="text-ink/55 dark:text-ink-dark/55">{course.platform}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
