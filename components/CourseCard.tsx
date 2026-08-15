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

export default function CourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col border border-hairline bg-cream transition-colors hover:border-ink dark:border-hairline-dark dark:bg-cream-dark dark:hover:border-ink-dark"
    >
      {course.thumbnail_url ? (
        <div className="relative h-36 w-full bg-ink/5 dark:bg-ink-dark/10">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        // No real thumbnail from the provider — a bold typographic tile
        // beats either a blank box or a random stock photo that isn't
        // actually the course.
        <div className="flex h-36 w-full items-center justify-center bg-ink p-4 dark:bg-ink-dark">
          <p className="line-clamp-3 text-center font-headline text-lg font-black uppercase leading-tight tracking-tight text-cream dark:text-cream-dark">
            {course.title}
          </p>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-ink group-hover:underline dark:text-ink-dark">
          {course.title}
        </h3>
        <p className="text-sm text-ink/55 dark:text-ink-dark/55">{course.provider_name}</p>
        <TierBadge course={course} />
        <StarRating score={course.overall_score} reviewCount={course.total_reviews} />
        {course.description && (
          <p className="line-clamp-2 text-sm text-ink/60 dark:text-ink-dark/60">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm tabular-nums">
          <span className="flex items-baseline gap-1.5">
            <span className="font-medium text-ink dark:text-ink-dark">
              {course.price ? `$${course.price}` : "Price N/A"}
            </span>
            {course.compare_at_price &&
              course.price &&
              Number(course.compare_at_price) > Number(course.price) && (
                <span className="text-xs text-ink/40 line-through dark:text-ink-dark/40">
                  ${course.compare_at_price}
                </span>
              )}
          </span>
          {course.duration_hours && (
            <span className="text-ink/55 dark:text-ink-dark/55">{course.duration_hours}h</span>
          )}
        </div>
      </div>
    </Link>
  );
}
