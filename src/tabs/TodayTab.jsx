import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DOMAIN_ORDER, DOMAINS } from '../lib/domains';
import { localTodayIso, addDaysIso } from '../lib/date';
import ViewHeader from '../components/ViewHeader';
import SectionHeader from '../components/SectionHeader';
import TaskRow from '../components/TaskRow';
import AddTaskFAB from '../components/AddTaskFAB';
import SkeletonTaskRow from '../components/SkeletonTaskRow';
import InlineError from '../components/InlineError';
import TripBanner from '../components/TripBanner';
import SuggestionCard from '../components/SuggestionCard';
import { useModal } from '../context/ModalContext';
import CalendarEventRow from '../components/CalendarEventRow';
import BlockCreatorSheet from '../components/BlockCreatorSheet';

const SCHEDULE_WEBHOOK = 'https://n8n.meridiantechco.com/webhook/schedule-suggestions';

const COLOR = {
  ink: '#1F1D18', ink2: '#5C5448', ink3: '#948A78',
  paper: '#FAF6EC', rule: '#D9CFB8', ruleSoft: '#E5DCC6', rubric: '#8E3A1A',
};

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function ordinalWord(n) {
  const words = {
    1: 'FIRST', 2: 'SECOND', 3: 'THIRD', 4: 'FOURTH', 5: 'FIFTH', 6: 'SIXTH',
    7: 'SEVENTH', 8: 'EIGHTH', 9: 'NINTH', 10: 'TENTH', 11: 'ELEVENTH',
    12: 'TWELFTH', 13: 'THIRTEENTH', 14: 'FOURTEENTH', 15: 'FIFTEENTH',
    16: 'SIXTEENTH', 17: 'SEVENTEENTH', 18: 'EIGHTEENTH', 19: 'NINETEENTH',
    20: 'TWENTIETH', 21: 'TWENTY-FIRST', 22: 'TWENTY-SECOND', 23: 'TWENTY-THIRD',
    24: 'TWENTY-FOURTH', 25: 'TWENTY-FIFTH', 26: 'TWENTY-SIXTH', 27: 'TWENTY-SEVENTH',
    28: 'TWENTY-EIGHTH', 29: 'TWENTY-NINTH', 30: 'THIRTIETH', 31: 'THIRTY-FIRST',
  };
  return words[n] ?? ordinal(n).toUpperCase();
}

function formatKicker(d) {
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dayWord = ordinalWord(d.getDate());
  return `${weekday} · THE ${dayWord}`;
}

