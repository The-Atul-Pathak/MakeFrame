import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconDeviceTv, IconLock } from '@tabler/icons-react'

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
      <div style={{ width: 408, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <Link
          to="/"
          aria-label="MakeFrame home"
          style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
        >
          <span className="font-display text-lg text-text-primary tracking-tight">MakeFrame</span>
          <IconDeviceTv size={15} style={{ color: 'var(--color-text-tertiary)' }} />
        </Link>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
            padding: '28px 28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <h1 className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginBottom: subtitle ? 6 : 0 }}>
              {title}
            </h1>
            {subtitle && (
              <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>

        <p
          className="font-mono"
          style={{
            display: 'flex',
            /* Not `center`: the copy wraps to two lines at this width, which
               left the lock icon floating in the vertical middle beside it. */
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 6,
            fontSize: 'var(--text-2xs)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.5,
          }}
        >
          <IconLock size={12} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Your scripts stay private — only your account can see your work.</span>
        </p>

        {footer && <div style={{ textAlign: 'center' }}>{footer}</div>}

        <p className="font-mono" style={{ textAlign: 'center', fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
          <Link to="/privacy" style={{ color: 'var(--color-text-secondary)' }}>Privacy</Link>
          {' · '}
          <Link to="/terms" style={{ color: 'var(--color-text-secondary)' }}>Terms</Link>
        </p>
      </div>
    </div>
  )
}

export function Field({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <span className="font-mono uppercase" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', letterSpacing: '0.1em' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

export function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </div>
  )
}
