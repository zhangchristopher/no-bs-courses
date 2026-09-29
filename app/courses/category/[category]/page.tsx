import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CourseCard from "@/components/CourseCard";
import FeaturedCourseCard from "@/components/FeaturedCourseCard";
import BrowseRow from "@/components/BrowseRow";
import {
  getCategoryBySlug,
  getCategoryFeaturedCourse,
  getCoursesForCategory,
  getTopRatedCourses,
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

  const [allCourses, featuredCourse, topRated] = await Promise.all([
    getCoursesForCategory(match.category),
    getCategoryFeaturedCourse(match.category),
    getTopRatedCourses(12, match.category),
  ]);
  const courses = sortCourseList(allCourses, sort);

  return (
    <main className="flex flex-1 flex-col pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Courses", href: "/courses" },
            { label: "Categories", href: "/courses/category" },
            { label: match.category },
          ]}
        />

        <h1 className="mt-3 text-3xl font-black uppercase tracking-headline text-ink-dark sm:text-5xl">
          Best {match.category} Courses
        </h1>
        <p className="mt-2 text-ink-dark/60">
          {match.count} course{match.count === 1 ? "" : "s"} in {match.category}.
        </p>
      </div>

      {/* FEATURED — the admin's pick for this category (set from
          /admin/featured). An editorial choice, not a ranking. */}
      {featuredCourse && (
        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black uppercase tracking-headline text-ink-dark sm:text-3xl">
            Featured in {match.category}
          </h2>
          <div className="mt-5">
            <FeaturedCourseCard course={featuredCourse} />
          </div>
        </section>
      )}

      {/* TOP RATED — review score only. Skipped when there's just one rated
          course, since a one-card "ranking" says nothing. */}
      {topRated.length > 1 && (
        <div className="mt-4">
          <BrowseRow eyebrow="By verified-review score" title={`Top rated in ${match.category}`}>
            {topRated.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </BrowseRow>
        </div>
      )}

      <section className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black uppercase tracking-headline text-ink-dark sm:text-3xl">
          All {match.category} courses
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-dark/50">
            Sort by
          </span>
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
                    ? "bg-ink-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-cream-dark"
                    : "border border-hairline-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-ink-dark/70 hover:border-ink-dark"
                }
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              featured={sort === "featured" && course.id === featuredCourse?.id}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
