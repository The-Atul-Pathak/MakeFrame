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
  /* Sizes are set a step above what the rest of the UI uses: this is the
     conversion button, and it previously rendered at 9.9px (sm) / 11.2px (md).
     Tracking eased from 0.1em — uppercase mono needs less of it to stay
     scannable once the type is a readable size. */
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-mono uppercase tracking-[0.08em] transition-colors duration-200'
  const sizing = size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
  const look =
    variant === 'primary'
      ? /* Dark-on-amber measures 7.79:1; light text on this fill would be 2.47:1. */
        'bg-accent text-background font-semibold hover:bg-accent-hover'
      : 'border border-control-border text-text-secondary hover:text-text-primary hover:border-border-accent'
  return (
    <Link to={to} className={`${base} ${sizing} ${look}`}>
      {children}
    </Link>
  )
}
