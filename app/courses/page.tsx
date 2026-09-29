import Link from "next/link";
import type { Metadata } from "next";
import {
  categorySlug,
  getAllCategories,
  getCategoryFeaturedCourses,
  getCategoryMenuItems,
  getCoursesByCategory,
  getTopRatedCourses,
  sortCourseList,
  isCourseSort,
  COURSE_SORT_OPTIONS,
  type CourseListItem,
} from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import BrowseRow from "@/components/BrowseRow";
import CategoryMenu from "@/components/CategoryMenu";
import { Button } from "@/components/ui/Button";

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

// The category's admin pick leads its row, flagged as featured; everything
// else keeps its existing order behind it.
function withFeaturedFirst(courses: CourseListItem[], featured: CourseListItem | undefined) {
  if (!featured || !courses.some((c) => c.id === featured.id)) {
    return { featuredId: null, courses };
  }
  return {
    featuredId: featured.id,
    courses: [
      courses.find((c) => c.id === featured.id)!,
      ...courses.filter((c) => c.id !== featured.id),
    ],
  };
}

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, sort: sortParam } = await searchParams;
  const sort = isCourseSort(sortParam) ? sortParam : "featured";
  const [categories, featuredByCategory, menuCategories, topRated] = await Promise.all([
    getCoursesByCategory(q),
    getCategoryFeaturedCourses(),
    getCategoryMenuItems(),
    // Only the unfiltered browse view leads with a top-rated row — on a
    // search or a chosen sort it would just repeat the results below it.
    !q && sort === "featured" ? getTopRatedCourses(12) : Promise.resolve([]),
  ]);
  const total = categories.reduce((sum, [, courses]) => sum + courses.length, 0);

  // A chosen sort ranks courses across all categories together, so it
  // replaces the per-category rows with a single flat, ranked grid.
  const flatSorted =
    sort !== "featured"
      ? sortCourseList(
          categories.flatMap(([, courses]) => courses),
          sort
        )
      : null;

  return (
    <main className="flex flex-1 flex-col pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black uppercase tracking-headline text-ink-dark sm:text-5xl">
          Browse Courses
        </h1>

        <div className="mt-6 flex max-w-2xl items-stretch gap-2">
          <div className="flex flex-1">
            {menuCategories.length > 0 && <CategoryMenu categories={menuCategories} />}
            <form action="/courses" method="get" role="search" className="flex flex-1 gap-2">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                aria-label="Search courses"
                placeholder="Search by title, provider, or category..."
                className="w-full border border-hairline-dark bg-transparent px-4 py-2 text-sm text-ink-dark placeholder:text-ink-dark/40 focus:border-ink-dark focus:outline-none"
              />
              <Button type="submit" size="md">
                Search
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-dark/50">
            Sort by
          </span>
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
                    ? "bg-ink-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-cream-dark"
                    : "border border-hairline-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-ink-dark/70 hover:border-ink-dark"
                }
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        <p className="mt-4 text-ink-dark/60">
          {q ? (
            <>
              {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;.{" "}
              <Link href="/courses" className="underline">
                Clear search
              </Link>
            </>
          ) : (
            <>
              {total} courses across {categories.length} categories.{" "}
              <Link href="/courses/category" className="underline">
                Browse all categories
              </Link>
            </>
          )}
        </p>

        {categories.length === 0 && (
          <p className="mt-10 text-ink-dark/50">
            No courses matched your search. Try a different title, provider, or category.
          </p>
        )}
      </div>

      {flatSorted ? (
        <div className="mx-auto mt-10 grid w-full max-w-7xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
          {flatSorted.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {topRated.length > 0 && (
            <BrowseRow
              eyebrow="By verified-review score"
              title="Top rated"
              href="/courses?sort=rating_desc"
              hrefLabel="See all by rating"
            >
              {topRated.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </BrowseRow>
          )}

          {categories.map(([category, rawCourses]) => {
            // Courses with no category are grouped under "Uncategorized",
            // which has no category page to link to.
            const categoryHref =
              category === "Uncategorized"
                ? undefined
                : `/courses/category/${categorySlug(category)}`;
            const { featuredId, courses } = withFeaturedFirst(
              rawCourses,
              featuredByCategory.get(category)
            );
            return (
              <BrowseRow
                key={category}
                title={category}
                titleHref={categoryHref}
                subtitle={`${courses.length} course${courses.length === 1 ? "" : "s"}${q ? " matching" : ""}`}
                href={categoryHref}
                hrefLabel={`Browse ${category}`}
              >
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} featured={course.id === featuredId} />
                ))}
              </BrowseRow>
            );
          })}
        </div>
      )}
    </main>
  );
}
