import { IconCheck } from '@tabler/icons-react'
import SectionLabel from './SectionLabel'
import type { Project } from '@/types/project'

interface Tip {
  shortcut: string
  description: string
}

const TIPS: Tip[] = [
  { shortcut: 'Ctrl+Enter', description: 'Insert a new scene heading from anywhere in the screenplay' },
  { shortcut: 'Tab',        description: 'Cycle forward through screenplay element types' },
  { shortcut: 'Shift+Tab', description: 'Cycle backward through element types' },
]

interface Milestone {
  label: string
  detail: string
  done: boolean
}

interface Props {
  projects: Project[]
}

/**
 * Two strips in one, chosen by how far the user has actually got.
 *
 * Until the Screenplay → Storyboard → Shot List chain has been exercised once,
 * this shows where they are in it. After that the milestones are noise, and it
 * falls back to the editor shortcuts — which are useless advice to someone who
 * has not yet written a scene, and were previously shown to everyone regardless.
 */
export default function TipsStrip({ projects }: Props) {
  const totalScenes = projects.reduce((a, p) => a + p.sceneCount, 0)
  const totalPanels = projects.reduce((a, p) => a + p.panelCount, 0)
  const totalShots  = projects.reduce((a, p) => a + p.shotCount, 0)

  const milestones: Milestone[] = [
    { label: 'Start a project',  detail: 'Title and format — the rest is optional.', done: projects.length > 0 },
    { label: 'Write a scene',    detail: 'Scene headings drive everything downstream.', done: totalScenes > 0 },
    { label: 'Storyboard it',    detail: 'Panels hang off the scenes you wrote.',      done: totalPanels > 0 },
    { label: 'Build the shots',  detail: 'Shooting order, grouped by location.',       done: totalShots > 0 },
  ]

  const allDone = milestones.every(m => m.done)
  // The first unfinished milestone is the only one worth drawing attention to.
  const currentIndex = milestones.findIndex(m => !m.done)

  const frameStyle: React.CSSProperties = {
    marginTop: 20,
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    padding: '32px 0',
  }

  if (allDone) {
    return (
      <div>
        <SectionLabel>Shortcuts</SectionLabel>
        <div className="flex" style={frameStyle}>
          {TIPS.map((tip, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 flex-1"
              style={{
                padding: '0 28px',
                borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <kbd
                className="font-mono self-start"
                style={{
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.04em',
                  color: 'var(--color-accent)',
                  background: 'var(--color-accent-muted)',
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--color-border-accent)',
                }}
              >
                {tip.shortcut}
              </kbd>
              <p
                className="font-ui"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
              >
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionLabel>Getting started</SectionLabel>
      <div className="flex" style={frameStyle}>
        {milestones.map((m, i) => {
          const isCurrent = i === currentIndex

          return (
            <div
              key={m.label}
              className="flex flex-col gap-3 flex-1"
              style={{
                padding: '0 28px',
                borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none',
                opacity: m.done ? 0.55 : 1,
              }}
            >
              <span
                className="font-mono self-start flex items-center"
                style={{
                  gap: 6,
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.04em',
                  color: m.done
                    ? 'var(--color-text-tertiary)'
                    : isCurrent ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                  background: isCurrent ? 'var(--color-accent-muted)' : 'transparent',
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: `1px solid ${isCurrent ? 'var(--color-border-accent)' : 'transparent'}`,
                }}
              >
                {m.done
                  ? <IconCheck size={12} />
                  : <span style={{ opacity: 0.7 }}>{String(i + 1).padStart(2, '0')}</span>}
                {m.label}
              </span>
              <p
                className="font-ui"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
              >
                {m.detail}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
