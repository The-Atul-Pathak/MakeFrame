import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:    'var(--color-background)',
        surface:       'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        border:        'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary':  'var(--color-text-tertiary)',
        accent:        'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-muted': 'var(--color-accent-muted)',
        success:       'var(--color-success)',
        warning:       'var(--color-warning)',
        danger:        'var(--color-danger)',
        'canvas-bg':   'var(--color-canvas-bg)',
        'canvas-text': 'var(--color-canvas-text)',
      },
      fontFamily: {
        display:    ['"DM Serif Display"', 'serif'],
        ui:         ['Outfit', 'sans-serif'],
        mono:       ['"DM Mono"', 'monospace'],
        screenplay: ['"Courier Prime"', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.7rem',  { lineHeight: '1.4' }],
        'sm':   ['0.8rem',  { lineHeight: '1.5' }],
        'base': ['0.9rem',  { lineHeight: '1.6' }],
        'md':   ['1rem',    { lineHeight: '1.6' }],
        'lg':   ['1.2rem',  { lineHeight: '1.4' }],
        'xl':   ['1.5rem',  { lineHeight: '1.3' }],
        '2xl':  ['2rem',    { lineHeight: '1.2' }],
      },
      spacing: {
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '24px',
        '6':  '32px',
        '8':  '48px',
        '10': '64px',
        '12': '80px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      borderWidth: {
        DEFAULT: '0.5px',
        'accent': '1.5px',
      },
      boxShadow: {
        DEFAULT: 'none',
        sm:   'none',
        md:   'none',
        lg:   'none',
        card: 'var(--shadow-card)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
        canvas:  'var(--canvas-width)',
      },
      height: {
        topbar: 'var(--topbar-height)',
      },
    },
  },
  plugins: [],
} satisfies Config
