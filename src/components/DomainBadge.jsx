import { DOMAINS } from '../lib/domains'
import DomainGlyph from './DomainGlyph'

/**
 * Square domain badge — the canonical task-row mark.
 *
 * @param {'spirit'|'body'|'work'|'wealth'|'family'} domain
 * @param {number} [size=28] - Outer square dimension in px
 * @param {string} [className]
 */
export default function DomainBadge({ domain, size = 28, className = '', style }) {
  const d = DOMAINS[domain]
  if (!d) return null
  const glyphSize = Math.round(size * 0.57)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background: d.tint,
        borderRadius: 3,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: d.color,
        flexShrink: 0,
        ...style,
      }}
      aria-label={d.label}
    >
      <DomainGlyph domain={domain} size={glyphSize} strokeWidth={1.4} />
    </div>
  )
}
