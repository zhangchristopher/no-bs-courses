-- Course-specific claim links. An invitation says "this recipient was invited
-- to claim this one listing"; it is NOT a credential. Following it still
-- requires an owner account, approved business verification, an unclaimed
-- listing and (as always) admin approval of the claim. The code is 128 random
-- bits, so it can't be guessed and carries no database identifier.
-- migrate.ts re-runs every file, so this is idempotent.
CREATE TABLE IF NOT EXISTS claim_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  outreach_id UUID REFERENCES creator_outreach(id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  -- Set when a signed-in owner opens the link, so the dashboard can offer to
  -- continue the claim after business verification is approved.
  owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '180 days',
  revoked_at TIMESTAMPTZ,
  -- Opens include mail-security scanners that fetch every link, so these are
  -- an upper bound on human clicks, never a conversion signal.
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  open_count INTEGER NOT NULL DEFAULT 0,
  claim_started_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_invitations_outreach_course
  ON claim_invitations(outreach_id, course_id) WHERE outreach_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_claim_invitations_owner ON claim_invitations(owner_id);
