// Quill — design system foundation
// Color / type / spacing tokens, domain definitions, monoline glyphs.
// Exported to window for use by other Babel scripts.

// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────
const Q = {
  // surfaces
  linen:      '#F2EDE3', // page background
  linenDeep:  '#EAE2CE', // alt fill, sticky headers
  paper:      '#FAF6EC', // card / sheet
  paper2:     '#F6F0DF', // raised card hover
  rule:       '#D9CFB8', // ledger / divider hairline
  ruleSoft:   '#E5DCC6', // faint rule
  // ink scale
  ink:        '#1F1D18', // primary
  ink2:       '#5C5448', // secondary
  ink3:       '#948A78', // tertiary, placeholder
  ink4:       '#BFB6A0', // disabled
  // marginal accent — sparingly: today rubric, "ready" mark, key actions
  rubric:     '#8E3A1A', // oxblood / scribe red
  rubricSoft: '#C26B4A',
  gold:       '#B8893A', // tiny sister-of-Crucible accent

  // type
  serif:  '"Newsreader", "Source Serif Pro", Georgia, serif',
  sans:   '"IBM Plex Sans", -apple-system, system-ui, sans-serif',
  mono:   '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

// Domain definitions — earth pigments, all sharing the linen base.
// `tint` is the very-low-saturation paper tint (useful for headers/cards).
const DOMAINS = {
  spirit: {
    key: 'spirit', label: 'Spirit',
    color: '#4A5578', tint: '#E6E5EC', edge: '#C9C8D6',
    note: 'transcendence · practice',
  },
  body: {
    key: 'body', label: 'Body',
    color: '#5F6E3C', tint: '#E8EADD', edge: '#CBD0B4',
    note: 'health · physical',
  },
  work: {
    key: 'work', label: 'Work',
    color: '#8B5A3C', tint: '#EFE4D7', edge: '#D9C4AD',
    note: 'craft · livelihood',
  },
  wealth: {
    key: 'wealth', label: 'Wealth',
    color: '#A57E2A', tint: '#F0E8D2', edge: '#DBC994',
    note: 'money · stewardship',
  },
  family: {
    key: 'family', label: 'Family',
    color: '#6E3F4A', tint: '#EDE0E2', edge: '#D2B9BE',
    note: 'hearth · relationships',
  },
};
const DOMAIN_ORDER = ['spirit','body','work','wealth','family'];

// ─────────────────────────────────────────────────────────────
// Domain glyphs — simple monoline shapes, 16×16 viewBox.
// All drawn as currentColor strokes so the parent sets hue.
// ─────────────────────────────────────────────────────────────
function DomainGlyph({ domain, size = 14, strokeWidth = 1.25, style = {} }) {
  const sw = strokeWidth;
  const common = {
    width: size, height: size, viewBox: '0 0 16 16',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', ...style },
  };
  switch (domain) {
    case 'spirit': // flame
      return (
        <svg {...common}>
          <path d="M8 2.4c1.1 1.6 2.6 2.7 2.6 4.6 0 1.4-.9 2.5-2.6 2.5S5.4 8.4 5.4 7c0-1.9 1.5-3 2.6-4.6z"/>
          <path d="M8 9.5c.6.7 1.3 1.4 1.3 2.6 0 1-.6 1.7-1.3 1.7s-1.3-.7-1.3-1.7c0-1.2.7-1.9 1.3-2.6z"/>
        </svg>
      );
    case 'body': // figure: head + body
      return (
        <svg {...common}>
          <circle cx="8" cy="3.6" r="1.4"/>
          <path d="M8 5.4v3.2"/>
          <path d="M5 6.4l3 1.5 3-1.5"/>
          <path d="M8 8.6l-1.6 4.6M8 8.6l1.6 4.6"/>
        </svg>
      );
    case 'work': // pen nib
      return (
        <svg {...common}>
          <path d="M8 2.2l-3 9 3 2.4 3-2.4-3-9z"/>
          <path d="M8 8.6v4.6"/>
          <path d="M6.5 7l3 0"/>
        </svg>
      );
    case 'wealth': // coin
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.4"/>
          <path d="M8 4.6v6.8M5.6 6.4l4.8 3.2M10.4 6.4l-4.8 3.2"/>
        </svg>
      );
    case 'family': // hearth / house
      return (
        <svg {...common}>
          <path d="M2.6 8L8 3.4 13.4 8"/>
          <path d="M3.8 7.4v6h8.4v-6"/>
          <path d="M6.6 13.4V10h2.8v3.4"/>
        </svg>
      );
    default:
      return <svg {...common}><circle cx="8" cy="8" r="2"/></svg>;
  }
}

