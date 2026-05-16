import React from 'react';

const COLOR = { ink: '#1F1D18', ink2: '#5C5448', linen: '#F2EDE3', rule: '#D9CFB8' };

/**
 * Small pill, 26px height, 15px radius.
 *
 * @param {React.ReactNode} children - Label content (string or icon+text)
 * @param {boolean} [active=false]
 * @param {function} [onPress]
 */
export default function FilterChip({ children, active = false, onPress, style }) {
  const Component = onPress ? 'button' : 'span';
  const buttonReset = onPress
    ? { background: 'none', border: 0, cursor: 'pointer', padding: 0 }
    : {};
  return (
    <Component
      onClick={onPress}
      type={onPress ? 'button' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 26, padding: '0 10px',
        borderRadius: 15,
        background: active ? COLOR.ink : 'transparent',
        color: active ? COLOR.linen : COLOR.ink2,
        boxShadow: active ? 'none' : `inset 0 0 0 0.5px ${COLOR.rule}`,
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 12, fontWeight: 500,
        letterSpacing: '0.01em', lineHeight: 1,
        ...buttonReset,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
