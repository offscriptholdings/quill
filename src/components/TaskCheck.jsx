import Icon from './Icon';

const COLOR = {
  ink:      '#1F1D18',
  ink2:     '#5C5448',
  ink3:     '#948A78',
  linen:    '#F2EDE3',
  ruleSoft: '#E5DCC6',
  rubric:   '#8E3A1A',
};

/**
 * 4-state circular checkbox per design/quill-components.jsx.
 *
 * @param {'open'|'ready'|'blocked'|'done'} state - Default 'open'
 * @param {number} [size=22]
 * @param {function} [onPress] - Renders as <button> if provided, else <span>
 * @param {string} [className]
 */
export default function TaskCheck({ state = 'open', size = 22, onPress, className = '', style }) {
  const interactive = !!onPress;
  const Component = interactive ? 'button' : 'span';
  const interactiveProps = interactive
    ? { onClick: onPress, type: 'button', 'aria-label': `Task ${state}` }
    : {};
  const buttonReset = interactive
    ? { background: 'none', border: 0, padding: 0, cursor: 'pointer' }
    : {};

  if (state === 'done') {
    return (
      <Component
        {...interactiveProps}
        className={className}
        style={{
          width: size, height: size, borderRadius: size / 2,
          background: COLOR.ink, color: COLOR.linen,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flex: '0 0 auto',
          ...buttonReset, ...style,
        }}
      >
        <Icon name="check" size={Math.round(size * 0.62)} sw={1.8} />
      </Component>
    );
  }

  if (state === 'blocked') {
    return (
      <Component
        {...interactiveProps}
        className={className}
        style={{
          width: size, height: size, borderRadius: size / 2,
          background: `repeating-linear-gradient(45deg, ${COLOR.ruleSoft} 0 2px, transparent 2px 5px)`,
          boxShadow: `inset 0 0 0 1px ${COLOR.ink3}`,
          display: 'inline-block', flex: '0 0 auto',
          ...buttonReset, ...style,
        }}
      />
    );
  }

  if (state === 'ready') {
    return (
      <Component
        {...interactiveProps}
        className={className}
        style={{
          width: size, height: size, borderRadius: size / 2,
          position: 'relative',
          boxShadow: `inset 0 0 0 1.25px ${COLOR.ink}`,
          display: 'inline-block', flex: '0 0 auto',
          ...buttonReset, ...style,
        }}
      >
        <span style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: `1px solid ${COLOR.rubric}`, opacity: 0.55,
          pointerEvents: 'none',
        }} />
      </Component>
    );
  }

  return (
    <Component
      {...interactiveProps}
      className={className}
      style={{
        width: size, height: size, borderRadius: size / 2,
        boxShadow: `inset 0 0 0 1.25px ${COLOR.ink2}`,
        display: 'inline-block', flex: '0 0 auto',
        ...buttonReset, ...style,
      }}
    />
  );
}
