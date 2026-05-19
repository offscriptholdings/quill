import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { DOMAINS } from '../lib/domains';
import { localTodayIso, addDaysIso } from '../lib/date';
import { useTaskState } from '../hooks/useTaskState';
import { useTaskComplete } from '../hooks/useTaskComplete';
import TaskCheck from './TaskCheck';
import PriorityMark from './PriorityMark';
import Icon from './Icon';

const COLOR = {
  ink:       '#1F1D18',
  ink2:      '#5C5448',
  ink3:      '#948A78',
  linen:     '#F2EDE3',
  rule:      '#D9CFB8',
  ruleSoft:  '#E5DCC6',
  rubric:    '#8E3A1A',
};

function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Returns { text, tone } | null
// Priority: Overdue → Due today → Do on (future schedule_date) → Due (future due_date)
// "Do on" pops first; on the due_date it becomes "Due"; after, "Overdue".
function formatDateLabel(task) {
  if (!task) return null;
  const today = localTodayIso();
  const tomorrow = addDaysIso(today, 1);

  // 1. Overdue — due_date in the past + still open
  if (task.due_date && task.due_date < today && task.status === 'open') {
    return { text: 'overdue', tone: 'rubric' };
  }
  // 2. Due today
  if (task.due_date === today) {
    return { text: 'due today', tone: 'rubric' };
  }
  // 3. Do on (schedule_date in future) — pops before due_date label kicks in
  if (task.schedule_date && task.schedule_date > today) {
    if (task.schedule_date === tomorrow) return { text: 'do on tomorrow', tone: 'ink2' };
    return { text: `do on ${shortDate(task.schedule_date)}`, tone: 'ink2' };
  }
  // 4. Future due_date (schedule_date already passed or absent)
  if (task.due_date && task.due_date > today) {
    if (task.due_date === tomorrow) return { text: 'due tomorrow', tone: 'ink2' };
    return { text: `due ${shortDate(task.due_date)}`, tone: 'ink2' };
  }
  return null;
}

/**
 * Task row — 56px min-height, domain left-rule, mono meta, swipe to complete / reveal.
 * Consumer API preserved: pass `task` + callbacks.
 */
