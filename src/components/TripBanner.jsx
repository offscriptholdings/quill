import { useNavigate } from 'react-router-dom';
import { formatDateRange } from '../lib/date';

const COLOR = {
  ink: '#1F1D18',
  ink2: '#5C5448',
  ink3: '#948A78',
  paper: '#FAF6EC',
  rule: '#D9CFB8',
  ruleSoft: '#E5DCC6',
  rubric: '#8E3A1A',
};

export default function TripBanner({ trip }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/task/${trip.id}`)}
      style={{
        display: 'block',
        width: 'calc(100% - 32px)',
        margin: '0 16px 12px',
        padding: '10px 14px',
        background: COLOR.paper,
        border: `0.5px solid ${COLOR.ruleSoft}`,
        borderLeft: `2px solid ${COLOR.rubric}`,
        borderRadius: 3,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 10,
          fontWeight: 600,
          color: COLOR.ink3,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {formatDateRange(trip.schedule_date, trip.due_date)} · TRIP
      </div>
      <div
        style={{
          fontFamily: 'Newsreader, serif',
          fontSize: 17,
          lineHeight: '22px',
          color: COLOR.ink,
          fontWeight: 500,
        }}
      >
        {trip.title}
        {trip.location && (
          <span style={{ color: COLOR.ink3, fontSize: 14, marginLeft: 8 }}>
            · {trip.location}
          </span>
        )}
      </div>
    </button>
  );
}
