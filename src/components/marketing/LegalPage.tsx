import type { ReactNode } from 'react'
import MarketingLayout from '@/components/marketing/MarketingLayout'

interface LegalPageProps {
  title: string
  updated: string
  children: ReactNode
}

/** Shared shell for Privacy / Terms: narrow measure, quiet typography. */
export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <MarketingLayout>
      <article className="mx-auto max-w-[68ch] px-5 py-12 md:px-10 md:py-[80px]">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-tertiary">
          Legal
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.12] text-text-primary">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-text-tertiary">
          Last updated: {updated}
        </p>
        <div className="mt-10 flex flex-col gap-8">{children}</div>
      </article>
    </MarketingLayout>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-lg text-text-primary">{heading}</h2>
      <div className="flex flex-col gap-3 text-sm leading-[1.75] text-text-secondary">
        {children}
      </div>
    </section>
  )
}
