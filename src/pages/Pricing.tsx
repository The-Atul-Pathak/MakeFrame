import { IconCheck, IconClock } from '@tabler/icons-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { CtaLink } from '@/components/marketing/Cta'
import { usePageMeta } from '@/hooks/usePageMeta'

/**
 * BUSINESS DECISIONS LIVE HERE — edit copy, limits, and future pricing
 * in this constant before launch. Nothing below it hardcodes a price.
 */
const TIERS = [
  {
    name: 'Indie',
    price: '$0',
    cadence: 'free while in early access',
    blurb: 'The full pipeline, for writer-directors making their next film now.',
    features: [
      'Beat sheets with framework validation',
      'Screenplay editor, industry-standard format',
      'Storyboards with scene-linked panels',
      'Shot lists with needs-review flagging',
      'Character profiles',
      'Private by default — your work is only yours',
    ],
    cta: { label: 'Start free', to: '/signup' },
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'TBA',
    cadence: 'when MakeFrame leaves early access',
    blurb: 'For filmmakers who need more than the core pipeline.',
    features: [
      'Everything in Indie',
      'Collaboration and shared projects',
      'PDF and CSV exports',
      'Priority support',
    ],
    cta: null,
    highlight: false,
  },
] as const

const FAQS = [
  {
    q: 'Do I need a credit card?',
    a: 'No. Creating an account is free and MakeFrame has no paid plan today.',
  },
  {
    q: 'What happens to my projects when paid plans launch?',
    a: 'They stay yours. Early-access accounts keep access to everything they have created, and we will give clear notice before any pricing changes.',
  },
  {
    q: 'Who can see my scripts?',
    a: 'Only you. Projects are private to your account, enforced at the database level, and never used to train AI models.',
  },
]

export default function Pricing() {
  usePageMeta({
    title: 'Pricing — MakeFrame',
    description:
      'MakeFrame is free while in early access: beat sheets, screenplay, storyboards, and shot lists for indie writer-directors. No credit card required.',
    path: '/pricing',
  })

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-[1120px] px-5 py-12 md:px-10 md:py-[90px]">
        <div className="animate-fade-up mb-12 flex max-w-[60ch] flex-col gap-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-tertiary">
            Pricing
          </p>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.1] text-text-primary">
            Free while in early access.
          </h1>
          <p className="text-[0.95rem] leading-[1.7] text-text-secondary">
            MakeFrame is in early access: the whole pipeline is free, and honest pricing for indie
            filmmakers is the plan when it isn&apos;t. No credit card, no trial clock.
          </p>
        </div>

        <div className="grid max-w-[860px] gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col gap-5 rounded-lg bg-surface p-6 shadow-card ${
                tier.highlight ? 'border-[1.5px] border-accent' : 'border border-border'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg text-text-primary">{tier.name}</h2>
                {!tier.highlight && (
                  <span className="flex items-center gap-1 rounded-sm bg-surface-raised px-2 py-[3px] font-mono text-[0.55rem] uppercase tracking-[0.12em] text-text-tertiary">
                    <IconClock size={11} aria-hidden="true" /> Coming soon
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-2xl text-text-primary">{tier.price}</span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-tertiary">
                  {tier.cadence}
                </span>
              </div>
              <p className="text-sm leading-[1.6] text-text-secondary">{tier.blurb}</p>
              <ul className="flex flex-col gap-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm leading-[1.5] text-text-secondary">
                    <IconCheck
                      size={14}
                      aria-hidden="true"
                      className={`mt-[3px] shrink-0 ${tier.highlight ? 'text-success' : 'text-text-tertiary'}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.cta && (
                <div className="mt-auto pt-2">
                  <CtaLink to={tier.cta.to}>{tier.cta.label}</CtaLink>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex max-w-[64ch] flex-col gap-8 border-t border-border-subtle pt-10 md:mt-[80px]">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-tertiary">
            Questions
          </p>
          {FAQS.map(({ q, a }) => (
            <div key={q} className="flex flex-col gap-2">
              <h3 className="text-md font-medium text-text-primary">{q}</h3>
              <p className="text-sm leading-[1.7] text-text-secondary">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
