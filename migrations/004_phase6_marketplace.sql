-- Anyone-added courses need admin content review before going public.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS listing_status TEXT NOT NULL DEFAULT 'published'
  CHECK (listing_status IN ('pending','published','rejected'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS added_by_user_id UUID REFERENCES users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS added_by_owner_id UUID REFERENCES owners(id);

-- Verified Course (per-course, requires active Registered Business first).
ALTER TABLE courses ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS contract_signed_name TEXT;

-- Registered Business: free paperwork + bundled $99-now/$50-mo subscription.
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_registration_number TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_state TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_paperwork_url TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_verification_status TEXT NOT NULL DEFAULT 'none'
  CHECK (business_verification_status IN ('none','pending','verified','rejected'));
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_rejection_reason TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_subscription_status TEXT NOT NULL DEFAULT 'inactive'
  CHECK (business_subscription_status IN ('inactive','active','past_due','canceled'));
ALTER TABLE owners ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Purchase verification for reviews.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS purchase_evidence TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS purchase_verification_status TEXT NOT NULL DEFAULT 'none'
  CHECK (purchase_verification_status IN ('none','pending','verified','rejected'));

-- Customer plan (free vs $5/mo) + bonus credits earned from verified reviews.
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_subscription_status TEXT NOT NULL DEFAULT 'inactive'
  CHECK (plan_subscription_status IN ('inactive','active','past_due','canceled'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_unlock_credits INT NOT NULL DEFAULT 0;

-- Which paid courses a free-plan user has unlocked. Permanent once granted —
-- the monthly cap only limits how many *new* ones can be added this month.
CREATE TABLE IF NOT EXISTS course_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  source TEXT NOT NULL CHECK (source IN ('free_monthly','bonus_credit','one_time_payment','own_verified_review')),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Signup additions (from the account-creation workflow tree): phone +
-- marketing opt-in for both account types. Owners' existing `name` column
-- is reused as their public/SEO business name — no new column for that.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_marketing_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_marketing_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS email_marketing_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS sms_marketing_opt_in BOOLEAN NOT NULL DEFAULT false;
