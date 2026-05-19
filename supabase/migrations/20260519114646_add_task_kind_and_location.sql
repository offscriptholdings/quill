ALTER TABLE quill.tasks
  ADD COLUMN kind text NOT NULL DEFAULT 'task'
  CHECK (kind IN ('task','meeting','trip','appointment'));

ALTER TABLE quill.tasks
  ADD COLUMN location text;

COMMENT ON COLUMN quill.tasks.kind IS
  'task=default; meeting/appointment=timed event (uses scheduled timestamptz); trip=date range (schedule_date..due_date). Phase B exposes trip UI.';
