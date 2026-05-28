import { formatLocalTime } from '../lib/date';

export default function CalendarEventRow({ event, noRule }) {
  const timeLabel = event.all_day ? 'ALL DAY' : formatLocalTime(event.starts_at).toUpperCase();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: 56,
        padding: '10px 14px 10px 12px',
        background: '#F2EDE3',
        borderLeft: '2px solid #B8893A',
        borderBottom: noRule ? 'none' : '0.5px solid #E5DCC6',
      }}
    >
      <div style={{
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10,
        fontWeight: 600,
        color: '#948A78',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        minWidth: 52,
        paddingTop: 2,
        marginRight: 10,
      }}>
        {timeLabel}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          fontSize: 15,
          color: '#1F1D18',
          lineHeight: '20px',
        }}>
          {event.title}
        </div>
        {event.location && (
          <div style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 10,
            color: '#948A78',
            letterSpacing: '0.04em',
            marginTop: 2,
          }}>
            @ {event.location}
          </div>
        )}
      </div>
    </div>
  );
}
