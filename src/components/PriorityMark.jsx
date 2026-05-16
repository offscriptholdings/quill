import React from 'react';

const COLOR = {
  ink2:   '#5C5448',
  rubric: '#8E3A1A',
};

/**
 * Manuscript-style marginal tick marks (1–3 strokes).
 * Returns null for level 0 (renders nothing).
 *
 * @param {0|1|2|3} priority - Priority level, int 0–3
 * @param {string} [className]
 */
export default function PriorityMark({ priority = 0, className = '', style }) {
  if (!priority) return null;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        gap: 2,
        height: 12,
        alignItems: 'flex-end',
        color: priority === 3 ? COLOR.rubric : COLOR.ink2,
        flexShrink: 0,
        ...style,
      }}
      aria-label={`Priority ${priority}`}
    >
      {Array.from({ length: priority }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 1.5,
            height: 8 + i * 2,
            background: 'currentColor',
          }}
        />
      ))}
    </span>
  );
}
