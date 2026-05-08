/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:    '#E8E2D9',
        muted:  '#9A9187',
        border: '#2A2824',
        canvas: '#0E0D0B',
        domain: {
          spirit:  '#C4A962',
          body:    '#7EA87E',
          project: '#6B8CAE',
          wealth:  '#C49A45',
          family:  '#B8848A',
        },
      },
      fontFamily: {
        header: ['"Playfair Display"', 'serif'],
        task:   ['"Crimson Pro"', 'serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
