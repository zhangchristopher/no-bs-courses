-- Import provenance: distinguishes a bulk-imported listing from a manually
-- submitted one, and records when/from what batch — the gap flagged in the
-- product audit as necessary before any bulk import.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS import_source TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;

-- Unresolved candidates from a bulk research pass that were NOT specific
-- enough to publish as real courses (a generic search URL, a templated
-- topic/creator pairing, a whole-platform catalog reference rather than one
-- course). Kept separately from `courses` — which represents real, live
-- listings — so a large research pass doesn't get lost, but also can't be
-- mistaken for verified data. `raw_data` preserves the entire original row
-- so a future resolution pass has full context, not just the few columns
-- promoted to real ones here.
CREATE TABLE IF NOT EXISTS import_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_workbook TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  raw_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'rejected')),
  resolved_course_id UUID REFERENCES courses(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_leads_status ON import_leads(status);
