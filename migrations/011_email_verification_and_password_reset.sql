-- Email verification (not enforced yet — a product decision to gate on it
-- later, not a technical one) and password reset. Both features share one
-- token table since the shape (a hashed, single-use, expiring token tied to
-- one of the two account tables) is identical for both purposes.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- token_hash stores SHA-256(raw token) only — never the raw token itself —
-- the same trust model as password_hash: if this table leaks, the tokens in
-- it can't be reconstructed or replayed.
CREATE TABLE IF NOT EXISTS account_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  account_type TEXT NOT NULL CHECK (account_type IN ('user', 'owner')),
  account_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_tokens_hash ON account_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_account_tokens_account ON account_tokens(account_type, account_id, purpose);
