-- MTC-215: quill.calendar_events schema — calendar system-of-record
-- Blocks: MTC-216 (sync), MTC-217 (day view), MTC-218 (brief read)

CREATE TABLE quill.calendar_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id  text NOT NULL UNIQUE,            -- Google Calendar event id (upsert key)
  calendar_id  text,                            -- source calendar (primary, etc.)
  title        text,
  description  text,
  location     text,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz,
  all_day      boolean NOT NULL DEFAULT false,
  attendees    jsonb,
  status       text NOT NULL DEFAULT 'confirmed', -- confirmed | tentative | cancelled
  source       text NOT NULL DEFAULT 'gcal',
  synced_at    timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX calendar_events_starts_at_idx ON quill.calendar_events (starts_at);

-- updated_at trigger — mirrors quill.tasks / quill.projects convention
CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON quill.calendar_events
  FOR EACH ROW EXECUTE FUNCTION quill.set_updated_at();

-- RLS — mirrors quill.tasks exactly (NOT quill.agent_feedback_signals which is RLS-disabled)
ALTER TABLE quill.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_calendar_events"
  ON quill.calendar_events
  FOR ALL USING (true) WITH CHECK (true);
