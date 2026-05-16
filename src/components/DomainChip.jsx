import { DOMAINS } from '../lib/domains'
import DomainGlyph from './DomainGlyph'

/**
 * Pill chip — for filter rows and view headers.
 *
 * @param {'spirit'|'body'|'work'|'wealth'|'family'} domain
 * @param {function} [onPress] - Tap handler. Renders as <button> if provided, else <span>.
 * @param {boolean} [active] - Visual active state (slightly stronger border + color)
 * @param {string} [className]
 */
export default function DomainChip({ domain, onPress, active = false, className = '', style }) {
  const d = DOMAINS[domain]
  if (!d) return null
  const Component = onPress ? 'button' : 'span'
  const baseProps = onPress ? { onClick: onPress, type: 'button' } : {}
  return (
    <Component
      {...baseProps}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: d.tint,
        border: `0.5px solid ${d.edge}`,
        borderRadius: 15,
        color: d.color,
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        cursor: onPress ? 'pointer' : 'default',
        opacity: active === false && onPress ? 0.85 : 1,
        ...style,
      }}
    >
      <DomainGlyph domain={domain} size={11} strokeWidth={1.4} />
      {d.label}
    </Component>
  )
}
