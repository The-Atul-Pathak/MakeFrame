import { useState } from 'react'
import {
  IconArrowLeft,
  IconFileText,
  IconMovie,
  IconList,
  IconUser,
  IconLayoutList,
} from '@tabler/icons-react'
import type { Project } from '@/types/project'

export type WorkspaceModule = 'beatsheet' | 'screenplay' | 'storyboard' | 'shotlist' | 'characters'

interface NavItem {
  id: WorkspaceModule
  label: string
  icon: React.ReactNode
  description: string
}

interface Props {
  project: Project
  activeModule: WorkspaceModule
  onModuleChange: (m: WorkspaceModule) => void
  onBack: () => void
}

const NAV_ITEMS: NavItem[] = [
  { id: 'characters', label: 'Characters',  icon: <IconUser size={15} />,       description: 'Character bibles'   },
  { id: 'beatsheet',  label: 'Beat Sheet',  icon: <IconLayoutList size={15} />, description: 'Story structure' },
  { id: 'screenplay', label: 'Screenplay',  icon: <IconFileText size={15} />,   description: 'Write your script'  },
  { id: 'storyboard', label: 'Storyboard',  icon: <IconMovie size={15} />,      description: 'Shot-by-shot panels' },
  { id: 'shotlist',   label: 'Shot List',   icon: <IconList size={15} />,       description: 'Production list'    },
]

export default function Sidebar({ project, activeModule, onModuleChange, onBack }: Props) {
  const [backHovered, setBackHovered] = useState(false)
  const [hoveredId, setHoveredId] = useState<WorkspaceModule | null>(null)

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '0.5px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Project title */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '0.5px solid var(--color-border-subtle)',
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: '0.55rem',
            letterSpacing: '0.1em',
            color: 'var(--color-text-tertiary)',
            marginBottom: 4,
          }}
        >
          PROJECT
        </p>
        <span
          style={{
            display: 'block',
            fontSize: '0.85rem',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {project.title}
        </span>
        {project.format && (
          <span
            className="font-mono"
            style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}
          >
            {project.format}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.id === activeModule
          const isHovered = hoveredId === item.id

          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                background: isActive
                  ? 'var(--color-accent-muted)'
                  : isHovered
                    ? 'var(--color-surface-raised)'
                    : 'transparent',
                border: 'none',
                borderLeft: `1.5px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                cursor: 'pointer',
                color: isActive
                  ? 'var(--color-accent)'
                  : 'var(--color-text-secondary)',
                transition: 'background 150ms, color 150ms',
                textAlign: 'left',
              }}
            >
              <span style={{ lineHeight: 0, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.82rem', display: 'block', lineHeight: 1.2 }}>{item.label}</span>
                {isHovered && !isActive && (
                  <span
                    className="font-mono"
                    style={{ fontSize: '0.5rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}
                  >
                    {item.description}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Back to dashboard */}
      <div style={{ borderTop: '0.5px solid var(--color-border-subtle)', padding: '8px 0' }}>
        <button
          onClick={onBack}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: backHovered ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            transition: 'color 150ms',
          }}
        >
          <IconArrowLeft size={13} />
          <span style={{ fontSize: '0.8rem' }}>Dashboard</span>
        </button>
      </div>
    </aside>
  )
}
