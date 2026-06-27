import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  width: '100%',
  height: 40,
  borderRadius: 8,
  border: '0.5px solid var(--color-border)',
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text-primary)',
  padding: '0 12px',
  fontSize: '0.82rem',
  outline: 'none',
}

export const primaryBtnStyle: CSSProperties = {
  width: '100%',
  padding: '10px 0',
  borderRadius: 8,
  border: 'none',
  background: 'var(--color-accent)',
  color: 'var(--color-background)',
  fontSize: '0.7rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 150ms, color 150ms, opacity 150ms',
}

export const secondaryBtnStyle: CSSProperties = {
  width: '100%',
  padding: '10px 0',
  borderRadius: 8,
  border: '0.5px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: '0.7rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

export const linkStyle: CSSProperties = {
  color: 'var(--color-accent)',
  fontSize: '0.68rem',
  cursor: 'pointer',
}

export const errorTextStyle: CSSProperties = {
  fontSize: '0.62rem',
  color: 'var(--color-danger)',
  lineHeight: 1.5,
}
