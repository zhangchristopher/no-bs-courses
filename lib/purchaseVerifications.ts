import sql from "@/lib/db";

export type PendingPurchaseVerification = {
  review_id: string;
  course_id: string;
  course_slug: string;
  course_title: string;
  reviewer_id: string;
  reviewer_name: string | null;
  reviewer_email: string;
  purchase_evidence: string | null;
  created_at: string;
};

export async function getPendingPurchaseVerifications(): Promise<PendingPurchaseVerification[]> {
  return sql<PendingPurchaseVerification[]>`
    SELECT
      r.id AS review_id,
      r.course_id,
      c.slug AS course_slug,
      c.title AS course_title,
      r.reviewer_id,
      u.display_name AS reviewer_name,
      u.email AS reviewer_email,
      r.purchase_evidence,
      r.created_at
    FROM reviews r
    JOIN courses c ON c.id = r.course_id
    JOIN users u ON u.id = r.reviewer_id
    WHERE r.purchase_verification_status = 'pending'
    ORDER BY r.created_at
  `;
}
