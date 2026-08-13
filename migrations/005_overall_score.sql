-- Combined average across all reviews (verified and unverified), so the
-- public-facing score doesn't drop reviews just because they later became
-- purchase-verified.
ALTER TABLE course_scores ADD COLUMN IF NOT EXISTS overall_score NUMERIC(3,2);

UPDATE course_scores cs
SET overall_score = sub.avg_rating
FROM (
  SELECT course_id, AVG(rating)::numeric(3,2) AS avg_rating
  FROM reviews
  GROUP BY course_id
) sub
WHERE cs.course_id = sub.course_id;
