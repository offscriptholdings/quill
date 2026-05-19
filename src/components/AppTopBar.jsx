import React from 'react';

const COLOR = { ink3: '#948A78', rule: '#D9CFB8', linen: '#F2EDE3' };

/**
 * Top status bar — slots for left (date) and right (Quill name).
 * Uses the .safe-top class (defined in src/index.css) to add
 * env(safe-area-inset-top) padding for iOS status-bar clearance.
 *
 * @param {React.ReactNode} left - Typically the date in mono uppercase
 * @param {React.ReactNode} right - Typically the Quill name in Newsreader italic
 */
export default function AppTopBar({ left, right, style }) {
  return (
    <div
      style={{
        paddingTop: 'calc(8px + env(safe-area-inset-top))',
        paddingBottom: 8,
        paddingLeft: 16, paddingRight: 16,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 11, color: COLOR.ink3,
        letterSpacing: '0.05em', textTransform: 'uppercase',
        background: COLOR.linen,
        borderBottom: `0.5px solid ${COLOR.rule}`,
        ...style,
      }}
    >
      <span>{left}</span>
      <span style={{ flex: 1 }} />
      <span style={{ textTransform: 'none', letterSpacing: 0 }}>{right}</span>
    </div>
  );
}
