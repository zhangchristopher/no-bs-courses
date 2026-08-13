import sql from "@/lib/db";

export async function recalculateCourseScores(courseId: string) {
  const [agg] = await sql<
    {
      verified_score: string | null;
      unverified_score: string | null;
      overall_score: string | null;
      total_reviews: number;
    }[]
  >`
    SELECT
      AVG(rating) FILTER (WHERE verified_purchase = true)::numeric(3,2) AS verified_score,
      AVG(rating) FILTER (WHERE verified_purchase = false)::numeric(3,2) AS unverified_score,
      AVG(rating)::numeric(3,2) AS overall_score,
      COUNT(*)::int AS total_reviews
    FROM reviews
    WHERE course_id = ${courseId}
  `;

  await sql`
    INSERT INTO course_scores (course_id, verified_score, unverified_score, overall_score, total_reviews, last_calculated_at)
    VALUES (${courseId}, ${agg.verified_score}, ${agg.unverified_score}, ${agg.overall_score}, ${agg.total_reviews}, now())
    ON CONFLICT (course_id) DO UPDATE SET
      verified_score = EXCLUDED.verified_score,
      unverified_score = EXCLUDED.unverified_score,
      overall_score = EXCLUDED.overall_score,
      total_reviews = EXCLUDED.total_reviews,
      last_calculated_at = now()
  `;
}
