import React from 'react';

const COLOR = { ink: '#1F1D18', ink3: '#948A78', rubric: '#8E3A1A' };

/**
 * Editorial page header for screens.
 *
 * @param {string} [kicker] - Mono uppercase context line (e.g. "FRIDAY · THE EIGHTH")
 * @param {string} title - h1 text
 * @param {string} [dropCap] - Optional first-letter drop cap (1 character)
 * @param {number|string} [count] - Right-aligned count
 * @param {React.ReactNode} [action] - Right-aligned action element
 * @param {React.CSSProperties} [style]
 */
export default function ViewHeader({ kicker, title, dropCap, count, action, style }) {
  // When dropCap matches the first letter of title (manuscript convention),
  // strip it from the h1 so the drop-cap REPLACES the first letter rather than
  // duplicating it. Otherwise render dropCap + full title.
  const dropCapMatchesFirstLetter =
    dropCap && title && dropCap.toLowerCase() === title.charAt(0).toLowerCase();
  const h1Text = dropCapMatchesFirstLetter ? title.slice(1) : title;

  return (
    <div style={{ padding: '4px 16px 12px', ...style }}>
      {kicker && (
        <div style={{
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 11, color: COLOR.ink3,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontWeight: 600, marginBottom: 4,
        }}>{kicker}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        {dropCap && (
          <span style={{
            fontFamily: 'Newsreader, serif',
            fontSize: 56, lineHeight: '0.85',
            color: COLOR.rubric, fontWeight: 500,
            marginRight: -2, fontStyle: 'italic',
          }}>{dropCap}</span>
        )}
        <h1 style={{
          fontFamily: 'Newsreader, serif',
          fontSize: 32, lineHeight: '36px',
          color: COLOR.ink, fontWeight: 500, margin: 0,
          letterSpacing: '-0.4px',
        }}>{h1Text}</h1>
        {count !== undefined && (
          <span style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 12, color: COLOR.ink3,
            fontVariantNumeric: 'tabular-nums',
          }}>{count}</span>
        )}
        <span style={{ flex: 1 }} />
        {action}
      </div>
    </div>
  );
}