export default function TaskRow({
  task,
  onComplete, onUndo, onEdit,
  showDomain = true,
  completed = false,
  indent = 0,
  hasChildren = false,
  expanded = true,
  noRule = false,
  today: todayProp,
  onSnooze, onDelete, onLongPress,
}) {
  const { state: derivedState } = useTaskState(task);
  const { completeTask } = useTaskComplete();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(completed || derivedState === 'done');
  const [revealLeft, setRevealLeft] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const longPressTimer = useRef(null);

  const state = completing ? 'done' : derivedState;
  const dim = state === 'done';
  const d = DOMAINS[task?.domain];

  const todayIso = localTodayIso();
  const today = todayProp ?? (task?.schedule_date === todayIso);

  const handleComplete = useCallback(() => {
    if (!task?.id || completing) return;
    setCompleting(true);
    setRevealLeft(false);
    if (navigator.vibrate) navigator.vibrate(50);
    completeTask(task, {
      onOptimistic: () => onComplete?.(task),
      onRevert: () => setCompleting(false),
      onUndo: () => onUndo?.(task),
    });
  }, [task, completing, completeTask, onComplete, onUndo]);

  const handleEdit = useCallback(() => {
    setRevealLeft(false);
    if (onEdit) onEdit(task);
    else navigate('/task/' + task.id);
  }, [task, onEdit, navigate]);

  const handleSnooze = useCallback(() => {
    setRevealLeft(false);
    onSnooze?.(task);
  }, [task, onSnooze]);

  const handleDelete = useCallback(() => {
    setRevealLeft(false);
    onDelete?.(task);
  }, [task, onDelete]);

  const startLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setBulkMode(true);
      if (navigator.vibrate) navigator.vibrate(20);
      onLongPress?.(task);
    }, 500);
  }, [task, onLongPress]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedRight: (e) => { if (e.absX > 88) handleComplete(); },
    onSwipedLeft:  (e) => { if (e.absX > 88) setRevealLeft(true); },
    onTap: () => { if (revealLeft) setRevealLeft(false); },
    trackTouch: true,
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  if (!task) return null;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      }}
      {...swipeHandlers}
      onMouseDown={startLongPress}
      onTouchStart={(e) => { startLongPress(); swipeHandlers.onTouchStart?.(e); }}
      onMouseUp={cancelLongPress}
      onTouchEnd={(e) => { cancelLongPress(); swipeHandlers.onTouchEnd?.(e); }}
      onMouseLeave={cancelLongPress}
    >
      {revealLeft && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          background: COLOR.linen, zIndex: 1,
        }}>
          <button onClick={handleSnooze} style={pillStyle(COLOR.ink2)}>Snooze</button>
          <button onClick={handleEdit}   style={pillStyle(COLOR.ink)}>Edit</button>
          <button onClick={handleDelete} style={pillStyle(COLOR.rubric)}>Delete</button>
        </div>
      )}

      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: `10px 16px 10px ${16 + indent * 18}px`,
        minHeight: 56, boxSizing: 'border-box',
        borderBottom: noRule ? 'none' : `0.5px solid ${COLOR.ruleSoft}`,
        background: COLOR.linen,
        transform: revealLeft ? 'translateX(-200px)' : 'translateX(0)',
        transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)',
        opacity: dim ? 0.6 : 1,
      }}>
        {d && (
          <span style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 2, background: d.color,
          }} />
        )}
        {today && !d && (
          <span style={{
            position: 'absolute', left: 4, top: 14, bottom: 14,
            width: 2, background: COLOR.rubric, borderRadius: 1,
          }} />
        )}
        {indent > 0 && (
          <span style={{
            position: 'absolute',
            left: 16 + (indent - 1) * 18 + 11, top: 0, height: 22,
            width: 1, background: COLOR.rule,
          }} />
        )}
        {indent > 0 && (
          <span style={{
            position: 'absolute',
            left: 16 + (indent - 1) * 18 + 11, top: 22,
            width: 10, height: 1, background: COLOR.rule,
          }} />
        )}
        {bulkMode && (
          <span style={{
            position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)',
            width: 18, height: 18, borderRadius: 9,
            border: `2px solid ${COLOR.rubric}`,
          }} />
        )}
        <div style={{ paddingTop: 4, position: 'relative' }}>
          <TaskCheck state={state} size={22} onPress={handleComplete} />
          {hasChildren && (
            <span style={{
              position: 'absolute', left: -2, top: -2,
              width: 26, height: 26, borderRadius: 13,
              border: `1px dashed ${COLOR.ink3}`, opacity: 0.5, pointerEvents: 'none',
            }} />
          )}
        </div>
        <button
          onClick={handleEdit}
          style={{
            flex: 1, minWidth: 0, textAlign: 'left',
            background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          }}
        >
          <div style={{
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: 15, lineHeight: '20px',
            color: dim ? COLOR.ink3 : COLOR.ink, fontWeight: 450,
            textDecoration: dim ? 'line-through' : 'none',
            textDecorationColor: COLOR.ink3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{task.title}</div>
          <MetaLine
            d={d}
            showDomain={showDomain}
            project={task.projects?.name}
            dateLabel={formatDateLabel(task)}
            blockedBy={null}
            unblocks={null}
          />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6 }}>
          <PriorityMark priority={task.priority ?? 0} />
          {hasChildren && (
            <Icon name="chevron-d" size={12} sw={1.4} style={{ color: COLOR.ink3, transform: expanded ? 'none' : 'rotate(-90deg)' }} />
          )}
        </div>
      </div>
    </div>
  );
}

function MetaLine({ d, showDomain, project, dateLabel, blockedBy, unblocks }) {
  if (!d && !project && !dateLabel && !blockedBy && !unblocks) return null;
  return (
    <div style={{
      marginTop: 3, display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      fontSize: 10, color: COLOR.ink2, lineHeight: '14px',
      fontVariantNumeric: 'tabular-nums', fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {showDomain && d && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: d.color }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: d.color }} />
          <span>{d.label}</span>
        </span>
      )}
      {project && d && <span style={{ color: COLOR.ink3 }}>·</span>}
      {project && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120, textTransform: 'none', letterSpacing: 0, fontWeight: 450 }}>{project}</span>}
      {dateLabel && (project || d) && <span style={{ color: COLOR.ink3 }}>·</span>}
      {dateLabel && (
        <span style={{ color: dateLabel.tone === 'rubric' ? COLOR.rubric : COLOR.ink2 }}>
          {dateLabel.text}
        </span>
      )}
      {blockedBy && <span style={{ color: COLOR.ink3 }}>·</span>}
      {blockedBy && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: COLOR.ink3 }}>
          <Icon name="lock" size={10} sw={1.4} />
          <span>waiting on {blockedBy}</span>
        </span>
      )}
      {unblocks && <span style={{ color: COLOR.ink3 }}>·</span>}
      {unblocks && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: COLOR.ink2 }}>
          <Icon name="arrow-r" size={10} sw={1.4} />
          <span>unblocks {unblocks}</span>
        </span>
      )}
    </div>
  );
}

function pillStyle(color) {
  return {
    background: color, color: COLOR.linen,
    border: 0, borderRadius: 15, padding: '6px 14px',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 12, fontWeight: 600,
    cursor: 'pointer',
  };
}
