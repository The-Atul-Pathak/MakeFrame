import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    /* fontSize and spacing live in `theme`, NOT `theme.extend`, on purpose.
       `extend` merges with Tailwind's defaults, which left both scales
       non-monotonic and produced genuinely surprising bugs:
         - spacing.6 = 32px but default spacing.7 = 28px  -> gap-6 > gap-7
         - fontSize.2xl = 32px but default text-3xl = 30px -> text-2xl > text-3xl
       Replacing the scales outright means every step is larger than the last. */
    fontSize: {
      /* Values come from --text-* in index.css so that `text-sm` and
         `fontSize: var(--text-sm)` can never drift apart. 2xs (12px) is the
         hard floor — there is deliberately no smaller step to reach for. */
      '2xs':  ['var(--text-2xs)',  { lineHeight: '1.45' }],
      'xs':   ['var(--text-xs)',   { lineHeight: '1.45' }],
      'sm':   ['var(--text-sm)',   { lineHeight: '1.5'  }],
      'base': ['var(--text-base)', { lineHeight: '1.6'  }],
      'lg':   ['var(--text-lg)',   { lineHeight: '1.5'  }],
      'xl':   ['var(--text-xl)',   { lineHeight: '1.35' }],
      '2xl':  ['var(--text-2xl)',  { lineHeight: '1.25' }],
      '3xl':  ['var(--text-3xl)',  { lineHeight: '1.15' }],
    },
    spacing: {
      px:   '1px',
      '0':  '0px',
      '0.5':'2px',
      '1':  '4px',
      '1.5':'6px',
      '2':  '8px',
      '2.5':'10px',
      '3':  '12px',
      '4':  '16px',
      '5':  '24px',
      '6':  '32px',
      '7':  '40px',
      '8':  '48px',
      '9':  '56px',
      '10': '64px',
      '11': '72px',
      '12': '80px',
      '14': '96px',
      '16': '112px',
    },
    extend: {
      colors: {
        background:    'var(--color-background)',
        surface:       'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        border:        'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-strong': 'var(--color-border-strong)',
        /* Use on anything clickable or typeable — meets the 3:1 that WCAG
           1.4.11 requires of control boundaries. `border` does not. */
        'control-border': 'var(--color-control-border)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary':  'var(--color-text-tertiary)',
        accent:        'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-muted': 'var(--color-accent-muted)',
        'border-accent': 'var(--color-border-accent)',
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
      borderRadius: {
        'sm': '4px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      borderWidth: {
        /* 1px, not 0.5px: hairlines render sub-pixel and disappear entirely on
           non-retina displays, which is a large part of why the UI read as
           having no structure. */
        DEFAULT: '1px',
        'accent': '2px',
      },
      boxShadow: {
        /* Previously every one of these was 'none', so no Tailwind shadow
           utility did anything and nothing in the UI had elevation. */
        sm:   'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        card: 'var(--shadow-card)',
        none: 'none',
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
