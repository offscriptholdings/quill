import React from 'react';

/**
 * Inline error caption — rubric mono text, optional retry tap.
 */
export default function InlineError({ children = 'Something went wrong.', onRetry }) {
  return (
    <div style={{
      padding: '8px 16px',
      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      fontSize: 10, fontWeight: 600,
      color: '#8E3A1A', letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {children}
      {onRetry && (
        <>
          {' '}
          <button onClick={onRetry} style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer',
            color: '#8E3A1A', fontFamily: 'inherit', fontSize: 'inherit',
            textTransform: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit',
            textDecoration: 'underline',
          }}>
            Tap to retry.
          </button>
        </>
      )}
    </div>
  );
}
