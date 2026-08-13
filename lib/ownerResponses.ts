import sql from "@/lib/db";

// The INSERT...SELECT...WHERE pattern below enforces ownership AND
// admin-verified affiliate link status in the query itself: a row is only
// created if the review's course is verified-owned by this owner AND its
// affiliate link has been approved (not just submitted). There is no code
// path that lets an owner write to `reviews` or `course_scores` at all.
export async function createOwnerResponse(params: {
  reviewId: string;
  ownerId: string;
  responseText: string;
}): Promise<{ id: string } | null> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO owner_responses (review_id, owner_id, response_text)
    SELECT r.id, ${params.ownerId}, ${params.responseText}
    FROM reviews r
    JOIN courses c ON c.id = r.course_id
    WHERE r.id = ${params.reviewId}
      AND c.verified_owner_id = ${params.ownerId}
      AND c.affiliate_link_status = 'verified'
    RETURNING id
  `;

  return rows[0] ?? null;
}