// ─────────────────────────────────────────────────────────────
// Small UI icons (line, currentColor)
// ─────────────────────────────────────────────────────────────
function QIcon({ name, size = 16, sw = 1.4, style = {} }) {
  const common = {
    width: size, height: size, viewBox: '0 0 16 16',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', ...style },
  };
  switch (name) {
    case 'plus':       return <svg {...common}><path d="M8 3.5v9M3.5 8h9"/></svg>;
    case 'check':      return <svg {...common}><path d="M3.5 8.5L6.5 11.5 12.5 5"/></svg>;
    case 'chevron-r':  return <svg {...common}><path d="M6 3.5L10.5 8 6 12.5"/></svg>;
    case 'chevron-d':  return <svg {...common}><path d="M3.5 6L8 10.5 12.5 6"/></svg>;
    case 'chevron-u':  return <svg {...common}><path d="M3.5 10L8 5.5 12.5 10"/></svg>;
    case 'chevron-l':  return <svg {...common}><path d="M10 3.5L5.5 8 10 12.5"/></svg>;
    case 'dot':        return <svg {...common}><circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/></svg>;
    case 'today':      // small flame-ish rubric tick
      return <svg {...common}><path d="M8 2v12M8 2l2.5 2.5M8 2L5.5 4.5"/></svg>;
    case 'circle':     return <svg {...common}><circle cx="8" cy="8" r="5.5"/></svg>;
    case 'circle-d':   return <svg {...common}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="1.7" fill="currentColor" stroke="none"/></svg>;
    case 'square':     return <svg {...common}><rect x="3" y="3" width="10" height="10" rx="1.2"/></svg>;
    case 'lock':       // dependency-blocked indicator
      return <svg {...common}><rect x="3.5" y="7" width="9" height="6" rx="1"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/></svg>;
    case 'arrow-r':    return <svg {...common}><path d="M3 8h10M9 4l4 4-4 4"/></svg>;
    case 'cal':        return <svg {...common}><rect x="2.5" y="3.5" width="11" height="10" rx="1"/><path d="M2.5 6.5h11M5 2v3M11 2v3"/></svg>;
    case 'recur':      return <svg {...common}><path d="M3 7.5a4.5 4.5 0 0 1 8.5-1.5M13 8.5a4.5 4.5 0 0 1-8.5 1.5"/><path d="M11.5 3v3h-3M4.5 13v-3h3"/></svg>;
    case 'menu':       return <svg {...common}><path d="M2.5 5h11M2.5 8h11M2.5 11h11"/></svg>;
    case 'kebab':      return <svg {...common}><circle cx="8" cy="3.6" r="1.1" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="8" cy="12.4" r="1.1" fill="currentColor" stroke="none"/></svg>;
    case 'filter':     return <svg {...common}><path d="M2.5 4h11M4.5 8h7M6.5 12h3"/></svg>;
    case 'search':     return <svg {...common}><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>;
    case 'inbox':      return <svg {...common}><path d="M2.5 9.5l1.7-5a1 1 0 0 1 1-.7h5.6a1 1 0 0 1 1 .7l1.7 5"/><path d="M2.5 9.5h3.4l.7 1.4h2.8l.7-1.4h3.4v3a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z"/></svg>;
    case 'tag':        return <svg {...common}><path d="M2.5 8.5l6-6h5v5l-6 6z"/><circle cx="10.5" cy="5.5" r=".8"/></svg>;
    case 'list':       return <svg {...common}><path d="M5 4.5h8.5M5 8h8.5M5 11.5h8.5"/><circle cx="2.8" cy="4.5" r=".7" fill="currentColor" stroke="none"/><circle cx="2.8" cy="8" r=".7" fill="currentColor" stroke="none"/><circle cx="2.8" cy="11.5" r=".7" fill="currentColor" stroke="none"/></svg>;
    case 'horizon':    return <svg {...common}><path d="M2 12.5h12"/><path d="M5 12.5l3-7 3 7"/></svg>;
    case 'archive':    return <svg {...common}><rect x="2.5" y="4" width="11" height="2.5"/><path d="M3.5 6.5v6.5h9V6.5"/><path d="M6.5 9.5h3"/></svg>;
    case 'x':          return <svg {...common}><path d="M4 4l8 8M12 4l-8 8"/></svg>;
    case 'flag':       return <svg {...common}><path d="M3.5 13V3M3.5 3.5h7l-1.5 2 1.5 2h-7"/></svg>;
    default:           return <svg {...common}/>;
  }
}

// ─────────────────────────────────────────────────────────────
// Domain badge — circle with glyph in domain color over tint.
// Used everywhere a task / project shows its domain.
// ─────────────────────────────────────────────────────────────
function DomainBadge({ domain, size = 22, withRing = false, style = {} }) {
  const d = DOMAINS[domain];
  if (!d) return null;
  return (
    <span style={{
      width: size, height: size, borderRadius: size / 2,
      background: d.tint,
      boxShadow: withRing ? `inset 0 0 0 1px ${d.edge}` : 'none',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: d.color, flex: '0 0 auto', ...style,
    }}>
      <DomainGlyph domain={domain} size={Math.round(size * 0.62)} strokeWidth={1.3} />
    </span>
  );
}

// Domain chip — pill with glyph + label, used in filters and headers.
function DomainChip({ domain, active = false, size = 'sm', onClick, style = {} }) {
  const d = DOMAINS[domain];
  if (!d) return null;
  const h = size === 'sm' ? 24 : 28;
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: h, padding: '0 10px 0 8px',
      borderRadius: h / 2,
      background: active ? d.color : d.tint,
      color: active ? '#FAF6EC' : d.color,
      fontFamily: Q.sans, fontSize: 12, fontWeight: 500,
      letterSpacing: 0.1, lineHeight: 1, cursor: onClick ? 'pointer' : 'default',
      boxShadow: active ? 'none' : `inset 0 0 0 0.5px ${d.edge}`,
      ...style,
    }}>
      <DomainGlyph domain={domain} size={12} strokeWidth={1.4} />
      <span>{d.label}</span>
    </span>
  );
}

Object.assign(window, { Q, DOMAINS, DOMAIN_ORDER, DomainGlyph, DomainBadge, DomainChip, QIcon });
