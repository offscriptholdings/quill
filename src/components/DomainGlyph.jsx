/**
 * 5 domain glyphs: flame (spirit), figure (body), pen-nib (work),
 * coin (wealth), hearth (family). currentColor strokes — parent sets hue.
 *
 * @param {'spirit'|'body'|'work'|'wealth'|'family'} domain
 * @param {number} [size=14]
 * @param {number} [strokeWidth=1.25]
 * @param {string} [className]
 */
export default function DomainGlyph({ domain, size = 14, strokeWidth = 1.25, className = '', style }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style: { display: 'block', ...style },
  }

  switch (domain) {
    case 'spirit': // flame
      return (
        <svg {...common}>
          <path d="M8 2.4c1.1 1.6 2.6 2.7 2.6 4.6 0 1.4-.9 2.5-2.6 2.5S5.4 8.4 5.4 7c0-1.9 1.5-3 2.6-4.6z"/>
          <path d="M8 9.5c.6.7 1.3 1.4 1.3 2.6 0 1-.6 1.7-1.3 1.7s-1.3-.7-1.3-1.7c0-1.2.7-1.9 1.3-2.6z"/>
        </svg>
      )
    case 'body': // figure: head + body
      return (
        <svg {...common}>
          <circle cx="8" cy="3.6" r="1.4"/>
          <path d="M8 5.4v3.2"/>
          <path d="M5 6.4l3 1.5 3-1.5"/>
          <path d="M8 8.6l-1.6 4.6M8 8.6l1.6 4.6"/>
        </svg>
      )
    case 'work': // pen nib
      return (
        <svg {...common}>
          <path d="M8 2.2l-3 9 3 2.4 3-2.4-3-9z"/>
          <path d="M8 8.6v4.6"/>
          <path d="M6.5 7l3 0"/>
        </svg>
      )
    case 'wealth': // coin
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.4"/>
          <path d="M8 4.6v6.8M5.6 6.4l4.8 3.2M10.4 6.4l-4.8 3.2"/>
        </svg>
      )
    case 'family': // hearth / house
      return (
        <svg {...common}>
          <path d="M2.6 8L8 3.4 13.4 8"/>
          <path d="M3.8 7.4v6h8.4v-6"/>
          <path d="M6.6 13.4V10h2.8v3.4"/>
        </svg>
      )
    default:
      return <svg {...common}><circle cx="8" cy="8" r="2"/></svg>
  }
}
