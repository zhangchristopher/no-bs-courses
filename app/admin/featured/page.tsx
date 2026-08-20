import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getCoursesForFeaturedAdmin } from "@/lib/courses";
import { Button } from "@/components/ui/Button";
import { setCategoryFeaturedAction, setSiteFeaturedAction } from "./actions";

export const metadata: Metadata = { title: "Featured Courses" };

export default async function AdminFeaturedPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Not authorized
        </h1>
        <p className="mt-2 text-ink/60 dark:text-ink-dark/60">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to manage featured courses."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const courses = await getCoursesForFeaturedAdmin();
  const siteFeatured = courses.find((c) => c.is_site_featured) ?? null;

  const byCategory = new Map<string, typeof courses>();
  for (const course of courses) {
    const category = course.category ?? "Uncategorized";
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(course);
  }
  const categories = Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Featured Courses
      </h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        A manual pick, not an automatic ranking — one course shows on the homepage, and one per
        category on that category&apos;s page. Ratings never factor into this.
      </p>

      <section className="mt-8 border border-hairline p-5 dark:border-hairline-dark">
        <h2 className="text-xs font-bold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
          Homepage
        </h2>
        <form action={setSiteFeaturedAction} className="mt-3 flex flex-wrap items-center gap-3">
          <select
            name="course_id"
            defaultValue={siteFeatured?.id ?? ""}
            className="min-w-[16rem] flex-1 border border-hairline bg-transparent px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none dark:border-hairline-dark dark:bg-cream-dark dark:text-ink-dark dark:focus:border-ink-dark"
          >
            <option value="">— None —</option>
            {categories.map(([category, list]) => (
              <optgroup key={category} label={category}>
                {list.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <Button type="submit" size="sm">
            Set
          </Button>
        </form>
      </section>

      <div className="mt-8 flex flex-col gap-6">
        {categories.map(([category, list]) => {
          const current = list.find((c) => c.is_category_featured) ?? null;
          return (
            <section key={category} className="border border-hairline p-5 dark:border-hairline-dark">
              <h2 className="text-xs font-bold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                {category}
              </h2>
              <form action={setCategoryFeaturedAction} className="mt-3 flex flex-wrap items-center gap-3">
                <input type="hidden" name="category" value={category} />
                <select
                  name="course_id"
                  defaultValue={current?.id ?? ""}
                  className="min-w-[16rem] flex-1 border border-hairline bg-transparent px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none dark:border-hairline-dark dark:bg-cream-dark dark:text-ink-dark dark:focus:border-ink-dark"
                >
                  <option value="">— None —</option>
                  {list.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm">
                  Set
                </Button>
              </form>
            </section>
          );
        })}
      </div>
    </main>
  );
}
