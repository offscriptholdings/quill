import React from 'react';
import { DOMAINS } from '../lib/domains';
import DomainBadge from './DomainBadge';

const COLOR = {
  ink:      '#1F1D18',
  ink2:     '#5C5448',
  ink3:     '#948A78',
  paper:    '#FAF6EC',
  rule:     '#D9CFB8',
  ruleSoft: '#E5DCC6',
  rubric:   '#8E3A1A',
};
const SEGS = 13;

export default function ProjectCard({ project, counts, onPress }) {
  const d = DOMAINS[project.domain];
  const { done = 0, ready = 0, blocked = 0, open = 0, total = 0 } = counts || {};

  const segments = Array.from({ length: SEGS }).map((_, i) => {
    const filledDone    = (i / SEGS) < (done / Math.max(total, 1));
    const filledReady   = (i / SEGS) < ((done + ready) / Math.max(total, 1));
    const filledBlocked = (i / SEGS) < ((done + ready + blocked) / Math.max(total, 1));
    if (filledDone)    return { type: 'done',    color: COLOR.ink };
    if (filledReady)   return { type: 'ready',   color: COLOR.rubric };
    if (filledBlocked) return { type: 'blocked', hatch: true };
    return { type: 'open', color: COLOR.ruleSoft };
  });

  return (
    <button
      onClick={onPress}
      style={{
        background: COLOR.paper,
        borderRadius: 4,
        boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
        padding: '14px 14px 12px',
        textAlign: 'left',
        width: '100%',
        border: 0,
        cursor: 'pointer',
        display: 'block',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <DomainBadge domain={project.domain} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Newsreader, serif',
            fontSize: 17,
            lineHeight: '22px',
            color: COLOR.ink,
            fontWeight: 500,
            letterSpacing: '-0.1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{project.name}</div>
          <div style={{
            marginTop: 2,
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 10,
            color: COLOR.ink3,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            {d?.label ?? project.domain}
            {project.status && project.status !== 'active' ? ` · ${project.status}` : ''}
          </div>
        </div>
      </div>

      {/* 13-segment ledger */}
      <div style={{ marginTop: 14, display: 'flex', gap: 3 }}>
        {segments.map((s, i) => (
          <span key={i} style={{
            flex: 1,
            height: 6,
            borderRadius: 1,
            background: s.hatch
              ? `repeating-linear-gradient(45deg, ${COLOR.ruleSoft} 0 2px, transparent 2px 4px)`
              : s.color,
            boxShadow: s.hatch ? `inset 0 0 0 0.5px ${COLOR.ink3}` : 'none',
          }} />
        ))}
      </div>

      {/* 4-stat meta */}
      <div style={{
        marginTop: 10,
        display: 'flex',
        gap: 14,
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 11,
        color: COLOR.ink2,
        fontVariantNumeric: 'tabular-nums',
      }}>
        <Stat n={done}    label="done"    color={COLOR.ink} />
        <Stat n={ready}   label="ready"   color={ready ? COLOR.rubric : COLOR.ink3} />
        <Stat n={blocked} label="blocked" color={COLOR.ink2} />
        <Stat n={open}    label="open"    color={COLOR.ink} />
      </div>
    </button>
  );
}

function Stat({ n, label, color }) {
  return (
    <span>
      <b style={{ fontWeight: 600, color }}>{n}</b>
      <span style={{ color: '#948A78' }}> {label}</span>
    </span>
  );
}
