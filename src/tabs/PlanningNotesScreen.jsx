import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import ViewHeader from '../components/ViewHeader';
import InlineError from '../components/InlineError';

const COLOR = {
  linen: '#F2EDE3', paper: '#FAF6EC', rule: '#D9CFB8', ruleSoft: '#E5DCC6',
  ink: '#1F1D18', ink2: '#5C5448', ink3: '#948A78', rubric: '#8E3A1A',
};

export default function PlanningNotesScreen() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: notesErr } = await supabase
        .schema('quill')
        .from('planning_notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (notesErr) throw notesErr;

      const allTaskIds = [...new Set((data ?? []).flatMap((n) => n.task_ids ?? []))];
      let tasksById = {};
      if (allTaskIds.length > 0) {
        const { data: tasks } = await supabase
          .schema('quill')
          .from('tasks')
          .select('id, title, status, domain')
          .in('id', allTaskIds);
        for (const t of tasks ?? []) tasksById[t.id] = t;
      }

      setNotes(
        (data ?? []).map((n) => ({
          ...n,
          linkedTasks: (n.task_ids ?? []).map((id) => tasksById[id]).filter(Boolean),
        }))
      );
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  return (
    <div style={{ minHeight: '100%', background: COLOR.linen }}>
      <ViewHeader kicker="PLANNING" title="Notes" dropCap="N" />

      {loading && (
        <div style={{
          padding: '24px 16px',
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 11, color: COLOR.ink3, letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          Loading…
        </div>
      )}

      {error && !loading && (
        <InlineError onRetry={fetchNotes}>Failed to load planning notes.</InlineError>
      )}

      {!loading && !error && notes.length === 0 && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 56, lineHeight: '0.6',
            color: COLOR.rubric, fontStyle: 'italic', marginBottom: 8,
          }}>"</div>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 20, lineHeight: '28px',
            color: COLOR.ink2, fontStyle: 'italic',
          }}>
            No planning notes yet.
          </div>
        </div>
      )}

      <div data-testid="planning-notes-list">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

function NoteCard({ note }) {
  const date = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      data-testid="planning-note-card"
      style={{
        background: COLOR.paper,
        margin: '0 16px 12px',
        borderRadius: 3,
        boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
        padding: '12px 16px',
      }}
    >
      <div style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10, color: COLOR.ink3, letterSpacing: '0.06em',
        textTransform: 'uppercase', marginBottom: 4,
      }}>
        {date}{note.event_ref ? ` · ${note.event_ref}` : ''}
      </div>

      <div style={{
        fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 500,
        color: COLOR.ink, marginBottom: 8,
      }}>
        {note.title}
      </div>

      {note.body && (
        <div style={{
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          fontSize: 14, color: COLOR.ink2, lineHeight: '1.55',
          whiteSpace: 'pre-wrap',
          marginBottom: note.linkedTasks.length > 0 ? 10 : 0,
        }}>
          {note.body}
        </div>
      )}

      {note.linkedTasks.length > 0 && (
        <div style={{ borderTop: `0.5px solid ${COLOR.ruleSoft}`, paddingTop: 8, marginTop: 4 }}>
          <div style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 10, color: COLOR.ink3, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 4,
          }}>
            Linked tasks · {note.linkedTasks.length}
          </div>
          {note.linkedTasks.map((t) => (
            <div key={t.id} style={{
              fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              fontSize: 13,
              color: t.status === 'done' ? COLOR.ink3 : COLOR.ink,
              textDecoration: t.status === 'done' ? 'line-through' : 'none',
              padding: '2px 0',
            }}>
              {t.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
