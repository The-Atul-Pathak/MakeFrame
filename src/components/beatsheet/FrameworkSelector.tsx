import { useState, useRef, useEffect } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import type { BeatFramework } from '@/types/beatsheet'
import { FRAMEWORKS } from '@/utils/beatSheetFrameworks'

interface Props {
  value: BeatFramework
  onChange: (framework: BeatFramework) => void
  disabled?: boolean
}

const FRAMEWORK_KEYS = Object.keys(FRAMEWORKS) as BeatFramework[]

export default function FrameworkSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = FRAMEWORKS[value]

  const handleSelect = (fw: BeatFramework) => {
    if (fw === value) { setOpen(false); return }
    onChange(fw)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          background: open ? 'var(--color-surface-raised)' : 'var(--color-surface)',
          border: `0.5px solid ${open ? 'var(--color-border)' : 'var(--color-border-subtle)'}`,
          borderRadius: 6,
          cursor: disabled ? 'default' : 'pointer',
          color: 'var(--color-text-secondary)',
          transition: 'background 150ms, border-color 150ms',
        }}
      >
        <span className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}>
          {current?.label ?? value}
        </span>
        <IconChevronDown
          size={11}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms', flexShrink: 0 }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 50,
            background: 'var(--color-surface-raised)',
            border: '0.5px solid var(--color-border)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            minWidth: 280,
          }}
        >
          {FRAMEWORK_KEYS.map(fk => {
            const fw = FRAMEWORKS[fk]
            const isActive = fk === value
            return (
              <button
                key={fk}
                onClick={() => handleSelect(fk)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  padding: '10px 14px',
                  background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                  border: 'none',
                  borderBottom: '0.5px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {fw.label}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
                  {fw.description}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