export default function TodayTab() {
  const [openTasks, setOpenTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [trips, setTrips] = useState([]);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [doneCount, setDoneCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [scheduling, setScheduling] = useState(false);
  const [showBlockCreator, setShowBlockCreator] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const { openTaskModal } = useModal();
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const todayIso = localTodayIso();
      const tomorrowIso = addDaysIso(todayIso, 1);

      const [openByDateRes, openByTimeRes, tripsRes, blockedRes, doneRes, calendarRes] = await Promise.all([
        supabase.schema('quill').from('tasks').select('*, projects!project_id(name)')
          .eq('status', 'open')
          .neq('kind', 'trip')
          .or(`schedule_date.eq.${todayIso},and(due_date.not.is.null,due_date.lte.${todayIso})`),
        supabase.schema('quill').from('tasks').select('*, projects!project_id(name)')
          .eq('status', 'open')
          .gte('scheduled', `${todayIso}T00:00:00`)
          .lt('scheduled', `${tomorrowIso}T00:00:00`),
        supabase.schema('quill').from('tasks').select('*, projects!project_id(name)')
          .eq('status', 'open')
          .eq('kind', 'trip')
          .lte('schedule_date', todayIso)
          .gte('due_date', todayIso),
        supabase.schema('quill').from('tasks_blocked').select('id'),
        supabase.schema('quill').from('tasks').select('id', { count: 'exact', head: true })
          .eq('status', 'done')
          .gte('completed_at', todayIso)
          .lt('completed_at', tomorrowIso),
        supabase.schema('quill').from('calendar_events')
          .select('id, title, location, starts_at, ends_at, all_day')
          .gte('starts_at', `${todayIso}T00:00:00`)
          .lt('starts_at', `${tomorrowIso}T00:00:00`)
          .neq('status', 'cancelled')
          .order('starts_at', { ascending: true }),
      ]);

      if (openByDateRes.error) throw openByDateRes.error;
      if (openByTimeRes.error) throw openByTimeRes.error;
      if (tripsRes.error) throw tripsRes.error;
      if (blockedRes.error) throw blockedRes.error;
      if (doneRes.error) throw doneRes.error;
      if (calendarRes.error) throw calendarRes.error;

      const mergedById = new Map();
      for (const t of openByDateRes.data ?? []) mergedById.set(t.id, t);
      for (const t of openByTimeRes.data ?? []) mergedById.set(t.id, t);
      setOpenTasks(Array.from(mergedById.values()));
      setCalendarEvents(calendarRes.data ?? []);
      setTrips(tripsRes.data ?? []);
      setBlockedIds(new Set((blockedRes.data ?? []).map((r) => r.id)));
      setDoneCount(doneRes.count ?? 0);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const { data, error } = await supabase.schema('quill')
        .from('schedule_suggestions')
        .select('*, tasks!task_id(id, title, domain)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setSuggestions(data ?? []);
    } catch (e) {
      console.error('Failed to fetch suggestions:', e);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchSuggestions();
  }, [fetchAll, fetchSuggestions]);

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

  const handleConfirmAll = useCallback(async () => {
    const pending = [...suggestions];
    setSuggestions([]);
    try {
      await Promise.all(pending.flatMap((s) => [
        supabase.schema('quill').from('tasks')
          .update({ schedule_date: s.suggested_date }).eq('id', s.task_id),
        supabase.schema('quill').from('schedule_suggestions')
          .update({ status: 'confirmed' }).eq('id', s.id),
      ]));
      fetchAll();
    } catch (e) {
      console.error('Confirm all failed:', e);
      setSuggestions(pending);
    }
  }, [suggestions, fetchAll]);

  const handleComplete = useCallback((task) => {
    setOpenTasks((ts) => ts.filter((t) => t.id !== task.id));
    setDoneCount((n) => n + 1);
  }, []);

  const handleUndo = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  const isMeeting = (t) => t.kind === 'meeting' || t.kind === 'appointment';
  const visibleTasks =
    filter === 'tasks' ? openTasks.filter((t) => !isMeeting(t)) :
    filter === 'meetings' ? openTasks.filter(isMeeting) :
    filter === 'trips' ? [] :
    openTasks;
  const visibleTrips =
    filter === 'tasks' || filter === 'meetings' ? [] : trips;

  const groups = {};
  for (const t of visibleTasks) {
    if (!groups[t.domain]) groups[t.domain] = [];
    groups[t.domain].push(t);
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => {
      const aTimed = !!a.scheduled, bTimed = !!b.scheduled;
      if (aTimed && bTimed) return new Date(a.scheduled) - new Date(b.scheduled);
      if (aTimed) return -1;
      if (bTimed) return 1;
      return (b.priority ?? 1) - (a.priority ?? 1);
    });
  }
  const orderedDomains = DOMAIN_ORDER.filter((d) => groups[d]?.length > 0);

  const flatSorted = filter === 'time'
    ? [...visibleTasks].sort((a, b) => {
        const aTimed = !!a.scheduled, bTimed = !!b.scheduled;
        if (aTimed && bTimed) return new Date(a.scheduled) - new Date(b.scheduled);
        if (aTimed) return -1;
        if (bTimed) return 1;
        return (b.priority ?? 1) - (a.priority ?? 1);
      })
    : [];

  const todayIso = localTodayIso();
  const allDayEvents = calendarEvents.filter((e) => e.all_day);
  const timedItems = [
    ...calendarEvents
      .filter((e) => !e.all_day)
      .map((e) => ({ type: 'event', sortMs: new Date(e.starts_at).getTime(), data: e })),
    ...openTasks
      .filter((t) => t.scheduled != null)
      .map((t) => ({ type: 'task', sortMs: new Date(t.scheduled).getTime(), data: t })),
  ].sort((a, b) => a.sortMs - b.sortMs);
  const anytimeTasks = openTasks.filter((t) => !t.scheduled && t.schedule_date === todayIso);

  const openTotal = visibleTasks.length;
  const blockedTotal = visibleTasks.filter((t) => blockedIds.has(t.id)).length;
  const tallyVisible = filter !== 'trips' && filter !== 'calendar';
  const showTaskEmpty = !loading && !error && filter !== 'trips' && filter !== 'calendar' && visibleTasks.length === 0;
  const showTripEmpty = !loading && !error && filter === 'trips' && visibleTrips.length === 0;

  const emptyCopy =
    filter === 'meetings' ? 'No meetings on the day.' :
    filter === 'trips' ? 'No trips today.' :
    filter === 'tasks' ? 'No tasks on the page yet.' :
    'Nothing on the page yet.';

  const now = new Date();
  const kicker = formatKicker(now);

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'trips', label: 'Trips' },
    { id: 'time', label: 'By Time' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <div style={{ minHeight: '100%', background: '#F2EDE3' }}>
      <ViewHeader
        kicker={kicker}
        title="Today"
        dropCap="T"
        count={openTotal}
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

      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
        {FILTERS.map(({ id, label }) => {
          const on = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                background: on ? COLOR.ink : COLOR.paper,
                color: on ? COLOR.paper : COLOR.ink2,
                border: `0.5px solid ${on ? COLOR.ink : COLOR.rule}`,
                borderRadius: 15,
                padding: '5px 14px',
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                fontSize: 12,
                fontWeight: on ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {suggestions.length > 0 && !loading && (
        <div style={{ margin: '0 16px 12px' }}>
          <div style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 10, fontWeight: 600, color: '#948A78',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Schedule suggestions · {suggestions.length}
          </div>

          {suggestions.filter((s) => s.tasks).map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onConfirm={(confirmed) => {
                setSuggestions((prev) => prev.filter((x) => x.id !== confirmed.id));
                fetchAll();
              }}
              onReject={(rejected) => {
                setSuggestions((prev) => prev.filter((x) => x.id !== rejected.id));
              }}
            />
          ))}

          <button
            onClick={handleConfirmAll}
            style={{
              background: '#1F1D18',
              color: '#FAF6EC',
              border: 0,
              borderRadius: 3,
              padding: '9px 16px',
              fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              marginTop: 4,
            }}
          >
            Confirm all ({suggestions.length})
          </button>
        </div>
      )}

      {tallyVisible && (
        <div style={{
          margin: '0 16px 14px', padding: '8px 12px',
          background: COLOR.paper, borderRadius: 3,
          boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 11, color: COLOR.ink2, fontVariantNumeric: 'tabular-nums',
        }}>
          <TallyItem dotColor={COLOR.rubric} count={openTotal} label="open" />
          <TallyItem dotColor={COLOR.ink3}   count={blockedTotal} label="blocked" />
          <TallyItem dotColor={COLOR.ink}    count={doneCount} label="done" />
          <span style={{ flex: 1 }} />
          <span style={{ color: COLOR.ink3 }}>{filter === 'time' ? 'by time' : 'by domain'}</span>
        </div>
      )}

      {visibleTrips.map((trip) => (
        <TripBanner key={trip.id} trip={trip} />
      ))}

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

      {showTripEmpty && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 56, lineHeight: '0.6',
            color: COLOR.rubric, fontStyle: 'italic', marginBottom: 8,
          }}>"</div>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 20, lineHeight: '28px',
            color: COLOR.ink2, fontStyle: 'italic',
          }}>
            {emptyCopy}
          </div>
        </div>
      )}

      {showTaskEmpty && visibleTrips.length === 0 && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 56, lineHeight: '0.6',
            color: COLOR.rubric, fontStyle: 'italic', marginBottom: 8,
          }}>"</div>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 20, lineHeight: '28px',
            color: COLOR.ink2, fontStyle: 'italic', marginBottom: 18,
          }}>
            {emptyCopy}
          </div>
          {filter === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <PromptButton onClick={() => openTaskModal({}, { onSaved: fetchAll })}>
                Begin a new line
              </PromptButton>
              <PromptButton onClick={() => navigate('/someday')}>
                Pull from Someday
              </PromptButton>
            </div>
          )}
        </div>
      )}

      {filter !== 'time' && filter !== 'calendar' && orderedDomains.map((k) => {
        const d = DOMAINS[k];
        const tasks = groups[k];
        return (
          <div key={k} style={{ marginBottom: 12 }}>
            <SectionHeader label={d.label} count={tasks.length} domain={k} accent={d.color} />
            <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
              {tasks.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  showDomain={false}
                  noRule={i === tasks.length - 1}
                  onComplete={handleComplete}
                  onUndo={handleUndo}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filter === 'time' && flatSorted.length > 0 && (
        <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
          {flatSorted.map((t, i) => (
            <TaskRow
              key={t.id}
              task={t}
              showDomain={true}
              noRule={i === flatSorted.length - 1}
              onComplete={handleComplete}
              onUndo={handleUndo}
            />
          ))}
        </div>
      )}

      {filter === 'calendar' && (
        <div data-testid="calendar-view">
          <button
            data-testid="create-block-btn"
            onClick={() => setShowBlockCreator(true)}
            style={{
              background: 'none',
              border: '0.5px solid #D9CFB8',
              borderRadius: 4,
              padding: '5px 12px',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 10,
              color: '#5C5448',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: 10,
              marginLeft: 16,
            }}
          >
            + Block
          </button>
          <div data-testid="calendar-allday">
            <SectionHeader label="All day" count={allDayEvents.length} />
            {allDayEvents.length > 0 && (
              <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
                {allDayEvents.map((e, i) => (
                  <CalendarEventRow key={e.id} event={e} noRule={i === allDayEvents.length - 1} />
                ))}
              </div>
            )}
          </div>

          {timedItems.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
                {timedItems.map((item, i) => (
                  item.type === 'event'
                    ? <CalendarEventRow key={`e-${item.data.id}`} event={item.data} noRule={i === timedItems.length - 1} />
                    : <TaskRow key={`t-${item.data.id}`} task={item.data} showDomain={true} noRule={i === timedItems.length - 1} onComplete={handleComplete} onUndo={handleUndo} />
                ))}
              </div>
            </div>
          )}

          {anytimeTasks.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <SectionHeader label="Anytime today" count={anytimeTasks.length} />
              <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
                {anytimeTasks.map((t, i) => (
                  <TaskRow key={t.id} task={t} showDomain={true} noRule={i === anytimeTasks.length - 1} onComplete={handleComplete} onUndo={handleUndo} />
                ))}
              </div>
            </div>
          )}

          {allDayEvents.length === 0 && timedItems.length === 0 && anytimeTasks.length === 0 && (
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 56, lineHeight: '0.6', color: '#8E3A1A', fontStyle: 'italic', marginBottom: 8 }}>"</div>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 20, lineHeight: '28px', color: '#5C5448', fontStyle: 'italic' }}>
                Nothing on the calendar today.
              </div>
            </div>
          )}
        </div>
      )}

      <AddTaskFAB defaultValues={{ schedule_date: localTodayIso() }} onSaved={fetchAll} />

      <BlockCreatorSheet
        open={showBlockCreator}
        onClose={() => setShowBlockCreator(false)}
        onCreated={(event) => {
          setCalendarEvents(prev =>
            [...prev, event].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
          );
          setShowBlockCreator(false);
        }}
      />
    </div>
  );
}

function TallyItem({ dotColor, count, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor }} />
      <b style={{ color: COLOR.ink, fontWeight: 600 }}>{count}</b>
      <span style={{ color: COLOR.ink3 }}>{label}</span>
    </span>
  );
}

function PromptButton({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 0, padding: '6px 0', cursor: 'pointer',
      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      fontSize: 11, fontWeight: 600, color: '#948A78',
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {children}
    </button>
  );
}
