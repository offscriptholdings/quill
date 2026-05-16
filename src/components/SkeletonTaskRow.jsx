import React from 'react';

const COLOR = { rule: '#D9CFB8', ruleSoft: '#E5DCC6' };

/**
 * 56px-height placeholder row mirroring TaskRow proportions.
 * Pulse animation 1s ease-in-out infinite.
 */
export default function SkeletonTaskRow({ noRule = false }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', minHeight: 56, boxSizing: 'border-box',
        borderBottom: noRule ? 'none' : `0.5px solid ${COLOR.ruleSoft}`,
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 11,
        background: '#E5DCC6', animation: 'qPulse 1s ease-in-out infinite',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ width: '70%', height: 12, borderRadius: 2, background: '#E5DCC6', animation: 'qPulse 1s ease-in-out infinite' }} />
        <span style={{ width: '40%', height: 8, borderRadius: 2, background: '#EAE2CE', animation: 'qPulse 1s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes qPulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>
    </div>
  );
}
