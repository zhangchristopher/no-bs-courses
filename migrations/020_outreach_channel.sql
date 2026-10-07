-- Which channel suits each creator. Many Skool/Whop brands publish no email
-- but run a public business Instagram, so those get a DM from the founder
-- instead. Only a brand/business account goes here, with the page it was
-- found on, same as contact_email.
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS preferred_channel TEXT
  CHECK (preferred_channel IN ('email', 'instagram', 'other'));
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE creator_outreach ADD COLUMN IF NOT EXISTS instagram_source_url TEXT;
