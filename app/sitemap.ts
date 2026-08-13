import type { MetadataRoute } from "next";
import { categorySlug, getAllCategories, getAllCourseSlugs } from "@/lib/courses";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, courses] = await Promise.all([getAllCategories(), getAllCourseSlugs()]);

  return [
    {
      url: `${SITE_URL}/`,
      priority: 1,
    },
    {
      url: `${SITE_URL}/courses`,
      priority: 0.9,
    },
    ...categories.map((c) => ({
      url: `${SITE_URL}/courses/category/${categorySlug(c.category)}`,
      priority: 0.7,
    })),
    ...courses.map((c) => ({
      url: `${SITE_URL}/courses/${c.slug}`,
      priority: 0.6,
    })),
  ];
}
