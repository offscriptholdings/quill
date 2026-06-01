-- MTC-284: quill.planning_notes — storage for calendar planning one-pagers
-- Written by the planning agent (MTC-285); read by the Quill PWA.

CREATE TABLE quill.planning_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_ref   text,                               -- Google Calendar external_id or free text ref
  title       text        NOT NULL,
  body        text,                               -- markdown content
  task_ids    jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- array of quill.tasks UUIDs linked
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX planning_notes_created_at_idx ON quill.planning_notes (created_at DESC);

-- RLS — mirrors quill.tasks / quill.calendar_events exactly
ALTER TABLE quill.planning_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_planning_notes"
  ON quill.planning_notes
  FOR ALL USING (true) WITH CHECK (true);
