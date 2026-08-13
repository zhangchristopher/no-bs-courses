-- Extra sections can carry an image and/or a video link; the base
-- description stays plain text.
ALTER TABLE course_sections ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE course_sections ADD COLUMN IF NOT EXISTS video_url TEXT;
