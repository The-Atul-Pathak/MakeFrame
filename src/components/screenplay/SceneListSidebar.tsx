import { useState } from 'react'
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react'
import type { Scene } from '@/types'

interface Props {
  scenes: Scene[]
  activeSceneId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
}

export default function SceneListSidebar({ scenes, activeSceneId, onSelect, onAdd, onDelete }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const pageTotal = scenes.reduce((acc, s) => {
    const parts = s.pageLength.split(' ')
    let pages = 0
    for (const p of parts) {
      if (p.includes('/')) {
        const [n, d] = p.split('/').map(Number)
        pages += n / d
      } else {
        pages += Number(p) || 0
      }
    }
    return acc + pages
  }, 0)

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: '0.5px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '0.5px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <p className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>
            SCENES
          </p>
          <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
            {scenes.length} scenes · ~{Math.ceil(pageTotal)}p
          </span>
        </div>
        <button
          onClick={onAdd}
          title="Add scene"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            color: 'var(--color-background)',
          }}
        >
          <IconPlus size={13} />
        </button>
      </div>

      {/* Scene list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {scenes.length === 0 && (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <p className="font-mono" style={{ fontSize: '0.62rem', lineHeight: 1.6 }}>
              No scenes yet.
              <br />
              Add your first scene to begin.
            </p>
          </div>
        )}

        {scenes.map((scene, i) => {
          const isActive = scene.id === activeSceneId
          const isHovered = scene.id === hoveredId
          const heading = `${scene.intExt}. ${scene.location} — ${scene.timeOfDay}`

          return (
            <div
              key={scene.id}
              onMouseEnter={() => setHoveredId(scene.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(scene.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                background: isActive ? 'var(--color-accent-muted)' : isHovered ? 'var(--color-surface-raised)' : 'transparent',
                borderLeft: `1.5px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                transition: 'background 120ms',
              }}
            >
              <IconGripVertical size={12} style={{ color: 'var(--color-text-tertiary)', marginTop: 2, flexShrink: 0, opacity: 0.4 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.55rem',
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                      background: isActive ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
                      padding: '1px 4px',
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)' }}
                  >
                    {scene.pageLength}p
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}
                >
                  {heading}
                </p>
                {scene.emotionalTone && (
                  <span
                    className="font-mono"
                    style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}
                  >
                    {scene.emotionalTone}
                  </span>
                )}
              </div>

              {isHovered && (
                <button
                  onClick={e => { e.stopPropagation(); onDelete(scene.id) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-danger)',
                    lineHeight: 0,
                    padding: 0,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                  title="Delete scene"
                >
                  <IconTrash size={11} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
