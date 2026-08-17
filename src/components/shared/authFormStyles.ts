import type { CSSProperties } from 'react'

/* Shared across Login, Signup, ForgotPassword, ResetPassword and AuthLayout.
   Sizes reference --text-* from index.css; nothing here goes below --text-sm,
   since these are the first controls a new user ever touches. */

export const inputStyle: CSSProperties = {
  width: '100%',
  height: 44,
  borderRadius: 8,
  /* --color-border is only ~1.5:1 against the field fill; controls need the
     3:1 boundary that --color-control-border provides (WCAG 1.4.11). */
  border: '1px solid var(--color-control-border)',
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text-primary)',
  padding: '0 12px',
  fontSize: 'var(--text-base)',
  /* No `outline: none` here — the global :focus-visible ring in index.css is
     the only focus indicator these fields have. */
}

export const primaryBtnStyle: CSSProperties = {
  width: '100%',
  padding: '12px 0',
  borderRadius: 8,
  border: 'none',
  background: 'var(--color-accent)',
  /* Dark-on-amber is 7.79:1. Light text on this fill would be 2.47:1. */
  color: 'var(--color-background)',
  fontSize: 'var(--text-base)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 150ms, color 150ms, opacity 150ms',
}

export const secondaryBtnStyle: CSSProperties = {
  width: '100%',
  padding: '12px 0',
  borderRadius: 8,
  border: '1px solid var(--color-control-border)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-base)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

export const linkStyle: CSSProperties = {
  color: 'var(--color-accent)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
}

export const errorTextStyle: CSSProperties = {
  /* Was 0.62rem (9.9px) in a red that measured 2.95:1 — the least readable
     text in the app, on the one message users most need to read. */
  fontSize: 'var(--text-sm)',
  color: 'var(--color-danger)',
  lineHeight: 1.5,
}
