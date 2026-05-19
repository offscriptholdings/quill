import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DOMAINS, DOMAIN_ORDER } from '../lib/domains';
import DomainChip from '../components/DomainChip';
import TaskRow from '../components/TaskRow';
import Icon from '../components/Icon';

const COLOR = { ink:'#1F1D18', ink2:'#5C5448', ink3:'#948A78', linen:'#F2EDE3', paper:'#FAF6EC', rule:'#D9CFB8', ruleSoft:'#E5DCC6', rubric:'#8E3A1A' };

export default function TaskDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [waitingOn, setWaitingOn] = useState([]);
  const [unblocks, setUnblocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [pickerOpen, setPickerOpen] = useState(null);
  const [domainPickerOpen, setDomainPickerOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [taskRes, depsRes, unblocksRes] = await Promise.all([
      supabase.schema('quill').from('tasks')
        .select('*, projects!project_id(id, name, domain)').eq('id', id).single(),
      supabase.schema('quill').from('dependencies')
        .select('depends_on_task_id, depends_on:depends_on_task_id(id, title, status, domain, priority, projects!project_id(name))')
        .eq('task_id', id),
      supabase.schema('quill').from('dependencies')
        .select('task_id, waiter:task_id(id, title, status, domain, priority, projects!project_id(name))')
        .eq('depends_on_task_id', id),
    ]);
    setTask(taskRes.data ?? null);
    setNotes(taskRes.data?.notes ?? '');
    setWaitingOn((depsRes.data ?? []).map((r) => r.depends_on).filter(Boolean));
    setUnblocks((unblocksRes.data ?? []).map((r) => r.waiter).filter(Boolean));
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveNotes = useCallback(async () => {
    if (!task || notes === (task.notes ?? '')) return;
    await supabase.schema('quill').from('tasks').update({ notes }).eq('id', task.id);
    setTask((t) => ({ ...t, notes }));
  }, [task, notes]);

  const linkDependencies = useCallback(async (direction, ids) => {
    if (!task || ids.length === 0) return;
    const rows = ids.map((otherId) =>
      direction === 'waiting'
        ? { task_id: task.id, depends_on_task_id: otherId }
        : { task_id: otherId, depends_on_task_id: task.id }
    );
    const { error } = await supabase.schema('quill').from('dependencies').insert(rows);
    if (error && error.code !== '23505') {
      console.error('linkDependencies failed', error);
    }
    setPickerOpen(null);
    fetchAll();
  }, [task, fetchAll]);

  const unlinkDependency = useCallback(async (direction, otherId) => {
    if (!task) return;
    const filter = direction === 'waiting'
      ? { task_id: task.id, depends_on_task_id: otherId }
      : { task_id: otherId, depends_on_task_id: task.id };
    await supabase.schema('quill').from('dependencies').delete()
      .eq('task_id', filter.task_id).eq('depends_on_task_id', filter.depends_on_task_id);
    fetchAll();
  }, [task, fetchAll]);

  if (loading) {
    return <div style={{ padding: '40px 16px', textAlign: 'center', fontFamily: 'Newsreader, serif', fontStyle: 'italic', color: COLOR.ink3 }}>Loading…</div>;
  }
  if (!task) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Newsreader, serif', fontStyle: 'italic', fontSize: 16, color: COLOR.ink3, marginBottom: 12 }}>Task not found.</div>
        <button onClick={() => navigate('/today')} style={btnTextStyle(COLOR.ink)}>Back to Today</button>
      </div>
    );
  }

  const projectName = task.projects?.name;
  const projectId = task.projects?.id;

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 6px', gap: 6 }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:0, padding:0, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, color: COLOR.ink3 }}>
          <Icon name="chevron-l" size={12} sw={1.6} />
          <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {projectName ?? 'Tasks'}
          </span>
        </button>
      </div>

      <div style={{ padding: '6px 16px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <DomainChip
          domain={task.domain}
          onPress={() => setDomainPickerOpen((v) => !v)}
        />
        {task.due_date && (
          <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: 10, fontWeight: 600, color: COLOR.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Due {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {domainPickerOpen && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 16px 14px' }}>
          {DOMAIN_ORDER.map((d) => (
            <DomainChip
              key={d}
              domain={d}
              onPress={async () => {
                await supabase.schema('quill').from('tasks').update({ domain: d }).eq('id', task.id);
                setTask((t) => ({ ...t, domain: d }));
                setDomainPickerOpen(false);
              }}
            />
          ))}
        </div>
      )}

      <div style={{ padding: '0 16px 12px' }}>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, lineHeight: '34px', color: COLOR.ink, fontWeight: 500, margin: 0, letterSpacing: '-0.3px' }}>
          {task.title}
        </h1>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ borderLeft: `2px solid ${COLOR.rubric}`, paddingLeft: 12 }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Notes…"
            style={{
              width: '100%', minHeight: 60,
              background: 'transparent', border: 0, outline: 'none', resize: 'vertical',
              fontFamily: 'Newsreader, serif', fontStyle: 'italic', fontSize: 16, lineHeight: '22px',
              color: notes ? COLOR.ink2 : COLOR.ink3, fontWeight: 400,
            }}
          />
        </div>
      </div>

      <div style={{ background: COLOR.paper, margin: '0 16px 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
        <Row label="DO ON">
          <input
            type="date"
            value={task.schedule_date ?? ''}
            onChange={async (e) => {
              const v = e.target.value || null;
              await supabase.schema('quill').from('tasks').update({ schedule_date: v }).eq('id', task.id);
              setTask((t) => ({ ...t, schedule_date: v }));
            }}
            style={{ background: 'transparent', border: 0, outline: 'none', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: COLOR.ink, textAlign: 'right' }}
          />
        </Row>
        <Row label="DUE">
          <input
            type="date"
            value={task.due_date ?? ''}
            onChange={async (e) => {
              const v = e.target.value || null;
              await supabase.schema('quill').from('tasks').update({ due_date: v }).eq('id', task.id);
              setTask((t) => ({ ...t, due_date: v }));
            }}
            style={{ background: 'transparent', border: 0, outline: 'none', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: COLOR.ink, textAlign: 'right' }}
          />
        </Row>
        <Row label="REPEAT">
          <select
            value={task.is_recurring ? (task.rrule ?? 'CUSTOM') : 'NONE'}
            onChange={async (e) => {
              const v = e.target.value;
              const is_recurring = v !== 'NONE';
              const rrule = is_recurring ? v : null;
              await supabase.schema('quill').from('tasks').update({ is_recurring, rrule }).eq('id', task.id);
              setTask((t) => ({ ...t, is_recurring, rrule }));
            }}
            style={{ background: 'transparent', border: 0, outline: 'none', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: task.is_recurring ? COLOR.ink : COLOR.ink3, textAlign: 'right', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="NONE">Never</option>
            <option value="FREQ=DAILY">Daily</option>
            <option value="FREQ=WEEKLY">Weekly</option>
            <option value="FREQ=WEEKLY;INTERVAL=2">Biweekly</option>
            <option value="FREQ=MONTHLY">Monthly</option>
            <option value="FREQ=YEARLY">Yearly</option>
            {task.is_recurring && task.rrule && !['FREQ=DAILY','FREQ=WEEKLY','FREQ=WEEKLY;INTERVAL=2','FREQ=MONTHLY','FREQ=YEARLY'].includes(task.rrule) && (
              <option value={task.rrule}>{task.rrule}</option>
            )}
          </select>
        </Row>
        <Row label="PRIORITY">
          <select
            value={String(task.priority ?? 1)}
            onChange={async (e) => {
              const p = parseInt(e.target.value, 10);
              await supabase.schema('quill').from('tasks').update({ priority: p }).eq('id', task.id);
              setTask((t) => ({ ...t, priority: p }));
            }}
            style={{ background: 'transparent', border: 0, outline: 'none', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: COLOR.ink, textAlign: 'right', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="0">Low</option>
            <option value="1">Normal</option>
            <option value="2">High</option>
            <option value="3">Urgent</option>
          </select>
        </Row>
        <Row label="PROJECT">
          {projectId ? (
            <button onClick={() => navigate(`/projects`)} style={btnTextStyle(COLOR.ink)}>{projectName}</button>
          ) : (
            <span style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: COLOR.ink3 }}>—</span>
          )}
        </Row>
      </div>

      <DependencySection
        title="WAITING ON"
        items={waitingOn}
        emptyText="Not waiting on anything."
        onAdd={() => setPickerOpen('waiting')}
        onUnlink={(otherId) => unlinkDependency('waiting', otherId)}
      />

      <DependencySection
        title="UNBLOCKS"
        items={unblocks}
        emptyText="Doesn't unblock anything."
        onAdd={() => setPickerOpen('unblocks')}
        onUnlink={(otherId) => unlinkDependency('unblocks', otherId)}
      />

      <div style={{
        padding: '16px 16px 0',
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10, color: COLOR.ink3,
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        Created {formatDate(task.created_at)} · Modified {formatDate(task.updated_at)} · Source: {task.source || 'manual'}
      </div>

      {pickerOpen && (
        <DependencyPicker
          currentTaskId={task.id}
          currentProjectId={projectId}
          direction={pickerOpen}
          excludeIds={(pickerOpen === 'waiting' ? waitingOn : unblocks).map((t) => t.id)}
          onCancel={() => setPickerOpen(null)}
          onConfirm={(ids) => linkDependencies(pickerOpen, ids)}
        />
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px',
      borderBottom: `0.5px solid ${COLOR.ruleSoft}`,
    }}>
      <span style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10, fontWeight: 600, color: COLOR.ink3,
        letterSpacing: '0.07em',
      }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0, textAlign: 'right', marginLeft: 12 }}>{children}</span>
    </div>
  );
}

function DependencySection({ title, items, emptyText, onAdd, onUnlink }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        padding: '6px 16px',
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10, fontWeight: 600, color: COLOR.ink3,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{title}</span>
        <span style={{ flex: 1, height: 1, background: COLOR.rule, marginLeft: 4, opacity: 0.7 }} />
        <button onClick={onAdd} style={btnTextStyle(COLOR.rubric)}>+ link</button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '6px 16px', fontFamily: 'Newsreader, serif', fontStyle: 'italic', fontSize: 13, color: COLOR.ink3 }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
          {items.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <TaskRow task={t} showDomain={false} noRule={i === items.length - 1} />
              </div>
              <button onClick={() => onUnlink(t.id)} style={{ padding: '0 14px', background:'transparent', border:0, cursor:'pointer', color: COLOR.ink3 }} aria-label="Unlink">
                <Icon name="x" size={14} sw={1.6} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DependencyPicker({ currentTaskId, currentProjectId, direction, excludeIds, onCancel, onConfirm }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(currentProjectId ? 'project' : 'all');
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    (async () => {
      const sel = supabase.schema('quill').from('tasks').select('id, title, status, domain, project_id, projects!project_id(name)').eq('status', 'open').neq('id', currentTaskId);
      if (scope === 'project' && currentProjectId) sel.eq('project_id', currentProjectId);
      const { data } = await sel.limit(200);
      setTasks((data ?? []).filter((t) => !excludeIds.includes(t.id)));
    })();
  }, [scope, currentTaskId, currentProjectId, excludeIds]);

  const filtered = query
    ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : tasks;

  function toggle(id) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,24,0.32)', zIndex: 60 }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: COLOR.linen, borderTopLeftRadius: 18, borderTopRightRadius: 18,
        boxShadow: '0 -8px 32px rgba(31,29,24,0.18)',
        padding: '8px 16px calc(24px + env(safe-area-inset-bottom))',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: COLOR.rule }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: 12, fontWeight: 600, color: COLOR.ink3, letterSpacing: '0.08em' }}>
            {direction === 'waiting' ? 'LINK BLOCKER' : 'LINK WAITER'}
          </span>
          <span style={{ flex: 1 }} />
          <button onClick={onCancel} style={btnTextStyle(COLOR.ink3)}>Cancel</button>
          <button onClick={() => onConfirm([...selected])} disabled={selected.size === 0} style={btnPillStyle(COLOR.ink, COLOR.linen)}>
            Link {selected.size > 0 ? selected.size : ''}
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks…"
          style={{ width: '100%', padding: '10px 12px', background: COLOR.paper, border: 0, outline: 'none', borderRadius: 8, fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 14, color: COLOR.ink, marginBottom: 10 }}
        />
        {currentProjectId && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button onClick={() => setScope('project')} style={pillBtn(scope === 'project')}>This project</button>
            <button onClick={() => setScope('all')} style={pillBtn(scope === 'all')}>All open</button>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: 'Newsreader, serif', fontStyle: 'italic', color: COLOR.ink3 }}>No tasks match.</div>
          ) : filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 4px', background: 'transparent', border: 0, cursor: 'pointer',
                borderBottom: `0.5px solid ${COLOR.ruleSoft}`, textAlign: 'left',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 4,
                background: selected.has(t.id) ? COLOR.ink : 'transparent',
                boxShadow: `inset 0 0 0 1px ${selected.has(t.id) ? COLOR.ink : COLOR.rule}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected.has(t.id) && <Icon name="check" size={12} sw={2} style={{ color: COLOR.linen }} />}
              </span>
              <span style={{ flex: 1, fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 14, color: COLOR.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.title}
              </span>
              {t.projects?.name && (
                <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: 10, color: COLOR.ink3 }}>{t.projects.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(s) {
  if (!s) return '';
  const d = typeof s === 'string' ? new Date(s) : s;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function btnTextStyle(color) {
  return { background:'none', border:0, padding:'8px 4px', cursor:'pointer', fontFamily:'"IBM Plex Sans", system-ui, sans-serif', fontSize:13, color };
}
function btnPillStyle(bg, fg) {
  return { background:bg, color:fg, border:0, borderRadius:15, padding:'8px 14px', cursor:'pointer', fontFamily:'"IBM Plex Sans", system-ui, sans-serif', fontSize:13, fontWeight:600 };
}
function pillBtn(active) {
  return {
    padding:'4px 10px', borderRadius:13, border:0, cursor:'pointer',
    background: active ? COLOR.ink : 'transparent',
    color: active ? COLOR.linen : COLOR.ink2,
    boxShadow: active ? 'none' : `inset 0 0 0 0.5px ${COLOR.rule}`,
    fontFamily:'"IBM Plex Sans", system-ui, sans-serif', fontSize:12, fontWeight:500,
  };
}
