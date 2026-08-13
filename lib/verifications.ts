import sql from "@/lib/db";

export type PendingListing = {
  course_id: string;
  slug: string;
  title: string;
  provider_name: string;
  platform_url: string;
  category: string | null;
  description: string | null;
  syllabus: string | null;
  price: string | null;
  duration_hours: string | null;
  prerequisites: string | null;
  thumbnail_url: string | null;
  added_by_user_name: string | null;
  added_by_owner_name: string | null;
  added_by_owner_email: string | null;
  submitted_at: string;
};

export type CourseModerationStatus = {
  id: string;
  title: string;
  listing_status: string;
  added_by_user_id: string | null;
  added_by_owner_id: string | null;
};

// Looks up a course by slug regardless of listing_status — unlike
// lib/courses.ts's public reads, which only ever return published courses.
// Used solely to decide whether to show the submitter/admin a "pending
// review" notice instead of a flat 404.
export async function getCourseModerationStatus(slug: string): Promise<CourseModerationStatus | null> {
  const rows = await sql<CourseModerationStatus[]>`
    SELECT id, title, listing_status, added_by_user_id, added_by_owner_id
    FROM courses
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getPendingListings(): Promise<PendingListing[]> {
  return sql<PendingListing[]>`
    SELECT
      c.id AS course_id,
      c.slug,
      c.title,
      c.provider_name,
      c.platform_url,
      c.category,
      cof.description,
      cof.syllabus,
      cof.price,
      cof.duration_hours,
      cof.prerequisites,
      cof.thumbnail_url,
      u.display_name AS added_by_user_name,
      o.name AS added_by_owner_name,
      o.email AS added_by_owner_email,
      c.created_at AS submitted_at
    FROM courses c
    LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
    LEFT JOIN users u ON u.id = c.added_by_user_id
    LEFT JOIN owners o ON o.id = c.added_by_owner_id
    WHERE c.listing_status = 'pending'
    ORDER BY c.created_at
  `;
}
