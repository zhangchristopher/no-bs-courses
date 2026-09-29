import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryTile from "@/components/CategoryTile";
import { getCategoryShowcases } from "@/lib/courses";

export const metadata: Metadata = {
  title: "All Course Categories",
  description:
    "Every course category on No BS Courses, with how many courses in each — pick one to compare them side by side.",
};

export default async function AllCategoriesPage() {
  const categories = await getCategoryShowcases();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Courses", href: "/courses" }, { label: "Categories" }]}
      />
      <h1 className="mt-3 text-3xl font-black uppercase tracking-headline text-ink-dark sm:text-5xl">
        All categories
      </h1>
      <p className="mt-2 text-ink-dark/60">
        {categories.length} categor{categories.length === 1 ? "y" : "ies"}, biggest first.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => (
          <CategoryTile key={c.category} category={c} />
        ))}
      </div>
    </main>
  );
}
