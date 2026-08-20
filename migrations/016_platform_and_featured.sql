-- Structured hosting platform (Udemy/Coursera/YouTube/etc.), detected from
-- platform_url at submission time so listings can show it as a fact instead
-- of re-parsing the URL on every render.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS platform TEXT;

-- Admin-picked featured courses. One per category, one sitewide — a manual
-- pick, not an automatic "highest rated" ranking, so the slot can't be
-- gamed by review volume and stays consistent with "a course can't pay for
-- a better score." Enforced in the app layer; the partial unique indexes
-- below are the backstop against two admins racing each other.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_site_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_category_featured BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_one_site_featured
  ON courses (is_site_featured) WHERE is_site_featured;

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_one_category_featured
  ON courses (category, is_category_featured) WHERE is_category_featured;
