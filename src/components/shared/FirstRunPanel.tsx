import { useState } from 'react'
import { IconPencilPlus, IconPlayerPlay, IconLoader2 } from '@tabler/icons-react'

interface Props {
  onStartBlank: () => void
  onOpenSample: () => Promise<void>
}

interface ChoiceProps {
  icon: React.ReactNode
  title: React.ReactNode
  body: string
  action: string
  busy?: boolean
  disabled?: boolean
  onClick: () => void
}

function Choice({ icon, title, body, action, busy, disabled, onClick }: ChoiceProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '24px 24px 22px',
        background: hovered && !disabled ? 'var(--color-surface-raised)' : 'var(--color-surface)',
        border: `1px solid ${hovered && !disabled ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
        borderRadius: 10,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled && !busy ? 0.5 : 1,
        transition: 'background 150ms, border-color 150ms',
      }}
    >
      <span style={{ lineHeight: 0, color: 'var(--color-accent)' }}>
        {busy ? <IconLoader2 size={17} className="animate-spin" /> : icon}
      </span>

      <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
        {title}
      </span>

      <p
        className="font-ui"
        style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, flex: 1 }}
      >
        {body}
      </p>

      <span
        className="font-mono"
        style={{
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.08em',
          color: 'var(--color-accent)',
          marginTop: 2,
        }}
      >
        {busy ? 'SEEDING…' : action}
      </span>
    </button>
  )
}

/**
 * Replaces the bare "+ New project" card on an empty dashboard.
 *
 * The sample is offered alongside the blank start rather than pushed as a tour:
 * a working project teaches the module relationships faster than a walkthrough
 * can describe them, but a writer who came here to write should not have to
 * dismiss anything first.
 */
export default function FirstRunPanel({ onStartBlank, onOpenSample }: Props) {
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSample = async () => {
    setSeeding(true)
    setError(null)
    try {
      await onOpenSample()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build the sample project.')
      setSeeding(false)
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div className="flex" style={{ gap: 16, alignItems: 'stretch' }}>
        <Choice
          icon={<IconPencilPlus size={17} />}
          title="Start a project"
          body="Name it and pick a format. Characters and beats first, or go straight to the page — the screenplay is what drives the storyboard and shot list."
          action="NEW PROJECT"
          disabled={seeding}
          onClick={onStartBlank}
        />
        <Choice
          icon={<IconPlayerPlay size={17} />}
          title={<>Open <em>Signal Hill</em></>}
          body="A 12-page short, already built out across all five modules. Read how the scenes become panels and the panels become shots, then edit or delete it like any other project."
          action="LOAD THE SAMPLE"
          busy={seeding}
          disabled={seeding}
          onClick={handleSample}
        />
      </div>

      {error && (
        <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  )
}
