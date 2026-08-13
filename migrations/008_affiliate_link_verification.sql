-- Submitting an affiliate link (signing the Verified Course contract) no
-- longer activates Verified Course immediately — an admin must approve the
-- link first. contract_signed_at/affiliate_url still record what was
-- submitted; this status gates whether it actually takes effect.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS affiliate_link_status TEXT NOT NULL DEFAULT 'none'
  CHECK (affiliate_link_status IN ('none','pending','verified','rejected'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS affiliate_link_rejection_reason TEXT;
