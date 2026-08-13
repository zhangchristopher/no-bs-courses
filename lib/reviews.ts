import sql from "@/lib/db";

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
