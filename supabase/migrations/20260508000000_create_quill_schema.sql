-- Migration: create_quill_schema
-- CRU-94: Design and create quill schema in CrucibleOS Supabase

CREATE SCHEMA IF NOT EXISTS quill;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── quill.projects ──────────────────────────────────────────────────────────
CREATE TABLE quill.projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text,
  domain      text        NOT NULL CHECK (domain IN ('Spirit','Body','Project','Wealth','Family')),
  status      text        NOT NULL DEFAULT 'active' CHECK (status IN ('active','waiting','complete','archived')),
  goal        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── quill.tasks ─────────────────────────────────────────────────────────────
CREATE TABLE quill.tasks (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  notes         text,
  domain        text        NOT NULL CHECK (domain IN ('Spirit','Body','Project','Wealth','Family')),
  priority      text        NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent','high','normal','low')),
  status        text        NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','cancelled')),
  schedule_date date,
  due_date      date,
  completed_at  timestamptz,
  is_recurring  boolean     NOT NULL DEFAULT false,
  rrule         text,
  project_id    uuid        REFERENCES quill.projects (id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── quill.dependencies ──────────────────────────────────────────────────────
CREATE TABLE quill.dependencies (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id            uuid        NOT NULL REFERENCES quill.tasks (id) ON DELETE CASCADE,
  depends_on_task_id uuid        NOT NULL REFERENCES quill.tasks (id) ON DELETE CASCADE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, depends_on_task_id),
  CHECK (task_id <> depends_on_task_id)
);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION quill.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON quill.tasks
  FOR EACH ROW EXECUTE FUNCTION quill.set_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON quill.projects
  FOR EACH ROW EXECUTE FUNCTION quill.set_updated_at();

-- ─── indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_tasks_schedule_date ON quill.tasks (schedule_date);
CREATE INDEX idx_tasks_status        ON quill.tasks (status);
CREATE INDEX idx_tasks_domain        ON quill.tasks (domain);
CREATE INDEX idx_tasks_project_id    ON quill.tasks (project_id);
CREATE INDEX idx_tasks_completed_at  ON quill.tasks (completed_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE quill.tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quill.projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quill.dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_tasks"        ON quill.tasks        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_projects"     ON quill.projects     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_dependencies" ON quill.dependencies FOR ALL USING (true) WITH CHECK (true);
