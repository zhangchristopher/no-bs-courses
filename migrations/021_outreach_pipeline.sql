-- Outreach pipeline hardening: a full state machine, per-recipient approval,
-- an event log for conversion attribution, and database-level suppression
-- enforcement. migrate.ts re-runs every file, so everything here is idempotent.

-- 1. Pipeline states. Old values are remapped; a 'pending' row that already has
--    a contact address is a researched row waiting for a draft.
ALTER TABLE creator_outreach DROP CONSTRAINT IF EXISTS creator_outreach_status_check;

UPDATE creator_outreach SET status = CASE
  WHEN status = 'pending' AND contact_email IS NOT NULL THEN 'contact_found'
  WHEN status = 'pending' THEN 'unresearched'
  WHEN status = 'drafted' THEN 'ready_for_review'
  WHEN status = 'failed' THEN 'send_failed'
  WHEN status = 'opted_out' THEN 'unsubscribed'
  WHEN status = 'skipped' THEN 'do_not_contact'
  ELSE status
END
WHERE status IN ('pending', 'drafted', 'failed', 'opted_out', 'skipped');

ALTER TABLE creator_outreach ALTER COLUMN status SET DEFAULT 'unresearched';

ALTER TABLE creator_outreach ADD CONSTRAINT creator_outreach_status_check CHECK (status IN (
  'unresearched',        -- not looked at yet
  'researching',         -- someone is working on it
  'owner_matched',       -- we are confident who the owner is, no contact route yet
  'contact_found',       -- a published contact address, ready to draft
  'no_contact',          -- researched, nothing usable published (maybe a manual route)
  'ready_for_review',    -- drafted; waiting for a human
  'approved_for_outreach', -- a human approved this exact recipient and draft
  'sent',
  'send_failed',
  'replied',
  'wrong_person',
  'owner_confirmed',
  'claim_started',
  'claimed',
  'business_verified',
  'free_owner',          -- claimed and verified, no paid plan
  'founding_subscriber',
  'activated',           -- claimed listing with real marketplace activity
  'not_interested',
  'unsubscribed',
  'bounced',
  'do_not_contact',
  'manual_review'        -- owner match or contact is ambiguous; a human decides
));

-- 2. Who approved each send, and when. Editing a draft clears it.
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- 3. Attribution events, one of each kind per recipient.
CREATE TABLE IF NOT EXISTS outreach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_id UUID NOT NULL REFERENCES creator_outreach(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sent', 'reply', 'positive_reply', 'link_click',
    'claim_started', 'claim_completed', 'business_verified', 'free_verified_owner',
    'founding_subscription', 'first_verified_review', 'five_verified_reviews', 'activated',
    'wrong_person', 'not_interested', 'unsubscribed', 'bounced', 'complaint'
  )),
  detail TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (outreach_id, event_type)
);
CREATE INDEX IF NOT EXISTS idx_outreach_events_type ON outreach_events(event_type);

-- 4. Suppression is enforced here, not just in scripts, so no script, no manual
--    SQL and no AI step can approve or send to a suppressed address.
CREATE OR REPLACE FUNCTION outreach_block_suppressed() RETURNS trigger AS $$
BEGIN
  IF NEW.contact_email IS NOT NULL
     AND NEW.status IN ('approved_for_outreach', 'sent')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
     AND EXISTS (SELECT 1 FROM outreach_suppressions s WHERE lower(s.email) = lower(NEW.contact_email)) THEN
    RAISE EXCEPTION 'outreach blocked: % is on the suppression list', NEW.contact_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outreach_block_suppressed ON creator_outreach;
CREATE TRIGGER trg_outreach_block_suppressed
  BEFORE INSERT OR UPDATE ON creator_outreach
  FOR EACH ROW EXECUTE FUNCTION outreach_block_suppressed();

-- Suppressing an address immediately moves every outreach row for it out of
-- the sendable states, whatever created the suppression.
CREATE OR REPLACE FUNCTION outreach_apply_suppression() RETURNS trigger AS $$
BEGIN
  UPDATE creator_outreach
  SET status = CASE WHEN NEW.reason = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END,
      approved_at = NULL, approved_by = NULL, updated_at = now()
  WHERE lower(contact_email) = lower(NEW.email)
    AND status NOT IN ('unsubscribed', 'bounced', 'do_not_contact');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outreach_apply_suppression ON outreach_suppressions;
CREATE TRIGGER trg_outreach_apply_suppression
  AFTER INSERT ON outreach_suppressions
  FOR EACH ROW EXECUTE FUNCTION outreach_apply_suppression();
