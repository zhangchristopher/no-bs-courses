import sql from "@/lib/db";

// Learner and owner accounts are entirely separate tables/logins (see
// auth.ts / owner-auth.ts), so there's no direct foreign key from a review
// back to "is this person the course's owner." This catches the two cases
// that actually are detectable: (1) the same learner account that submitted
// the listing reviewing it, and (2) an owner reviewing their own course
// through a learner account that happens to share the owner account's
// email. An owner using a learner account under a genuinely different email
// can't be caught this way — that's a real gap, not one this check claims
// to close.
export async function isSelfReview(courseId: string, reviewerId: string): Promise<boolean> {
  const [row] = await sql<{ hit: boolean }[]>`
    SELECT true AS hit
    FROM courses c
    JOIN users u ON u.id = ${reviewerId}
    LEFT JOIN owners o1 ON o1.id = c.verified_owner_id
    LEFT JOIN owners o2 ON o2.id = c.added_by_owner_id
    WHERE c.id = ${courseId}
      AND (
        c.added_by_user_id = ${reviewerId}
        OR lower(o1.email) = lower(u.email)
        OR lower(o2.email) = lower(u.email)
      )
    LIMIT 1
  `;
  return Boolean(row);
}

export type Review = {
  id: string;
  course_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  verified_purchase: boolean;
  edit_locked: boolean;
  created_at: string;
  edit_deadline: string;
  reviewer_display_name: string | null;
  response_id: string | null;
  response_text: string | null;
  response_created_at: string | null;
  purchase_evidence: string | null;
  purchase_verification_status: string;
};

export async function getReviewsForCourse(courseId: string): Promise<Review[]> {
  return sql<Review[]>`
    SELECT
      r.id,
      r.course_id,
      r.reviewer_id,
      r.rating,
      r.review_text,
      r.verified_purchase,
      r.edit_locked,
      r.created_at,
      r.edit_deadline,
      r.purchase_evidence,
      r.purchase_verification_status,
      u.display_name AS reviewer_display_name,
      orsp.id AS response_id,
      orsp.response_text AS response_text,
      orsp.created_at AS response_created_at
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    LEFT JOIN owner_responses orsp ON orsp.review_id = r.id
    WHERE r.course_id = ${courseId}
    ORDER BY r.created_at DESC
  `;
}

export async function getUserReviewForCourse(
  courseId: string,
  reviewerId: string
): Promise<Review | null> {
  const rows = await sql<Review[]>`
    SELECT
      r.id,
      r.course_id,
      r.reviewer_id,
      r.rating,
      r.review_text,
      r.verified_purchase,
      r.edit_locked,
      r.created_at,
      r.edit_deadline,
      r.purchase_evidence,
      r.purchase_verification_status,
      u.display_name AS reviewer_display_name,
      orsp.id AS response_id,
      orsp.response_text AS response_text,
      orsp.created_at AS response_created_at
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    LEFT JOIN owner_responses orsp ON orsp.review_id = r.id
    WHERE r.course_id = ${courseId} AND r.reviewer_id = ${reviewerId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}
