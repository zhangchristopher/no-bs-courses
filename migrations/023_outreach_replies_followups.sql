-- Replies, short follow-up sequence, segment data and prospect scoring for the
-- creator outreach pipeline. migrate.ts re-runs every file, so this is
-- idempotent.

-- 1. Inbound replies, classified by deterministic rules (scripts/outreach/replies.ts).
CREATE TABLE IF NOT EXISTS outreach_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_id UUID NOT NULL REFERENCES creator_outreach(id) ON DELETE CASCADE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  body TEXT NOT NULL,
  classification TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  recommended_action TEXT NOT NULL,
  auto_response_permitted BOOLEAN NOT NULL DEFAULT false,
  human_review_required BOOLEAN NOT NULL DEFAULT true,
  suggested_response TEXT,
  handled_at TIMESTAMPTZ,
  handled_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_outreach_replies_outreach ON outreach_replies(outreach_id);
CREATE INDEX IF NOT EXISTS idx_outreach_replies_open ON outreach_replies(human_review_required) WHERE handled_at IS NULL;

-- 2. Follow-ups (Email 2 and 3). Short on purpose: two steps, then stop.
CREATE TABLE IF NOT EXISTS outreach_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_id UUID NOT NULL REFERENCES creator_outreach(id) ON DELETE CASCADE,
  step INTEGER NOT NULL CHECK (step IN (1, 2)),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'drafted' CHECK (status IN ('drafted', 'approved', 'sent', 'cancelled')),
  drafted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  sent_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  UNIQUE (outreach_id, step)
);

ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS sequence_stopped_at TIMESTAMPTZ;
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS sequence_stopped_reason TEXT;

-- 3. Segment data, captured now and compared later. No automatic strategy
--    changes depend on any of it.
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS message_variant TEXT NOT NULL DEFAULT 'v1';
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS contact_source_type TEXT
  CHECK (contact_source_type IN ('own_site', 'own_social_bio', 'podcast_or_newsletter_site', 'press_feature', 'directory_listing', 'other'));
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS creator_size TEXT
  CHECK (creator_size IN ('solo', 'small_team', 'agency_or_company', 'unknown'));
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS testimonials_visible BOOLEAN;
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS appears_active TEXT
  CHECK (appears_active IN ('active', 'unclear', 'inactive'));
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS course_price_text TEXT;
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS official_website TEXT;

-- 4. Prospect score, 0-100. Affiliate participation is deliberately not an input.
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS prospect_score INTEGER CHECK (prospect_score BETWEEN 0 AND 100);
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS score_breakdown JSONB;
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS research_risk TEXT;

-- 5. More event types for the follow-up steps and replies.
ALTER TABLE outreach_events DROP CONSTRAINT IF EXISTS outreach_events_event_type_check;
ALTER TABLE outreach_events ADD CONSTRAINT outreach_events_event_type_check CHECK (event_type IN (
  'sent', 'reply', 'positive_reply', 'link_click',
  'claim_started', 'claim_completed', 'business_verified', 'free_verified_owner',
  'founding_subscription', 'first_verified_review', 'five_verified_reviews', 'activated',
  'wrong_person', 'not_interested', 'unsubscribed', 'bounced', 'complaint',
  'followup_1_sent', 'followup_2_sent', 'sequence_stopped'
));

-- Suppressing an address also stops any queued follow-up for it, whatever
-- created the suppression.
CREATE OR REPLACE FUNCTION outreach_apply_suppression() RETURNS trigger AS $$
BEGIN
  UPDATE creator_outreach
  SET status = CASE WHEN NEW.reason = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END,
      approved_at = NULL, approved_by = NULL,
      sequence_stopped_at = COALESCE(sequence_stopped_at, now()),
      sequence_stopped_reason = COALESCE(sequence_stopped_reason, 'suppressed: ' || NEW.reason),
      updated_at = now()
  WHERE lower(contact_email) = lower(NEW.email)
    AND status NOT IN ('unsubscribed', 'bounced', 'do_not_contact');

  UPDATE outreach_followups f
  SET status = 'cancelled', cancelled_at = now(), cancel_reason = 'suppressed: ' || NEW.reason
  FROM creator_outreach o
  WHERE f.outreach_id = o.id AND lower(o.contact_email) = lower(NEW.email) AND f.status IN ('drafted', 'approved');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- A follow-up can never be marked approved or sent for a suppressed address.
CREATE OR REPLACE FUNCTION outreach_followup_block_suppressed() RETURNS trigger AS $$
DECLARE addr TEXT;
BEGIN
  IF NEW.status IN ('approved', 'sent') AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT contact_email INTO addr FROM creator_outreach WHERE id = NEW.outreach_id;
    IF addr IS NOT NULL AND EXISTS (SELECT 1 FROM outreach_suppressions s WHERE lower(s.email) = lower(addr)) THEN
      RAISE EXCEPTION 'follow-up blocked: % is on the suppression list', addr;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outreach_followup_block_suppressed ON outreach_followups;
CREATE TRIGGER trg_outreach_followup_block_suppressed
  BEFORE INSERT OR UPDATE ON outreach_followups
  FOR EACH ROW EXECUTE FUNCTION outreach_followup_block_suppressed();
