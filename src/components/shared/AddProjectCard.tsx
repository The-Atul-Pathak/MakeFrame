import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'

interface Props {
  onClick: () => void
}

export default function AddProjectCard({ onClick }: Props) {
  const [hovered, setHovered] = useState(false)

  const accent = 'var(--color-accent)'
  const muted  = 'var(--color-text-tertiary)'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-2"
      style={{
        /* Must stay in lockstep with ProjectCard — these sit side by side. */
        width: 248,
        height: 184,
        borderRadius: 10,
        background: 'transparent',
        border: `1px dashed ${hovered ? accent : 'var(--color-control-border)'}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 200ms ease, border-color 200ms ease',
      }}
    >
      <IconPlus
        size={22}
        style={{ color: hovered ? accent : muted, transition: 'color 200ms' }}
      />
      <span
        className="font-mono"
        style={{ fontSize: 'var(--text-xs)', color: hovered ? accent : muted, transition: 'color 200ms', letterSpacing: '0.06em' }}
      >
        New project
      </span>
    </button>
  )
}
