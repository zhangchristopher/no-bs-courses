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
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      {course.thumbnail_url ? (
        <div className="relative h-36 w-full bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-36 w-full bg-zinc-100 dark:bg-zinc-800" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
          {course.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{course.provider_name}</p>
        <TierBadge course={course} />
        <StarRating score={course.overall_score} reviewCount={course.total_reviews} />
        {course.description && (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="flex items-baseline gap-1.5">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {course.price ? `$${course.price}` : "Price N/A"}
            </span>
            {course.compare_at_price &&
              course.price &&
              Number(course.compare_at_price) > Number(course.price) && (
                <span className="text-xs text-zinc-400 line-through dark:text-zinc-500">
                  ${course.compare_at_price}
                </span>
              )}
          </span>
          {course.duration_hours && (
            <span className="text-zinc-500 dark:text-zinc-400">{course.duration_hours}h</span>
          )}
        </div>
      </div>
    </Link>
  );
}
