-- Adds password auth for owners (mirrors migrations/001 for users).
ALTER TABLE owners ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Tracks which owner submitted a claim, so admin approval can set
-- courses.verified_owner_id without guessing from evidence text.
ALTER TABLE verification_audit_log ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES owners(id);
