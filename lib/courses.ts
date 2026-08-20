import sql from "@/lib/db";

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  provider_name: string;
  category: string | null;
  platform: string | null;
  verification_status: string;
  affiliate_link_status: string;
  owner_business_subscription_status: string | null;
  price: string | null;
  compare_at_price: string | null;
  duration_hours: string | null;
  thumbnail_url: string | null;
  description: string | null;
  overall_score: string | null;
  total_reviews: number | null;
};

export type CourseDetail = CourseListItem & {
  platform_url: string;
  syllabus: string | null;
  prerequisites: string | null;
  verified_owner_id: string | null;
  contract_signed_at: string | null;
  affiliate_url: string | null;
  affiliate_link_status: string;
  owner_business_verification_status: string | null;
  owner_business_subscription_status: string | null;
  claim_rejection_reason: string | null;
  claim_rejection_owner_id: string | null;
};

export type CategorySummary = {
  category: string;
  count: number;
};

export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export async function getCoursesByCategory(searchQuery?: string) {
  const query = searchQuery?.trim();

  const rows = query
    ? await sql<CourseListItem[]>`
        SELECT
          c.id,
          c.slug,
          c.title,
          c.provider_name,
          c.category,
          c.platform,
          c.verification_status,
          c.affiliate_link_status,
          o.business_subscription_status AS owner_business_subscription_status,
          cof.price,
          cof.compare_at_price,
          cof.duration_hours,
          cof.thumbnail_url,
          cof.description,
          cs.overall_score,
          cs.total_reviews
        FROM courses c
        LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
        LEFT JOIN course_scores cs ON cs.course_id = c.id
        LEFT JOIN owners o ON o.id = c.verified_owner_id
        WHERE c.listing_status = 'published'
          AND (
            c.title ILIKE ${"%" + query + "%"}
            OR c.provider_name ILIKE ${"%" + query + "%"}
            OR c.category ILIKE ${"%" + query + "%"}
          )
        ORDER BY c.category, c.title
      `
    : await sql<CourseListItem[]>`
        SELECT
          c.id,
          c.slug,
          c.title,
          c.provider_name,
          c.category,
          c.platform,
          c.verification_status,
          c.affiliate_link_status,
          o.business_subscription_status AS owner_business_subscription_status,
          cof.price,
          cof.compare_at_price,
          cof.duration_hours,
          cof.thumbnail_url,
          cof.description,
          cs.overall_score,
          cs.total_reviews
        FROM courses c
        LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
        LEFT JOIN course_scores cs ON cs.course_id = c.id
        LEFT JOIN owners o ON o.id = c.verified_owner_id
        WHERE c.listing_status = 'published'
        ORDER BY c.category, c.title
      `;

  const byCategory = new Map<string, CourseListItem[]>();
  for (const row of rows) {
    const category = row.category ?? "Uncategorized";
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(row);
  }

  return Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export async function getCourseBySlug(slug: string) {
  const rows = await sql<CourseDetail[]>`
    SELECT
      c.id,
      c.slug,
      c.title,
      c.provider_name,
      c.platform_url,
      c.category,
      c.platform,
      c.verification_status,
      c.verified_owner_id,
      c.contract_signed_at,
      c.affiliate_url,
      c.affiliate_link_status,
      c.claim_rejection_reason,
      c.claim_rejection_owner_id,
      o.business_verification_status AS owner_business_verification_status,
      o.business_subscription_status AS owner_business_subscription_status,
      cof.description,
      cof.syllabus,
      cof.price,
      cof.compare_at_price,
      cof.duration_hours,
      cof.prerequisites,
      cof.thumbnail_url,
      cs.overall_score,
      cs.total_reviews
    FROM courses c
    LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
    LEFT JOIN course_scores cs ON cs.course_id = c.id
    LEFT JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.slug = ${slug} AND c.listing_status = 'published'
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  const rows = await sql<CategorySummary[]>`
    SELECT category, COUNT(*)::int AS count
    FROM courses
    WHERE category IS NOT NULL AND listing_status = 'published'
    GROUP BY category
    ORDER BY category
  `;

  return rows;
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  const categories = await getAllCategories();
  return categories.find((c) => categorySlug(c.category) === slug) ?? null;
}

export type CategoryShowcase = CategorySummary & { thumbnail_url: string | null };

// One representative thumbnail per category, for the homepage's category
// browse cards. DISTINCT ON picks the highest-rated course in each category
// (falling back to most recent when nothing's been rated yet).
export async function getCategoryShowcases(): Promise<CategoryShowcase[]> {
  const rows = await sql<CategoryShowcase[]>`
    SELECT category, count, thumbnail_url FROM (
      SELECT DISTINCT ON (c.category)
        c.category,
        COUNT(*) OVER (PARTITION BY c.category)::int AS count,
        cof.thumbnail_url
      FROM courses c
      LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
      LEFT JOIN course_scores cs ON cs.course_id = c.id
      WHERE c.category IS NOT NULL AND c.listing_status = 'published'
      ORDER BY c.category, cs.overall_score DESC NULLS LAST, c.created_at DESC
    ) t
    ORDER BY category
  `;

  return rows;
}

export async function getCoursesForCategory(category: string): Promise<CourseListItem[]> {
  return sql<CourseListItem[]>`
    SELECT
      c.id,
      c.slug,
      c.title,
      c.provider_name,
      c.category,
      c.verification_status,
      c.affiliate_link_status,
      o.business_subscription_status AS owner_business_subscription_status,
      cof.price,
      cof.compare_at_price,
      cof.duration_hours,
      cof.thumbnail_url,
      cof.description,
      cs.overall_score,
      cs.total_reviews
    FROM courses c
    LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
    LEFT JOIN course_scores cs ON cs.course_id = c.id
    LEFT JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.category = ${category} AND c.listing_status = 'published'
    ORDER BY c.title
  `;
}

export type CourseSort = "featured" | "rating_desc" | "verified_first" | "price_asc" | "price_desc";

export const COURSE_SORT_OPTIONS: { value: CourseSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "rating_desc", label: "Highest rated" },
  { value: "verified_first", label: "Verified first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function isCourseSort(value: string | undefined): value is CourseSort {
  return COURSE_SORT_OPTIONS.some((opt) => opt.value === value);
}

// Verified Course (affiliate link admin-verified) outranks Registered Business
// (active subscription), which outranks a plain Verified Creator claim —
// mirrors the tier ladder used for badges on the course detail page.
function courseTierRank(course: CourseListItem): number {
  if (course.affiliate_link_status === "verified") return 3;
  if (course.owner_business_subscription_status === "active") return 2;
  if (course.verification_status === "verified") return 1;
  return 0;
}

function compareNullableAsc(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function compareNullableDesc(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

export function sortCourseList(courses: CourseListItem[], sort: CourseSort): CourseListItem[] {
  const list = [...courses];
  switch (sort) {
    case "price_asc":
      return list.sort((a, b) =>
        compareNullableAsc(a.price ? Number(a.price) : null, b.price ? Number(b.price) : null)
      );
    case "price_desc":
      return list.sort((a, b) =>
        compareNullableDesc(a.price ? Number(a.price) : null, b.price ? Number(b.price) : null)
      );
    case "rating_desc":
      return list.sort((a, b) =>
        compareNullableDesc(
          a.overall_score ? Number(a.overall_score) : null,
          b.overall_score ? Number(b.overall_score) : null
        )
      );
    case "verified_first":
      return list.sort((a, b) => courseTierRank(b) - courseTierRank(a));
    case "featured":
    default:
      return list;
  }
}

export type AdminFeaturedRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  is_site_featured: boolean;
  is_category_featured: boolean;
};

// Lightweight listing for the admin "featured courses" picker — deliberately
// its own query rather than reusing CourseListItem, so the two featured
// flags don't have to be threaded through every other course listing in the
// app that doesn't need them.
export async function getCoursesForFeaturedAdmin(): Promise<AdminFeaturedRow[]> {
  return sql<AdminFeaturedRow[]>`
    SELECT id, slug, title, category, is_site_featured, is_category_featured
    FROM courses
    WHERE listing_status = 'published'
    ORDER BY category NULLS LAST, title
  `;
}

// Admin sets/clears the one sitewide featured course. Clearing the old pick
// before setting the new one (in a transaction) is what lets the partial
// unique index on is_site_featured stay satisfied at every step.
export async function setSiteFeaturedCourse(courseId: string | null): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`UPDATE courses SET is_site_featured = false WHERE is_site_featured`;
    if (courseId) {
      await tx`UPDATE courses SET is_site_featured = true WHERE id = ${courseId}`;
    }
  });
}

export async function setCategoryFeaturedCourse(
  category: string,
  courseId: string | null
): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`UPDATE courses SET is_category_featured = false WHERE category = ${category} AND is_category_featured`;
    if (courseId) {
      await tx`UPDATE courses SET is_category_featured = true WHERE id = ${courseId} AND category = ${category}`;
    }
  });
}

export async function getAllCourseSlugs(): Promise<{ slug: string }[]> {
  return sql<{ slug: string }[]>`
    SELECT slug FROM courses WHERE listing_status = 'published' ORDER BY slug
  `;
}

// For the Add Course category dropdown — every category already in use,
// so the list grows on its own as new categories get created (via the
// "Other" fallback) instead of needing a separate admin-managed list.
export async function getCategoryNames(): Promise<string[]> {
  const rows = await sql<{ category: string }[]>`
    SELECT DISTINCT category FROM courses
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `;
  return rows.map((r) => r.category);
}

export async function getSiteFeaturedCourse(): Promise<CourseListItem | null> {
  const rows = await sql<CourseListItem[]>`
    SELECT
      c.id, c.slug, c.title, c.provider_name, c.category, c.platform,
      c.verification_status, c.affiliate_link_status,
      o.business_subscription_status AS owner_business_subscription_status,
      cof.price, cof.compare_at_price, cof.duration_hours, cof.thumbnail_url,
      cof.description, cs.overall_score, cs.total_reviews
    FROM courses c
    LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
    LEFT JOIN course_scores cs ON cs.course_id = c.id
    LEFT JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.is_site_featured AND c.listing_status = 'published'
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getCategoryFeaturedCourse(category: string): Promise<CourseListItem | null> {
  const rows = await sql<CourseListItem[]>`
    SELECT
      c.id, c.slug, c.title, c.provider_name, c.category, c.platform,
      c.verification_status, c.affiliate_link_status,
      o.business_subscription_status AS owner_business_subscription_status,
      cof.price, cof.compare_at_price, cof.duration_hours, cof.thumbnail_url,
      cof.description, cs.overall_score, cs.total_reviews
    FROM courses c
    LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
    LEFT JOIN course_scores cs ON cs.course_id = c.id
    LEFT JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.is_category_featured AND c.category = ${category} AND c.listing_status = 'published'
    LIMIT 1
  `;
  return rows[0] ?? null;
}
