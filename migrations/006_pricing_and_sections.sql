-- "Compare at" price for showing a crossed-out original price next to the
-- real price (simple discount signal instead of a generic discounts field).
ALTER TABLE course_owner_fields ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2);

-- Extra listing sections a Business-tier owner can add beyond the base
-- description/syllabus, picked from a fixed vocabulary, capped at 5 per
-- course (enforced in the app layer) and one of each type.
CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN (
    'hosting_platform',
    'paid_testimonials',
    'success_stories',
    'community_events',
    'instructor_bio',
    'refund_policy',
    'faqs',
    'awards_recognition',
    'alumni_outcomes',
    'free_preview'
  )),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, section_type)
);

CREATE INDEX IF NOT EXISTS idx_course_sections_course ON course_sections(course_id);
