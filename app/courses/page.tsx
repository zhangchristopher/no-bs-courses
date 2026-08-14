import Link from "next/link";
import type { Metadata } from "next";
import {
  categorySlug,
  getAllCategories,
  getCoursesByCategory,
  sortCourseList,
  isCourseSort,
  COURSE_SORT_OPTIONS,
} from "@/lib/courses";
import CourseCard from "@/components/CourseCard";

type SearchParams = Promise<{ q?: string; sort?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;

  if (q) {
    return {
      title: `Search results for "${q}"`,
      description: `Courses matching "${q}" across web development, data science, and design.`,
    };
  }

  const categories = await getAllCategories();
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const names = categories.map((c) => c.category).join(", ");

  return {
    title: "Browse Courses",
    description: `Browse ${total} courses across ${names}, with pricing, duration, and prerequisites from each provider.`,
  };
}

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, sort: sortParam } = await searchParams;
  const sort = isCourseSort(sortParam) ? sortParam : "featured";
  const categories = await getCoursesByCategory(q);
  const total = categories.reduce((sum, [, courses]) => sum + courses.length, 0);

  // A chosen sort ranks courses across all categories together, so it
  // replaces the per-category grouping with a single flat, ranked grid.
  const flatSorted =
    sort !== "featured"
      ? sortCourseList(
          categories.flatMap(([, courses]) => courses),
          sort
        )
      : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Browse Courses
      </h1>

      <form action="/courses" method="get" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by title, provider, or category..."
          className="w-full max-w-md rounded-md border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Sort by:</span>
        {COURSE_SORT_OPTIONS.map((opt) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (opt.value !== "featured") params.set("sort", opt.value);
          const href = params.toString() ? `/courses?${params.toString()}` : "/courses";
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

      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        {q ? (
          <>
            {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;.{" "}
            <Link href="/courses" className="underline">
              Clear search
            </Link>
          </>
        ) : (
          <>
            {total} courses across {categories.length} categories.
          </>
        )}
      </p>

      {categories.length === 0 && (
        <p className="mt-10 text-zinc-500 dark:text-zinc-400">
          No courses matched your search. Try a different title, provider, or category.
        </p>
      )}

      {flatSorted ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flatSorted.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-12">
          {categories.map(([category, courses]) => (
            <section key={category}>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                <Link href={`/courses/category/${categorySlug(category)}`} className="hover:underline">
                  {category}
                </Link>
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
