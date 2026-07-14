import { Link } from 'react-router-dom'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { CtaLink } from '@/components/marketing/Cta'
import { usePageMeta } from '@/hooks/usePageMeta'

/** Catch-all for unregistered routes — replaces the old blank dark screen. */
export default function NotFound() {
  usePageMeta({ title: 'Page not found — MakeFrame', noIndex: true })

  return (
    <MarketingLayout>
      <section className="mx-auto flex min-h-[60vh] max-w-[1120px] flex-col items-start justify-center gap-6 px-5 py-12 md:px-10">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-tertiary">
          404 &mdash; Scene missing
        </p>
        <h1 className="max-w-[24ch] font-display text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.12] text-text-primary">
          This page isn&apos;t in the script.
        </h1>
        <p className="max-w-[48ch] text-[0.95rem] leading-[1.7] text-text-secondary">
          The address may have been mistyped, or the page may have been cut in an earlier draft.
          Everything that made the final cut is one click away.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <CtaLink to="/">Back to MakeFrame</CtaLink>
          <Link
            to="/pricing"
            className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-secondary transition-colors duration-200 hover:text-text-primary"
          >
            Pricing
          </Link>
          <Link
            to="/login"
            className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-secondary transition-colors duration-200 hover:text-text-primary"
          >
            Sign in
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
