/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        linen:      '#F2EDE3',
        'linen-2':  '#EAE2CE',
        paper:      '#FAF6EC',
        'paper-2':  '#F6F0DF',
        rule:       '#D9CFB8',
        'rule-soft':'#E5DCC6',
        ink:        '#1F1D18',
        'ink-2':    '#5C5448',
        'ink-3':    '#948A78',
        'ink-4':    '#BFB6A0',
        rubric:     '#8E3A1A',
        'rubric-2': '#C26B4A',
        gold:       '#B8893A',
        domain: {
          spirit: { DEFAULT: '#4A5578', tint: '#E6E5EC', edge: '#C9C8D6' },
          body:   { DEFAULT: '#5F6E3C', tint: '#E8EADD', edge: '#CBD0B4' },
          work:   { DEFAULT: '#8B5A3C', tint: '#EFE4D7', edge: '#D9C4AD' },
          wealth: { DEFAULT: '#A57E2A', tint: '#F0E8D2', edge: '#DBC994' },
          family: { DEFAULT: '#6E3F4A', tint: '#EDE0E2', edge: '#D2B9BE' },
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Source Serif Pro', 'Georgia', 'serif'],
        sans:  ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono:  ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { paper: '3px', pill: '15px', sheet: '18px' },
      boxShadow: {
        sheet: '0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)',
        fab:   '0 6px 18px rgba(31,29,24,0.18)',
      },
    },
  },
  plugins: [],
}
