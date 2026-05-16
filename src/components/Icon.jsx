/**
 * 16x16 monoline icon registry. SVG strokes use currentColor so the parent
 * sets hue via Tailwind `text-*` utility. Add new icons to the switch.
 *
 * @param {string} name - Icon name from the registry
 * @param {number} [size=16] - Pixel size (sets width + height)
 * @param {number} [sw=1.4] - Stroke width
 * @param {string} [className] - Optional Tailwind classes
 */
export default function Icon({ name, size = 16, sw = 1.4, className = '', style }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style: { display: 'block', ...style },
  }

  switch (name) {
    case 'plus':       return <svg {...common}><path d="M8 3.5v9M3.5 8h9"/></svg>
    case 'check':      return <svg {...common}><path d="M3.5 8.5L6.5 11.5 12.5 5"/></svg>
    case 'chevron-r':  return <svg {...common}><path d="M6 3.5L10.5 8 6 12.5"/></svg>
    case 'chevron-d':  return <svg {...common}><path d="M3.5 6L8 10.5 12.5 6"/></svg>
    case 'chevron-u':  return <svg {...common}><path d="M3.5 10L8 5.5 12.5 10"/></svg>
    case 'chevron-l':  return <svg {...common}><path d="M10 3.5L5.5 8 10 12.5"/></svg>
    case 'dot':        return <svg {...common}><circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/></svg>
    case 'today':      // small flame-ish rubric tick
      return <svg {...common}><path d="M8 2v12M8 2l2.5 2.5M8 2L5.5 4.5"/></svg>
    case 'circle':     return <svg {...common}><circle cx="8" cy="8" r="5.5"/></svg>
    case 'circle-d':   return <svg {...common}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="1.7" fill="currentColor" stroke="none"/></svg>
    case 'square':     return <svg {...common}><rect x="3" y="3" width="10" height="10" rx="1.2"/></svg>
    case 'lock':       // dependency-blocked indicator
      return <svg {...common}><rect x="3.5" y="7" width="9" height="6" rx="1"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/></svg>
    case 'arrow-r':    return <svg {...common}><path d="M3 8h10M9 4l4 4-4 4"/></svg>
    case 'cal':        return <svg {...common}><rect x="2.5" y="3.5" width="11" height="10" rx="1"/><path d="M2.5 6.5h11M5 2v3M11 2v3"/></svg>
    case 'recur':      return <svg {...common}><path d="M3 7.5a4.5 4.5 0 0 1 8.5-1.5M13 8.5a4.5 4.5 0 0 1-8.5 1.5"/><path d="M11.5 3v3h-3M4.5 13v-3h3"/></svg>
    case 'menu':       return <svg {...common}><path d="M2.5 5h11M2.5 8h11M2.5 11h11"/></svg>
    case 'kebab':      return <svg {...common}><circle cx="8" cy="3.6" r="1.1" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="8" cy="12.4" r="1.1" fill="currentColor" stroke="none"/></svg>
    case 'filter':     return <svg {...common}><path d="M2.5 4h11M4.5 8h7M6.5 12h3"/></svg>
    case 'search':     return <svg {...common}><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
    case 'inbox':      return <svg {...common}><path d="M2.5 9.5l1.7-5a1 1 0 0 1 1-.7h5.6a1 1 0 0 1 1 .7l1.7 5"/><path d="M2.5 9.5h3.4l.7 1.4h2.8l.7-1.4h3.4v3a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z"/></svg>
    case 'tag':        return <svg {...common}><path d="M2.5 8.5l6-6h5v5l-6 6z"/><circle cx="10.5" cy="5.5" r=".8"/></svg>
    case 'list':       return <svg {...common}><path d="M5 4.5h8.5M5 8h8.5M5 11.5h8.5"/><circle cx="2.8" cy="4.5" r=".7" fill="currentColor" stroke="none"/><circle cx="2.8" cy="8" r=".7" fill="currentColor" stroke="none"/><circle cx="2.8" cy="11.5" r=".7" fill="currentColor" stroke="none"/></svg>
    case 'horizon':    return <svg {...common}><path d="M2 12.5h12"/><path d="M5 12.5l3-7 3 7"/></svg>
    case 'archive':    return <svg {...common}><rect x="2.5" y="4" width="11" height="2.5"/><path d="M3.5 6.5v6.5h9V6.5"/><path d="M6.5 9.5h3"/></svg>
    case 'x':          return <svg {...common}><path d="M4 4l8 8M12 4l-8 8"/></svg>
    case 'flag':       return <svg {...common}><path d="M3.5 13V3M3.5 3.5h7l-1.5 2 1.5 2h-7"/></svg>
    default:
      return <svg {...common}><circle cx="8" cy="8" r="2"/></svg>
  }
}
