-- QV2 schema migration (CRU-179)
-- Backwards-incompatible. Take pg_dump of quill schema before applying:
--   pg_dump -h <host> -d <db> -n quill --data-only > quill_backup_pre_qv2.sql
--
-- Renames the domain enum (TitleCase → lowercase, 'Project' → 'work'),
-- converts priority from text → int2 (0–3), adds parent_id/source/scheduled
-- columns to tasks, creates quill.inbox, and creates four computed views.

-- ─── 1. Drop old CHECK constraints on tasks + projects (domain, priority)
ALTER TABLE quill.tasks    DROP CONSTRAINT tasks_domain_check;
ALTER TABLE quill.tasks    DROP CONSTRAINT tasks_priority_check;
ALTER TABLE quill.projects DROP CONSTRAINT projects_domain_check;

-- ─── 2. Backfill domain values to lowercase + Project → work
UPDATE quill.tasks    SET domain = lower(domain) WHERE domain IN ('Spirit','Body','Wealth','Family');
UPDATE quill.tasks    SET domain = 'work'         WHERE domain = 'Project';
UPDATE quill.projects SET domain = lower(domain) WHERE domain IN ('Spirit','Body','Wealth','Family');
UPDATE quill.projects SET domain = 'work'         WHERE domain = 'Project';

-- ─── 3. Add new domain CHECK with lowercase values + 'work'
ALTER TABLE quill.tasks    ADD CONSTRAINT tasks_domain_check    CHECK (domain IN ('spirit','body','work','wealth','family'));
ALTER TABLE quill.projects ADD CONSTRAINT projects_domain_check CHECK (domain IN ('spirit','body','work','wealth','family'));

-- ─── 4. Convert priority text → int2 with migration map
ALTER TABLE quill.tasks ADD COLUMN priority_int int2;
UPDATE quill.tasks SET priority_int = CASE priority
  WHEN 'urgent' THEN 3
  WHEN 'high'   THEN 2
  WHEN 'normal' THEN 1
  WHEN 'low'    THEN 0
  ELSE 1 END;
ALTER TABLE quill.tasks DROP COLUMN priority;
ALTER TABLE quill.tasks RENAME COLUMN priority_int TO priority;
ALTER TABLE quill.tasks ALTER COLUMN priority SET NOT NULL;
ALTER TABLE quill.tasks ALTER COLUMN priority SET DEFAULT 1;
ALTER TABLE quill.tasks ADD CONSTRAINT tasks_priority_check CHECK (priority BETWEEN 0 AND 3);

-- ─── 5. Add new columns to tasks
ALTER TABLE quill.tasks ADD COLUMN parent_id uuid REFERENCES quill.tasks(id) ON DELETE SET NULL;
ALTER TABLE quill.tasks ADD COLUMN source    text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','crucible','n8n'));
ALTER TABLE quill.tasks ADD COLUMN scheduled timestamptz; -- distinct from schedule_date

-- ─── 6. Create quill.inbox
CREATE TABLE quill.inbox (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  payload      jsonb       NOT NULL,
  source       text        NOT NULL CHECK (source IN ('crucible','n8n','manual')),
  received_at  timestamptz NOT NULL DEFAULT now(),
  triaged_at   timestamptz,
  task_id      uuid        REFERENCES quill.tasks(id) ON DELETE SET NULL
);
ALTER TABLE quill.inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON quill.inbox FOR ALL USING (true) WITH CHECK (true);

-- ─── 7. Computed views
CREATE OR REPLACE VIEW quill.tasks_ready AS
  SELECT t.* FROM quill.tasks t
  WHERE t.status = 'open'
    AND NOT EXISTS (
      SELECT 1 FROM quill.dependencies d
      JOIN quill.tasks blocker ON blocker.id = d.depends_on_task_id
      WHERE d.task_id = t.id AND blocker.status <> 'done'
    );

CREATE OR REPLACE VIEW quill.tasks_blocked AS
  SELECT t.* FROM quill.tasks t
  WHERE t.status = 'open'
    AND EXISTS (
      SELECT 1 FROM quill.dependencies d
      JOIN quill.tasks blocker ON blocker.id = d.depends_on_task_id
      WHERE d.task_id = t.id AND blocker.status <> 'done'
    );

CREATE OR REPLACE VIEW quill.tasks_today AS
  SELECT * FROM quill.tasks
  WHERE status = 'open'
    AND (schedule_date = CURRENT_DATE OR (due_date IS NOT NULL AND due_date <= CURRENT_DATE));

CREATE OR REPLACE VIEW quill.task_unblocks AS
  SELECT
    blocker.id    AS blocker_task_id,
    blocked.id    AS waiting_task_id,
    blocked.title AS waiting_task_title
  FROM quill.tasks blocker
  JOIN quill.dependencies d ON d.depends_on_task_id = blocker.id
  JOIN quill.tasks blocked  ON blocked.id = d.task_id
  WHERE blocked.status = 'open';
