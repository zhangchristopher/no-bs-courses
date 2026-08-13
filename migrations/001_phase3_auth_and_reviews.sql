-- Adds the column NextAuth's Credentials provider needs for password auth.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Enforces one review per user per course at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_course_reviewer ON reviews(course_id, reviewer_id);
