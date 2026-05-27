import SectionLabel from './SectionLabel'

interface Tip {
  shortcut: string
  description: string
}

const TIPS: Tip[] = [
  { shortcut: 'Ctrl+Enter', description: 'Insert a new scene heading from anywhere in the screenplay' },
  { shortcut: 'Tab',        description: 'Cycle forward through screenplay element types' },
  { shortcut: 'Shift+Tab', description: 'Cycle backward through element types' },
]

export default function TipsStrip() {
  return (
    <div>
      <SectionLabel>Getting started</SectionLabel>

      <div
        className="flex"
        style={{
          marginTop: 20,
          borderTop: '0.5px solid var(--color-border)',
          borderBottom: '0.5px solid var(--color-border)',
          padding: '32px 0',
        }}
      >
        {TIPS.map((tip, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 flex-1"
            style={{
              padding: '0 28px',
              borderLeft: i > 0 ? '0.5px solid var(--color-border)' : 'none',
            }}
          >
            <kbd
              className="font-mono self-start"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-muted)',
                padding: '3px 8px',
                borderRadius: 4,
                border: '0.5px solid var(--color-border-accent)',
              }}
            >
              {tip.shortcut}
            </kbd>
            <p
              className="font-ui"
              style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
            >
              {tip.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
