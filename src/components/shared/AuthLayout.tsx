import type { CSSProperties, ReactNode } from 'react'
import { IconDeviceTv } from '@tabler/icons-react'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/** Shared shell for /login, /signup, /forgot-password, /reset-password. */
export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-background)',
      }}
    >
      <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <span className="font-display text-lg text-text-primary tracking-tight">MakeFrame</span>
          <IconDeviceTv size={15} style={{ color: 'var(--color-text-tertiary)' }} />
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '0.5px solid var(--color-border)',
            borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
            padding: '28px 28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <h1 className="font-display" style={{ fontSize: '1.15rem', color: 'var(--color-text-primary)', marginBottom: subtitle ? 6 : 0 }}>
              {title}
            </h1>
            {subtitle && (
              <p className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>

        {footer && <div style={{ textAlign: 'center' }}>{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <span className="font-mono uppercase" style={{ fontSize: '0.58rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.12em' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

export function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
      <span className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
    </div>
  )
}
