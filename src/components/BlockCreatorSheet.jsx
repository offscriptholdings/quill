import { useState } from 'react';
import { supabase } from '../lib/supabase';

const N8N_ENDPOINT = 'https://n8n.meridiantechco.com/webhook/quill-create-block';

export default function BlockCreatorSheet({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const isDisabled =
    title.trim() === '' ||
    !startsAt ||
    !endsAt ||
    startsAt >= endsAt ||
    submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (isDisabled) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(N8N_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Webhook error ${res.status}`);
      const responseData = await res.json();

      const { data: row, error: insertErr } = await supabase
        .schema('quill')
        .from('calendar_events')
        .insert({
          external_id: responseData.external_id,
          title:       responseData.title,
          starts_at:   responseData.starts_at,
          ends_at:     responseData.ends_at,
          all_day:     false,
          status:      'confirmed',
          source:      'quill',
          synced_at:   new Date().toISOString(),
        })
        .select('id, external_id, title, starts_at, ends_at, all_day, status')
        .single();

      if (insertErr) throw insertErr;
      onCreated(row);
    } catch (err) {
      setError(err.message || 'Failed to create block.');
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    border: '0.5px solid #D9CFB8',
    borderRadius: 3,
    padding: '10px 12px',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 15,
    color: '#1F1D18',
    background: '#F2EDE3',
    boxSizing: 'border-box',
    minHeight: 44,
  };

  const labelStyle = {
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#948A78',
    display: 'block',
    marginBottom: 4,
  };

  return (
    <div
      data-testid="block-creator-sheet"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: '#FAF6EC',
        borderRadius: '18px 18px 0 0',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          fontFamily: 'Newsreader, serif',
          fontSize: 18,
          color: '#1F1D18',
          flex: 1,
          fontWeight: 450,
        }}>
          Create block
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 14,
            color: '#948A78',
            cursor: 'pointer',
            padding: '5px 0 5px 12px',
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Title</label>
          <input
            data-testid="block-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Block title"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Start</label>
          <input
            data-testid="block-start-input"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>End</label>
          <input
            data-testid="block-end-input"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 11,
            color: '#8E3A1A',
            marginBottom: 10,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          style={{
            width: '100%',
            height: 48,
            background: '#1F1D18',
            color: '#F2EDE3',
            border: 'none',
            borderRadius: 3,
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: 15,
            cursor: isDisabled ? 'default' : 'pointer',
            opacity: isDisabled ? 0.4 : 1,
          }}
        >
          {submitting ? 'Adding…' : 'Add to Calendar'}
        </button>
      </form>
    </div>
  );
}
