BEGIN;

-- Step 1: Port completion state from duplicate rows onto canonical rows

UPDATE quill.tasks
   SET status = 'done', completed_at = '2026-05-19 10:43:53.178+00'
 WHERE id = '9820beaa-a36f-44d3-9007-410f2d5018de'; -- Replace Air Filters

UPDATE quill.tasks
   SET status = 'done', completed_at = '2026-05-19 10:44:18.111+00'
 WHERE id = '0692dbd7-be56-4674-9824-8a9f0f64aa0a'; -- Date Night

UPDATE quill.tasks
   SET status = 'done', completed_at = '2026-05-08 02:13:41.663+00'
 WHERE id = '6fff7114-fb54-45e0-93bd-002bec0d3788'; -- Friend Check-In

UPDATE quill.tasks
   SET status = 'done', completed_at = '2026-05-19 00:24:40.545+00'
 WHERE id = '6b7050b1-3b02-4fdc-916b-a6fb12fbe73c'; -- Charley One-on-One

-- Step 2: Delete the 6 duplicate 5-08 rows

DELETE FROM quill.tasks
 WHERE id IN (
   '840d978a-d7d7-43af-8f5b-ba63b352184d', -- Replace Air Filters
   'e783e889-a4c7-426e-b790-f3cc7f0e8ac8', -- Date Night
   'bb8882bc-896e-401b-a7af-b2b8c6fa730c', -- Friend Check-In
   '4e9ac0bd-d863-4f51-858d-0c986f9c6827', -- Charley One-on-One
   '6d82b2d3-8111-44f1-8874-12097e94ee0f', -- Write up part for small group
   '7c5f5a6d-c93f-41f1-94df-72965cae1253'  -- Call Low Country Male to reorder T
 );

-- Step 3: Verification gate — abort if count is wrong

DO $$
DECLARE task_count integer;
BEGIN
  SELECT COUNT(*) INTO task_count FROM quill.tasks;
  IF task_count <> 10 THEN
    RAISE EXCEPTION 'Expected 10 rows in quill.tasks after dedup, got %. Rolling back.', task_count;
  END IF;
END $$;

-- Step 4: Sanity check before dropping public.*

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM public.tasks pt
  WHERE pt.status = 'open'
    AND pt.is_recurring = true
    AND NOT EXISTS (SELECT 1 FROM quill.tasks qt WHERE qt.id = pt.id);
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Sanity failed: % open recurring public.tasks row(s) have no quill.tasks counterpart.', missing_count;
  END IF;
END $$;

-- Step 5: Drop legacy public.* tables

DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.recurring_rhythms;
DROP TABLE IF EXISTS public.projects;

COMMIT;
