import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface CtaLinkProps {
  to: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

/** Marketing CTA. Amber is reserved for the primary action — one per view. */
export function CtaLink({ to, children, variant = 'primary', size = 'md' }: CtaLinkProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-mono uppercase tracking-[0.1em] transition-colors duration-200'
  const sizing = size === 'sm' ? 'px-4 py-[8px] text-[0.62rem]' : 'px-6 py-[13px] text-[0.7rem]'
  const look =
    variant === 'primary'
      ? 'bg-accent text-background font-medium hover:bg-accent-hover'
      : 'border border-border text-text-secondary hover:text-text-primary hover:border-border-accent'
  return (
    <Link to={to} className={`${base} ${sizing} ${look}`}>
      {children}
    </Link>
  )
}
