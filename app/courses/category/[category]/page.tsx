import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CourseCard from "@/components/CourseCard";
import {
  getCategoryBySlug,
  getCoursesForCategory,
  sortCourseList,
  isCourseSort,
  COURSE_SORT_OPTIONS,
} from "@/lib/courses";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{ sort?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category: slug } = await params;
  const match = await getCategoryBySlug(slug);

  if (!match) {
    return { title: "Category not found" };
  }

  return {
    title: `Best ${match.category} Courses`,
    description: `Compare ${match.count} ${match.category} course${
      match.count === 1 ? "" : "s"
    } from different providers, with pricing, duration, and prerequisites side by side.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category: slug } = await params;
  const { sort: sortParam } = await searchParams;
  const sort = isCourseSort(sortParam) ? sortParam : "featured";
  const match = await getCategoryBySlug(slug);

  if (!match) notFound();

  const courses = sortCourseList(await getCoursesForCategory(match.category), sort);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Courses", href: "/courses" }, { label: match.category }]}
      />

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Best {match.category} Courses
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {match.count} course{match.count === 1 ? "" : "s"} in {match.category}.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Sort by:</span>
        {COURSE_SORT_OPTIONS.map((opt) => {
          const href =
            opt.value === "featured"
              ? `/courses/category/${slug}`
              : `/courses/category/${slug}?sort=${opt.value}`;
          const active = opt.value === sort;
          return (
            <Link
              key={opt.value}
              href={href}
              className={
                active
                  ? "rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  );
}
