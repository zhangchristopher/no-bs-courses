-- Gates actual owner edit access behind a one-time verification fee,
-- separate from admin's identity approval (courses.verification_status).
ALTER TABLE courses ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS verification_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  owner_id UUID NOT NULL REFERENCES owners(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verification_payments_course ON verification_payments(course_id);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  clicked_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_course_clicked_at ON affiliate_clicks(course_id, clicked_at);
