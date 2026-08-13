CREATE TABLE owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  platform_url TEXT NOT NULL,
  category TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (verification_status IN ('unclaimed','pending','verified','revoked')),
  verified_owner_id UUID REFERENCES owners(id),
  claimed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE course_owner_fields (
  course_id UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  description TEXT,
  syllabus TEXT,
  price NUMERIC(10,2),
  duration_hours NUMERIC(6,2),
  prerequisites TEXT,
  thumbnail_url TEXT,
  last_edited_by UUID REFERENCES owners(id),
  last_edited_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  edit_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  edit_deadline TIMESTAMPTZ DEFAULT (now() + interval '48 hours')
);

CREATE TABLE owner_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID UNIQUE NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id),
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE course_scores (
  course_id UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  verified_score NUMERIC(3,2),
  unverified_score NUMERIC(3,2),
  total_reviews INT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE verification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  action TEXT NOT NULL CHECK (action IN ('claimed','verified','revoked')),
  evidence_submitted TEXT,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_reviews_course ON reviews(course_id);
