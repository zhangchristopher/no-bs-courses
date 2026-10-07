-- Founding-owner outreach to the creators behind unclaimed listings. One row
-- per creator (not per course) so nobody gets one email per listing.
-- `course_ids` is refreshed from `courses` on every research run.
CREATE TABLE IF NOT EXISTS creator_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_name TEXT UNIQUE NOT NULL,
  course_ids UUID[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'no_contact', 'drafted', 'sent', 'failed', 'opted_out', 'skipped')),
  -- Only a contact address the creator publishes themselves, with the page it
  -- was found on, so every address can be traced back to where it came from.
  contact_email TEXT,
  contact_source_url TEXT,
  contact_form_url TEXT,
  contact_confidence TEXT CHECK (contact_confidence IN ('high', 'medium', 'low')),
  research_notes TEXT,
  researched_at TIMESTAMPTZ,
  email_subject TEXT,
  email_body TEXT,
  drafted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  send_error TEXT,
  -- Hash only, same trust model as account_tokens: the raw token exists only
  -- in the sent email's unsubscribe link.
  unsubscribe_token_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_outreach_status ON creator_outreach(status);

-- Keyed by address, not by creator row, so an opt-out survives the outreach
-- table being re-seeded and also covers the same address turning up under a
-- second creator name.
CREATE TABLE IF NOT EXISTS outreach_suppressions (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
