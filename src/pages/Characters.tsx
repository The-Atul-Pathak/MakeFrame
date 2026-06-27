import { useState } from 'react'
import { IconPlus, IconTrash, IconUser } from '@tabler/icons-react'
import type { Project } from '@/types/project'
import { useCharacterStore } from '@/store/characterSlice'
import CharacterProfile from '@/components/characters/CharacterProfile'

interface Props {
  project: Project
}

export default function Characters({ project }: Props) {
  const { createCharacter, updateCharacter, deleteCharacter, getCharactersForProject } = useCharacterStore()
  const projectCharacters = getCharactersForProject(project.id)

  const [activeCharId, setActiveCharId] = useState<string | null>(
    projectCharacters.length > 0 ? projectCharacters[0].id : null
  )
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const activeChar = projectCharacters.find(c => c.id === activeCharId) ?? null

  const handleAdd = () => {
    const char = createCharacter(project.id)
    setActiveCharId(char.id)
  }

  const handleDelete = (id: string) => {
    deleteCharacter(id)
    if (activeCharId === id) {
      const remaining = projectCharacters.filter(c => c.id !== id)
      setActiveCharId(remaining.length > 0 ? remaining[0].id : null)
    }
    setConfirmDeleteId(null)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '0.5px solid var(--color-border-subtle)',
          padding: '12px 24px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          Characters
        </h1>
        <div style={{ flex: 1 }} />
        <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
          {projectCharacters.length} character{projectCharacters.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--color-background)',
          }}
        >
          <IconPlus size={12} />
          <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>NEW CHARACTER</span>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Character list */}
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: '0.5px solid var(--color-border-subtle)',
            background: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {projectCharacters.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                  No characters yet.
                  <br />
                  Add your first character.
                </p>
              </div>
            ) : (
              projectCharacters.map(char => {
                const isActive = char.id === activeCharId
                const isHovered = hoveredId === char.id

                return (
                  <div
                    key={char.id}
                    onMouseEnter={() => setHoveredId(char.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setActiveCharId(char.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: isActive ? 'var(--color-accent-muted)' : isHovered ? 'var(--color-surface-raised)' : 'transparent',
                      borderLeft: `1.5px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                      transition: 'background 120ms',
                    }}
                  >
                    {/* Avatar circle */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isActive ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
                        border: `0.5px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 150ms',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {char.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.3,
                        }}
                      >
                        {char.name}
                      </p>
                      {char.occupation && (
                        <p
                          className="font-mono"
                          style={{
                            fontSize: '0.55rem',
                            color: 'var(--color-text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {char.occupation}
                        </p>
                      )}
                    </div>

                    {isHovered && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setConfirmDeleteId(char.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-danger)',
                          lineHeight: 0,
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        <IconTrash size={11} />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Add character button (bottom) */}
          <div style={{ borderTop: '0.5px solid var(--color-border-subtle)', padding: '8px 0' }}>
            <button
              onClick={handleAdd}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'}
            >
              <IconPlus size={12} />
              <span style={{ fontSize: '0.78rem' }}>Add Character</span>
            </button>
          </div>
        </aside>

        {/* Profile editor */}
        {activeChar ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <CharacterProfile
              character={activeChar}
              allCharacters={projectCharacters}
              onChange={patch => updateCharacter(activeChar.id, patch)}
            />
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              opacity: 0.5,
            }}
          >
            <IconUser size={32} style={{ color: 'var(--color-text-tertiary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              No character selected
            </span>
            <span
              className="font-mono"
              style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}
            >
              Add a character to build your character bible.
            </span>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              borderRadius: 12,
              padding: '24px 28px',
              width: 320,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
              DELETE CHARACTER
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
              Delete {projectCharacters.find(c => c.id === confirmDeleteId)?.name}?
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 20 }}>
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.82rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                style={{
                  padding: '6px 14px',
                  background: 'var(--color-danger)',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
