import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DOMAIN_ORDER, DOMAINS } from '../lib/domains';
import ViewHeader from '../components/ViewHeader';
import SectionHeader from '../components/SectionHeader';
import TaskRow from '../components/TaskRow';
import SkeletonTaskRow from '../components/SkeletonTaskRow';
import InlineError from '../components/InlineError';

const SCHEDULE_WEBHOOK = 'https://n8n.meridiantechco.com/webhook/schedule-suggestions';

const COLOR = {
  ink2: '#5C5448', ink3: '#948A78',
  paper: '#FAF6EC', rule: '#D9CFB8', rubric: '#8E3A1A',
};

// Within a domain group, sort by schedule_date asc (nulls last), then priority desc
function sortGroup(tasks) {
  return [...tasks].sort((a, b) => {
    const da = a.schedule_date ?? null;
    const db = b.schedule_date ?? null;
    if (da !== db) {
      if (da === null) return 1;
      if (db === null) return -1;
      return da.localeCompare(db);
    }
    return (b.priority ?? 1) - (a.priority ?? 1);
  });
}

export default function EverythingScreen() {
  const [tasks, setTasks] = useState([]);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduling, setScheduling] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, blockedRes] = await Promise.all([
        supabase.schema('quill').from('tasks').select('*, projects!project_id(name)')
          .eq('status', 'open'),
        supabase.schema('quill').from('tasks_blocked').select('id'),
      ]);
      if (allRes.error) throw allRes.error;
      if (blockedRes.error) throw blockedRes.error;
      setTasks(allRes.data ?? []);
      setBlockedIds(new Set((blockedRes.data ?? []).map((r) => r.id)));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleScheduleMyWeek = useCallback(async () => {
    setScheduling(true);
    try {
      await fetch(SCHEDULE_WEBHOOK, { method: 'POST' });
    } catch (_) {
      // silent — webhook may not be live yet (MTC-166 in backlog)
    } finally {
      setScheduling(false);
    }
  }, []);

  const handleComplete = useCallback((task) => {
    setTasks((ts) => ts.filter((t) => t.id !== task.id));
  }, []);

  const handleUndo = useCallback(() => { fetchAll(); }, [fetchAll]);

  const groups = {};
  for (const t of tasks) {
    if (!groups[t.domain]) groups[t.domain] = [];
    groups[t.domain].push(t);
  }
  for (const k of Object.keys(groups)) {
    groups[k] = sortGroup(groups[k]);
  }
  const orderedDomains = DOMAIN_ORDER.filter((d) => groups[d]?.length > 0);
  const total = tasks.length;
  const blockedTotal = tasks.filter((t) => blockedIds.has(t.id)).length;

  return (
    <div style={{ minHeight: '100%', background: '#F2EDE3' }}>
      <ViewHeader
        kicker="OPEN · ALL"
        title="Everything"
        dropCap="E"
        count={total}
        action={
          <button
            onClick={handleScheduleMyWeek}
            disabled={scheduling}
            style={{
              background: 'none',
              border: '0.5px solid #D9CFB8',
              borderRadius: 15,
              padding: '5px 12px',
              fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              fontSize: 10,
              fontWeight: 600,
              color: scheduling ? '#948A78' : '#5C5448',
              letterSpacing: '0.04em',
              cursor: scheduling ? 'default' : 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {scheduling ? 'Scheduling…' : 'Schedule my week'}
          </button>
        }
      />

      <div style={{
        margin: '0 16px 14px', padding: '8px 12px',
        background: COLOR.paper, borderRadius: 3,
        boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
        display: 'flex', alignItems: 'center', gap: 14,
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 11, color: COLOR.ink2, fontVariantNumeric: 'tabular-nums',
      }}>
        <TallyItem dotColor={COLOR.rubric} count={total} label="open" />
        <TallyItem dotColor={COLOR.ink3} count={blockedTotal} label="blocked" />
        <span style={{ flex: 1 }} />
        <span style={{ color: COLOR.ink3 }}>by domain</span>
      </div>

      {loading && (
        <div style={{
          background: COLOR.paper, margin: '0 16px', borderRadius: 3,
          boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
        }}>
          {[0, 1, 2, 3].map((i) => <SkeletonTaskRow key={i} noRule={i === 3} />)}
        </div>
      )}

      {error && !loading && (
        <InlineError onRetry={fetchAll}>Failed to load tasks.</InlineError>
      )}

      {!loading && !error && total === 0 && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 56, lineHeight: '0.6',
            color: COLOR.rubric, fontStyle: 'italic', marginBottom: 8,
          }}>"</div>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 20, lineHeight: '28px',
            color: COLOR.ink2, fontStyle: 'italic', marginBottom: 18,
          }}>
            Nothing open across any domain.
          </div>
        </div>
      )}

      {orderedDomains.map((k) => {
        const d = DOMAINS[k];
        const ts = groups[k];
        return (
          <div key={k} style={{ marginBottom: 12 }}>
            <SectionHeader label={d.label} count={ts.length} domain={k} accent={d.color} />
            <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
              {ts.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  showDomain={false}
                  noRule={i === ts.length - 1}
                  onComplete={handleComplete}
                  onUndo={handleUndo}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TallyItem({ dotColor, count, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor }} />
      <b style={{ color: '#1F1D18', fontWeight: 600 }}>{count}</b>
      <span style={{ color: '#948A78' }}>{label}</span>
    </span>
  );
}
