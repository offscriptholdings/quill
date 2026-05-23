ALTER TABLE quill.tasks
  ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES quill.tasks(id);

CREATE INDEX IF NOT EXISTS tasks_recurrence_parent_idx
  ON quill.tasks (recurrence_parent_id)
  WHERE recurrence_parent_id IS NOT NULL;
