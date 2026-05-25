import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '../lib/supabase';
import { DOMAINS } from '../lib/domains';
import { localTodayIso, addDaysIso } from '../lib/date';

function formatSuggestedDate(iso) {
  const todayIso = localTodayIso();
  const tomorrowIso = addDaysIso(todayIso, 1);
  const d = new Date(`${iso}T12:00:00`);
  const dayAbbr = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  if (iso === tomorrowIso) {
    return `Tomorrow — ${dayAbbr} ${month} ${day}`;
  }
  return `${dayAbbr}, ${month} ${day}`;
}

export default function SuggestionCard({ suggestion, onConfirm, onReject }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [pending, setPending] = useState(false);

  const domain = suggestion.tasks?.domain;
  const domainEdge = (domain && DOMAINS[domain]?.edge) ?? '#D9CFB8';

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    onConfirm(suggestion);
    try {
      await Promise.all([
        supabase.schema('quill').from('tasks')
          .update({ schedule_date: suggestion.suggested_date })
          .eq('id', suggestion.task_id),
        supabase.schema('quill').from('schedule_suggestions')
          .update({ status: 'confirmed' })
          .eq('id', suggestion.id),
      ]);
    } catch (e) {
      console.error('SuggestionCard confirm failed:', e);
    }
  };

  const handleReject = async () => {
    if (pending) return;
    setPending(true);
    onReject(suggestion);
    try {
      await supabase.schema('quill').from('schedule_suggestions')
        .update({ status: 'rejected' })
        .eq('id', suggestion.id);
    } catch (e) {
      console.error('SuggestionCard reject failed:', e);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      if (pending) return;
      const clamped = Math.max(-88, Math.min(88, e.deltaX));
      setSwipeOffset(clamped);
    },
    onSwipedRight: (e) => {
      if (pending) return;
      if (e.absX > 72) {
        handleConfirm();
      } else {
        setSwipeOffset(0);
      }
    },
    onSwipedLeft: (e) => {
      if (pending) return;
      if (e.absX > 72) {
        handleReject();
      } else {
        setSwipeOffset(0);
      }
    },
    onTouchEndOrOnMouseUp: () => {
      if (!pending) setSwipeOffset(0);
    },
    trackTouch: true,
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  const absOffset = Math.abs(swipeOffset);
  const bgStyle =
    swipeOffset > 0
      ? { backgroundColor: `rgba(90,140,80,${(absOffset / 88) * 0.12})` }
      : swipeOffset < 0
      ? { backgroundColor: `rgba(142,58,26,${(absOffset / 88) * 0.08})` }
      : { backgroundColor: '#FAF6EC' };

  if (!suggestion.tasks) return null;

  return (
    <div
      {...swipeHandlers}
      style={{
        ...bgStyle,
        borderRadius: 3,
        boxShadow: 'inset 0 0 0 0.5px #D9CFB8',
        borderLeft: `4px solid ${domainEdge}`,
        padding: '12px 14px',
        marginBottom: 8,
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'pan-y',
        overflow: 'hidden',
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.15s ease, background-color 0.1s' : 'none',
      }}
    >
      <div style={{
        fontFamily: 'Newsreader, serif',
        fontSize: 16,
        fontWeight: 450,
        color: '#1F1D18',
        marginBottom: 3,
      }}>
        {suggestion.tasks.title}
      </div>
      <div style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 11,
        color: '#948A78',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4,
      }}>
        {formatSuggestedDate(suggestion.suggested_date)}
      </div>
      {suggestion.reasoning && (
        <div style={{
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          fontSize: 13,
          color: '#5C5448',
          fontStyle: 'italic',
        }}>
          {suggestion.reasoning}
        </div>
      )}
    </div>
  );
}
