import React from 'react';
import DomainGlyph from './DomainGlyph';

const COLOR = { ink2: '#5C5448', ink3: '#948A78', rule: '#D9CFB8', linen: '#F2EDE3' };

/**
 * Small all-caps mono section header with optional glyph + count.
 *
 * @param {string} label
 * @param {number} [count]
 * @param {'spirit'|'body'|'work'|'wealth'|'family'} [domain] - Renders a DomainGlyph + uses domain color
 * @param {boolean} [sticky] - Sticky-positioned for scrolling lists
 * @param {string} [accent] - Override color (defaults to domain color or ink2)
 */
export default function SectionHeader({ label, count, domain, sticky = false, accent, style }) {
  const color = accent || COLOR.ink2;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 16px 6px',
      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      fontSize: 11, color: COLOR.ink2,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      fontWeight: 600,
      background: sticky ? COLOR.linen : 'transparent',
      position: sticky ? 'sticky' : 'static', top: 0, zIndex: 2,
      ...style,
    }}>
      {domain && (
        <span style={{ color, display: 'inline-flex' }}>
          <DomainGlyph domain={domain} size={12} strokeWidth={1.5} />
        </span>
      )}
      <span style={{ color }}>{label}</span>
      {count !== undefined && (
        <span style={{ color: COLOR.ink3, fontWeight: 400 }}>{count}</span>
      )}
      <span style={{ flex: 1, height: 1, background: COLOR.rule, marginLeft: 4, opacity: 0.7 }} />
    </div>
  );
}
