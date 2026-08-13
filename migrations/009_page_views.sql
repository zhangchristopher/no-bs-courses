-- Page views for verified-course analytics (CTR = clicks / views). Logged
-- server-side on every unlocked course-detail render, same pattern as
-- affiliate_clicks — no bot/dedup filtering, consistent with that table.
CREATE TABLE IF NOT EXISTS course_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_course_page_views_course_viewed_at ON course_page_views(course_id, viewed_at);
