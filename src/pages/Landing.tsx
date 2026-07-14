import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { IconLock, IconArrowDown } from '@tabler/icons-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { CtaLink } from '@/components/marketing/Cta'
import {
  BeatSheetMock,
  ScreenplayMock,
  StoryboardMock,
  ShotListMock,
} from '@/components/marketing/ModuleMockups'
import { usePageMeta } from '@/hooks/usePageMeta'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '@/lib/siteMeta'

const overlineClass = 'font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-tertiary'

interface Stage {
  number: string
  name: string
  heading: string
  body: string
  detail: string
  Mock: ComponentType
}

const STAGES: Stage[] = [
  {
    number: '01',
    name: 'Beat sheet',
    heading: 'Break the story before you write it.',
    body: 'Pick a framework — Save the Cat, three-act, or your own — and lay the beats out across an act timeline. You know the shape of the film before you type page one.',
    detail: 'Framework validation flags missing and out-of-order beats.',
    Mock: BeatSheetMock,
  },
  {
    number: '02',
    name: 'Screenplay',
    heading: 'Industry-standard pages, zero setup.',
    body: 'Courier on paper, proper screenplay elements, scene numbering handled for you. Every scene stays linked to the beat it serves, so the draft never loses the plot.',
    detail: 'Bright paper canvas — like a script on a dark desk.',
    Mock: ScreenplayMock,
  },
  {
    number: '03',
    name: 'Storyboard',
    heading: 'See the film before you shoot it.',
    body: 'Sketch 16:9 panels scene by scene. Panels stay attached to the scenes that spawned them, so reordering the script reorders the board.',
    detail: 'Panels carry scene and shot references automatically.',
    Mock: StoryboardMock,
  },
  {
    number: '04',
    name: 'Shot list',
    heading: 'Walk on set knowing every setup.',
    body: 'Turn boards into a working shot list — sizes, movement, lenses, coverage per scene. When something upstream changes, the affected shots are flagged for review.',
    detail: 'Nothing drifts out of sync silently.',
    Mock: ShotListMock,
  },
]

export default function Landing() {
  usePageMeta({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  })

  return (
    <MarketingLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 pb-12 pt-12 md:grid-cols-[7fr_5fr] md:px-10 md:pb-[100px] md:pt-[90px]">
        <div className="animate-fade-up flex flex-col items-start gap-6">
          <p className={overlineClass}>Film pre-production suite</p>
          <h1 className="font-display text-[clamp(2.3rem,5.5vw,3.7rem)] leading-[1.08] text-text-primary">
            Start at the beat sheet, not the blank page.
          </h1>
          <p className="max-w-[52ch] text-[0.98rem] leading-[1.7] text-text-secondary">
            MakeFrame carries one story from beats to screenplay to storyboard to shot list —
            without changing tools, re-typing scenes, or losing the thread between the draft and
            the shoot day.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <CtaLink to="/signup">Start free</CtaLink>
            <a
              href="#pipeline"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              See the pipeline <IconArrowDown size={13} aria-hidden="true" />
            </a>
          </div>
          <p className="font-mono text-[0.6rem] tracking-[0.06em] text-text-tertiary">
            No credit card &middot; Free while in early access &middot; Your scripts stay private
          </p>
        </div>

        <div className="animate-fade-up hidden md:block" style={{ animationDelay: '120ms' }}>
          <div className="rotate-2">
            <ScreenplayMock />
          </div>
        </div>
      </section>

      {/* ── Pipeline ─────────────────────────────────────────────────────── */}
      <section id="pipeline" className="border-t border-border-subtle">
        <div className="mx-auto max-w-[1120px] px-5 py-12 md:px-10 md:py-[100px]">
          <div className="mb-12 flex max-w-[60ch] flex-col gap-4">
            <p className={overlineClass}>The pipeline</p>
            <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.3rem)] leading-[1.15] text-text-primary">
              Four stages. One story. One direction.
            </h2>
            <p className="text-[0.95rem] leading-[1.7] text-text-secondary">
              Most tools cover one stage and hand you an export. MakeFrame keeps the whole chain in
              one place, flowing one way — so a change upstream flags everything it touches
              downstream.
            </p>
          </div>

          <div className="flex flex-col gap-12 md:gap-[110px]">
            {STAGES.map(({ number, name, heading, body, detail, Mock }, i) => (
              <div
                key={number}
                className="grid items-center gap-8 md:grid-cols-12 md:gap-10"
              >
                <div
                  className={`flex flex-col items-start gap-4 md:col-span-5 ${
                    i % 2 === 1 ? 'md:order-2 md:col-start-8' : ''
                  }`}
                >
                  <p className={overlineClass}>
                    {number} &mdash; {name}
                  </p>
                  <h3 className="font-display text-[1.45rem] leading-[1.2] text-text-primary">
                    {heading}
                  </h3>
                  <p className="text-[0.92rem] leading-[1.7] text-text-secondary">{body}</p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-text-tertiary">
                    {detail}
                  </p>
                </div>
                <div className={`md:col-span-6 ${i % 2 === 1 ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                  <Mock />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Positioning ──────────────────────────────────────────────────── */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-12 md:grid-cols-2 md:px-10 md:py-[100px]">
          <div className="flex max-w-[48ch] flex-col gap-4">
            <p className={overlineClass}>Scope</p>
            <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.3rem)] leading-[1.15] text-text-primary">
              Pre-production only. On purpose.
            </h2>
            <p className="text-[0.95rem] leading-[1.7] text-text-secondary">
              MakeFrame is built for writer-directors who want to carry an idea to a shootable
              plan — not adopt a production-management platform they don&apos;t need. If your crew
              fits in a group chat, you&apos;re who this is for.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <p className={overlineClass}>In the box</p>
              {['Beat sheets', 'Screenplay', 'Storyboards', 'Shot lists', 'Characters'].map((f) => (
                <p key={f} className="border-l-[1.5px] border-accent pl-3 font-mono text-[0.68rem] text-text-primary">
                  {f}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className={overlineClass}>Deliberately out</p>
              {['Call sheets', 'Crew management', 'Budgets', 'Scheduling', 'Distribution'].map((f) => (
                <p key={f} className="border-l border-border-subtle pl-3 font-mono text-[0.68rem] text-text-tertiary line-through decoration-[0.5px]">
                  {f}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy / trust ──────────────────────────────────────────────── */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-4 px-5 py-12 md:px-10 md:py-[80px]">
          <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-tertiary">
            <IconLock size={13} aria-hidden="true" /> Privacy
          </p>
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.3rem)] leading-[1.15] text-text-primary">
            Your scripts stay private.
          </h2>
          <p className="max-w-[58ch] text-[0.95rem] leading-[1.7] text-text-secondary">
            Unproduced work is sensitive. Everything you make in MakeFrame is private to your
            account by default — no public profiles, no sharing you didn&apos;t ask for, and your
            writing is never used to train AI models. You own every word.
          </p>
          <Link
            to="/privacy"
            className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-text-secondary underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text-primary"
          >
            Read the privacy policy
          </Link>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-6 px-5 py-12 text-center md:px-10 md:py-[110px]">
          <h2 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.12] text-text-primary">
            Your next film starts at the beat sheet.
          </h2>
          <CtaLink to="/signup">Start pre-producing — free</CtaLink>
          <p className="font-mono text-[0.6rem] tracking-[0.06em] text-text-tertiary">
            Takes under a minute &middot; No credit card
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}
