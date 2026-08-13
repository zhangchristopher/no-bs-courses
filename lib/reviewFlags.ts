import sql from "@/lib/db";

export type ReviewFlag = {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  flag_reason: string;
  review_count: number;
  window_start: string;
  window_end: string;
  created_at: string;
  resolved: boolean;
};

// Flags (never blocks) a course that received 5+ reviews in a rolling
// 24-hour window — a possible review-brigading/fraud pattern. Only called
// after a genuinely new review is inserted, not on edits to an existing
// one. Skips creating a duplicate flag while an earlier one for the same
// course is still unresolved, so a busy (but legitimate) course doesn't get
// re-flagged on every single review past the 5th.
export async function checkAndFlagReviewVelocity(courseId: string): Promise<void> {
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [{ count }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM reviews
    WHERE course_id = ${courseId} AND created_at >= ${windowStart}
  `;

  if (count < 5) return;

  const [existingUnresolved] = await sql<{ id: string }[]>`
    SELECT id FROM review_flags WHERE course_id = ${courseId} AND resolved = false LIMIT 1
  `;
  if (existingUnresolved) return;

  await sql`
    INSERT INTO review_flags (course_id, flag_reason, review_count, window_start, window_end)
    VALUES (
      ${courseId},
      ${`${count} reviews received in a 24-hour window`},
      ${count},
      ${windowStart},
      ${new Date()}
    )
  `;
}

export async function getUnresolvedReviewFlags(): Promise<ReviewFlag[]> {
  return sql<ReviewFlag[]>`
    SELECT
      rf.id, rf.course_id, c.title AS course_title, c.slug AS course_slug,
      rf.flag_reason, rf.review_count, rf.window_start, rf.window_end,
      rf.created_at, rf.resolved
    FROM review_flags rf
    JOIN courses c ON c.id = rf.course_id
    WHERE rf.resolved = false
    ORDER BY rf.created_at DESC
  `;
}

export type FlaggedReview = {
  id: string;
  rating: number;
  review_text: string | null;
  reviewer_display_name: string | null;
  created_at: string;
};

export async function getRecentReviewsForCourse(courseId: string, limit = 10): Promise<FlaggedReview[]> {
  return sql<FlaggedReview[]>`
    SELECT r.id, r.rating, r.review_text, u.display_name AS reviewer_display_name, r.created_at
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    WHERE r.course_id = ${courseId}
    ORDER BY r.created_at DESC
    LIMIT ${limit}
  `;
}

export async function resolveReviewFlag(flagId: string): Promise<void> {
  await sql`UPDATE review_flags SET resolved = true WHERE id = ${flagId}`;
}
