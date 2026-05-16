import { useEffect, useState } from 'react';

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Accept-Profile': 'quill',
};

/**
 * Returns the derived state for a task: 'open' | 'ready' | 'blocked' | 'done'.
 *
 * Lookup strategy:
 *  1. task.status === 'done' → 'done' (no fetch)
 *  2. Check quill.tasks_ready view  → 'ready' if present
 *  3. Check quill.tasks_blocked view → 'blocked' if present
 *  4. Else → 'open'
 *
 * @param {{id: string, status: string}} task
 * @returns {{state: 'open'|'ready'|'blocked'|'done', loading: boolean}}
 */
export function useTaskState(task) {
  const [state, setState] = useState(task?.status === 'done' ? 'done' : 'open');
  const [loading, setLoading] = useState(task?.status !== 'done');

  useEffect(() => {
    if (!task?.id || task.status === 'done') {
      setState(task?.status === 'done' ? 'done' : 'open');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function check(view) {
      const res = await fetch(
        `${SB_URL}/rest/v1/${view}?id=eq.${task.id}&select=id&limit=1`,
        { headers: HEADERS },
      );
      if (!res.ok) return false;
      const rows = await res.json();
      return Array.isArray(rows) && rows.length > 0;
    }

    (async () => {
      try {
        if (await check('tasks_ready')) {
          if (!cancelled) setState('ready');
        } else if (await check('tasks_blocked')) {
          if (!cancelled) setState('blocked');
        } else {
          if (!cancelled) setState('open');
        }
      } catch {
        if (!cancelled) setState('open');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [task?.id, task?.status]);

  return { state, loading };
}
