-- Review velocity flagging: surfaces a possible review-brigading/fraud
-- pattern to an admin. Flags only — nothing here auto-hides reviews or
-- blocks a course.
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  flag_reason TEXT NOT NULL,
  review_count INT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_review_flags_unresolved ON review_flags(course_id) WHERE resolved = false;
