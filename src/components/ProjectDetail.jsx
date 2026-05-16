import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DOMAINS } from '../lib/domains';
import DomainChip from './DomainChip';
import SectionHeader from './SectionHeader';
import TaskRow from './TaskRow';
import Icon from './Icon';
import AddTaskFAB from './AddTaskFAB';

const COLOR = {
  ink:      '#1F1D18',
  ink2:     '#5C5448',
  ink3:     '#948A78',
  linen:    '#F2EDE3',
  paper:    '#FAF6EC',
  rule:     '#D9CFB8',
  ruleSoft: '#E5DCC6',
  rubric:   '#8E3A1A',
};

const MAX_INDENT = 3;

function buildTree(tasks) {
  const byParent = new Map();
  for (const t of tasks) {
    const k = t.parent_id || null;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k).push(t);
  }
  const result = [];
  const seen = new Set();
  function visit(parentId, indent) {
    const children = byParent.get(parentId) || [];
    for (const t of children) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      const grandchildren = byParent.get(t.id) || [];
      result.push({ task: t, indent, hasChildren: grandchildren.length > 0 });
      if (indent < MAX_INDENT && grandchildren.length > 0) {
        visit(t.id, indent + 1);
      }
    }
  }
  visit(null, 0);
  // Capture orphans whose parent_id points outside this project (treat as root)
  for (const t of tasks) {
    if (!seen.has(t.id)) {
      const grandchildren = byParent.get(t.id) || [];
      result.push({ task: t, indent: 0, hasChildren: grandchildren.length > 0 });
      seen.add(t.id);
    }
  }
  return result;
}

export default function ProjectDetail({ project, onBack, onProjectUpdated }) {
  const [tasks, setTasks] = useState([]);
  const [readyIds, setReadyIds] = useState(new Set());
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [tasksRes, readyRes, blockedRes] = await Promise.all([
      supabase
        .schema('quill')
        .from('tasks')
        .select('*, projects!project_id(name)')
        .eq('project_id', project.id),
      supabase
        .schema('quill')
        .from('tasks_ready')
        .select('id')
        .eq('project_id', project.id),
      supabase
        .schema('quill')
        .from('tasks_blocked')
        .select('id')
        .eq('project_id', project.id),
    ]);
    setTasks(tasksRes.data ?? []);
    setReadyIds(new Set((readyRes.data ?? []).map((r) => r.id)));
    setBlockedIds(new Set((blockedRes.data ?? []).map((r) => r.id)));
    setLoading(false);
  }, [project.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const counts = {
    done:    tasks.filter((t) => t.status === 'done').length,
    ready:   tasks.filter((t) => t.status === 'open' && readyIds.has(t.id)).length,
    blocked: tasks.filter((t) => t.status === 'open' && blockedIds.has(t.id)).length,
    open:    tasks.filter((t) => t.status === 'open').length,
    total:   tasks.length,
  };

  const tree = buildTree(tasks.filter((t) => t.status !== 'done'));

  return (
    <div style={{ paddingBottom: 96 }}>
      {/* Back nav */}
      <div style={{ padding: '12px 16px 0' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 11,
            color: COLOR.ink3,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="chevron-l" size={12} sw={1.6} /> Projects
        </button>
      </div>

      {/* Head */}
      <div style={{ padding: '8px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <DomainChip domain={project.domain} />
          <span style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 10,
            color: COLOR.ink3,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>{counts.total} TASKS</span>
        </div>
        <h1 style={{
          fontFamily: 'Newsreader, serif',
          fontSize: 26,
          lineHeight: '30px',
          color: COLOR.ink,
          fontWeight: 500,
          margin: 0,
          letterSpacing: '-0.3px',
        }}>{project.name}</h1>
        {project.description && (
          <div style={{
            marginTop: 4,
            fontFamily: 'Newsreader, serif',
            fontStyle: 'italic',
            fontSize: 14,
            color: COLOR.ink2,
            lineHeight: '19px',
          }}>
            {project.description}
          </div>
        )}

        {/* 13-segment ledger */}
        <div style={{ marginTop: 14, display: 'flex', gap: 3 }}>
          {Array.from({ length: 13 }).map((_, i) => {
            const filledDone    = (i / 13) < (counts.done / Math.max(counts.total, 1));
            const filledReady   = (i / 13) < ((counts.done + counts.ready) / Math.max(counts.total, 1));
            const filledBlocked = (i / 13) < ((counts.done + counts.ready + counts.blocked) / Math.max(counts.total, 1));
            let bg = COLOR.ruleSoft;
            let hatch = false;
            if (filledDone) bg = COLOR.ink;
            else if (filledReady) bg = COLOR.rubric;
            else if (filledBlocked) hatch = true;
            return (
              <span key={i} style={{
                flex: 1,
                height: 8,
                borderRadius: 1,
                background: hatch
                  ? `repeating-linear-gradient(45deg, ${COLOR.ruleSoft} 0 2px, transparent 2px 4px)`
                  : bg,
                boxShadow: hatch ? `inset 0 0 0 0.5px ${COLOR.ink3}` : 'none',
              }} />
            );
          })}
        </div>

        {/* 4-stat tiles */}
        <div style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          <StatTile label="DONE"    n={counts.done}    color={COLOR.ink} />
          <StatTile label="READY"   n={counts.ready}   color={COLOR.rubric} />
          <StatTile label="BLOCKED" n={counts.blocked} color={COLOR.ink2} />
          <StatTile label="OPEN"    n={counts.open}    color={COLOR.ink} />
        </div>
      </div>

      <SectionHeader label="Manuscript" count={tree.length} />

      {loading && (
        <div style={{
          padding: '40px 16px',
          textAlign: 'center',
          fontFamily: 'Newsreader, serif',
          fontStyle: 'italic',
          fontSize: 16,
          color: COLOR.ink3,
        }}>Loading…</div>
      )}
      {!loading && tree.length === 0 && (
        <div style={{
          padding: '40px 16px',
          textAlign: 'center',
          fontFamily: 'Newsreader, serif',
          fontStyle: 'italic',
          fontSize: 16,
          color: COLOR.ink3,
        }}>
          No open tasks in this project.
        </div>
      )}
      {tree.length > 0 && (
        <div style={{
          background: COLOR.paper,
          margin: '0 16px',
          borderRadius: 3,
          boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
        }}>
          {tree.map(({ task, indent, hasChildren }, i) => (
            <TaskRow
              key={task.id}
              task={{ ...task, domain: project.domain }}
              showDomain={false}
              indent={indent}
              hasChildren={hasChildren}
              noRule={i === tree.length - 1}
              onComplete={() => { fetchData(); onProjectUpdated?.(); }}
              onUndo={() => { fetchData(); onProjectUpdated?.(); }}
            />
          ))}
        </div>
      )}

      <AddTaskFAB
        defaultValues={{ project_id: project.id, domain: project.domain }}
        onSaved={() => { fetchData(); onProjectUpdated?.(); }}
      />
    </div>
  );
}

function StatTile({ label, n, color }) {
  return (
    <div style={{
      background: COLOR.paper,
      borderRadius: 3,
      boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
      padding: '8px 10px',
      textAlign: 'left',
    }}>
      <div style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10,
        color: COLOR.ink3,
        letterSpacing: '0.06em',
        fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontFamily: 'Newsreader, serif',
        fontSize: 22,
        lineHeight: '26px',
        color,
        fontWeight: 500,
      }}>{n}</div>
    </div>
  );
}
