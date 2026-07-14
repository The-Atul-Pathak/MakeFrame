import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconDeviceTv } from '@tabler/icons-react'
import { useAuth } from '@/hooks/useAuth'
import { CtaLink } from '@/components/marketing/Cta'

const navLinkClass =
  'font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary transition-colors duration-200'

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="MakeFrame home">
      <span className="font-display text-md tracking-tight text-text-primary">MakeFrame</span>
      <IconDeviceTv size={15} className="text-text-tertiary" aria-hidden="true" />
    </Link>
  )
}

/**
 * Shell for all public marketing pages (landing, pricing, legal, 404).
 * The app root is overflow:hidden, so this layout owns its own scroll.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-background">
        <div className="mx-auto flex h-topbar max-w-[1120px] items-center justify-between px-5 md:px-10">
          <Wordmark />
          <nav className="flex items-center gap-5 md:gap-6" aria-label="Main">
            <Link to="/pricing" className={navLinkClass}>
              Pricing
            </Link>
            {user ? (
              <CtaLink to="/" size="sm">
                Open your projects
              </CtaLink>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>
                  Sign in
                </Link>
                <CtaLink to="/signup" size="sm">
                  Start free
                </CtaLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-10 md:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex flex-col gap-3">
              <Wordmark />
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-text-tertiary">
                Beat sheet &rarr; Screenplay &rarr; Storyboard &rarr; Shot list
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
              <Link to="/pricing" className={navLinkClass}>
                Pricing
              </Link>
              <Link to="/signup" className={navLinkClass}>
                Create account
              </Link>
              <Link to="/login" className={navLinkClass}>
                Sign in
              </Link>
              <Link to="/privacy" className={navLinkClass}>
                Privacy
              </Link>
              <Link to="/terms" className={navLinkClass}>
                Terms
              </Link>
            </nav>
          </div>
          <p className="font-mono text-[0.62rem] text-text-tertiary">
            &copy; 2026 MakeFrame. Pre-production for writer-directors.
          </p>
        </div>
      </footer>
    </div>
  )
}
