-- MTC-165: Add quill.schedule_suggestions table
-- Foundational schema for the Quill scheduling agent.
-- Blocks: MTC-166 (n8n suggestion engine), MTC-167 (swipe/confirm UI).

CREATE TABLE quill.schedule_suggestions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        uuid        REFERENCES quill.tasks(id) ON DELETE CASCADE,
  suggested_date date        NOT NULL,
  reasoning      text,
  status         text        DEFAULT 'pending',
  created_at     timestamptz DEFAULT now()
);

-- Carry forward quill RLS pattern
ALTER TABLE quill.schedule_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_schedule_suggestions"
  ON quill.schedule_suggestions
  FOR ALL USING (true) WITH CHECK (true);
