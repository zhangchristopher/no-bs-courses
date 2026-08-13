-- Anonymous-visitor correlation (first-party, no cross-site tracking) so
-- section engagement can be linked to a later "Go to course" click even for
-- signed-out visitors.
ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS visitor_id TEXT;
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_visitor ON affiliate_clicks(visitor_id);

CREATE TABLE IF NOT EXISTS course_section_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  visitor_id TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_section_clicks_course ON course_section_clicks(course_id);
