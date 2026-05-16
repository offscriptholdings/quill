import React from 'react';
import { useNavigate } from 'react-router-dom';
import ViewHeader from '../components/ViewHeader';
import SectionHeader from '../components/SectionHeader';
import { DOMAIN_ORDER } from '../lib/domains';
import DomainChip from '../components/DomainChip';

export default function MenuTab() {
  const navigate = useNavigate();
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
      <div style={{ padding: '4px 16px 16px' }}>
        <button
          onClick={() => navigate('/menu/logbook')}
          style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer',
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: 14, color: '#1F1D18',
          }}
        >
          Logbook →
        </button>
      </div>
      <SectionHeader label="Inbox" />
      <div style={{ padding: '0 16px 24px', fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: 11, color: '#948A78', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        INBOX · 0 from Crucible
      </div>
    </div>
  );
}
