// DB values — lowercase, used in all SELECT/INSERT/UPDATE against quill.tasks/quill.projects
export const DOMAIN_VALUES = ['spirit', 'body', 'work', 'wealth', 'family', 'home']

// Invariant ordering — every domain-aware UI loops in this order
export const DOMAIN_ORDER = ['spirit', 'body', 'work', 'wealth', 'family', 'home']

// Full per-domain record — label, color, tint, edge, glyph key, note
// Source of truth: design/quill-system.jsx
export const DOMAINS = {
  spirit: { key: 'spirit', label: 'Spirit', color: '#4A5578', tint: '#E6E5EC', edge: '#C9C8D6', glyph: 'spirit', note: 'transcendence · practice' },
  body:   { key: 'body',   label: 'Body',   color: '#5F6E3C', tint: '#E8EADD', edge: '#CBD0B4', glyph: 'body',   note: 'health · physical' },
  work:   { key: 'work',   label: 'Work',   color: '#8B5A3C', tint: '#EFE4D7', edge: '#D9C4AD', glyph: 'work',   note: 'craft · livelihood' },
  wealth: { key: 'wealth', label: 'Wealth', color: '#A57E2A', tint: '#F0E8D2', edge: '#DBC994', glyph: 'wealth', note: 'money · stewardship' },
  family: { key: 'family', label: 'Family', color: '#6E3F4A', tint: '#EDE0E2', edge: '#D2B9BE', glyph: 'family', note: 'hearth · relationships' },
  home:   { key: 'home',   label: 'Home',   color: '#5C6B6B', tint: '#E5E7E7', edge: '#C5CACA', glyph: 'home',   note: 'household · property' },
}

// Display labels — what users see in the UI
export const DOMAIN_DISPLAY_LABEL = {
  spirit: 'Spirit',
  body:   'Body',
  work:   'Work',
  wealth: 'Wealth',
  family: 'Family',
  home:   'Home',
}

export function displayDomain(value) {
  return DOMAIN_DISPLAY_LABEL[value] ?? value
}

// Priority values (int 0–3) + display labels
export const PRIORITY_VALUES = [0, 1, 2, 3] // low | normal | high | urgent
export const PRIORITY_DISPLAY_LABEL = {
  0: 'Low',
  1: 'Normal',
  2: 'High',
  3: 'Urgent',
}
export const PRIORITY_TO_INT = { low: 0, normal: 1, high: 2, urgent: 3 }
