import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ViewHeader from '../components/ViewHeader';
import SectionHeader from '../components/SectionHeader';
import { DOMAIN_ORDER } from '../lib/domains';
import DomainChip from '../components/DomainChip';

export default function MenuTab() {
  const navigate = useNavigate();
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .schema('quill')
        .from('inbox')
        .select('id', { count: 'exact', head: true })
        .is('triaged_at', null);
      setInboxCount(count ?? 0);
    })();
  }, []);

  return (
    <div>
      <ViewHeader kicker="WORKSHOP" title="Menu" dropCap="M" />
      <SectionHeader label="Domains" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 16px 16px' }}>
        {DOMAIN_ORDER.map((d) => (
          <DomainChip key={d} domain={d} onPress={() => navigate('/domain/' + d)} />
        ))}
      </div>
      <SectionHeader label="Library" />
      <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => navigate('/menu/everything')}
          style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer',
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: 14, color: '#1F1D18', textAlign: 'left',
          }}
        >
          Everything →
        </button>
        <button
          onClick={() => navigate('/menu/logbook')}
          style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer',
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: 14, color: '#1F1D18', textAlign: 'left',
          }}
        >
          Logbook →
        </button>
      </div>
      <SectionHeader label="Inbox" />
      <div style={{ padding: '0 16px 24px' }}>
        <button
          onClick={() => inboxCount > 0 && navigate('/inbox')}
          disabled={inboxCount === 0}
          style={{
            background: 'none',
            border: 0,
            padding: '4px 0',
            cursor: inboxCount > 0 ? 'pointer' : 'default',
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 11,
            fontWeight: 600,
            color: inboxCount > 0 ? '#8E3A1A' : '#948A78',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textAlign: 'left',
          }}
        >
          INBOX · {inboxCount} FROM CRUCIBLE
        </button>
      </div>
    </div>
  );
}
