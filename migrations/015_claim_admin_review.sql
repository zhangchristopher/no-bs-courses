-- Course claiming goes back through admin review instead of being instant:
-- claimCourse() now sets verification_status='pending' (already a valid
-- value) rather than jumping straight to 'verified'. These two columns
-- carry the outcome when admin rejects a claim, since verified_owner_id
-- gets cleared back to NULL on rejection (the course reverts to genuinely
-- unclaimed, so anyone can attempt it) but the rejected owner still needs
-- to see why, and resubmitting is just claiming again.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS claim_rejection_reason TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS claim_rejection_owner_id UUID REFERENCES owners(id);

ALTER TABLE verification_audit_log DROP CONSTRAINT IF EXISTS verification_audit_log_action_check;
ALTER TABLE verification_audit_log ADD CONSTRAINT verification_audit_log_action_check
  CHECK (action IN ('claimed', 'verified', 'revoked', 'rejected'));
