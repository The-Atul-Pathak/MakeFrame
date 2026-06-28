import { IconPlus } from '@tabler/icons-react'
import { useCharacterStore } from '@/store/characterSlice'

interface Props {
  projectId: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

// Characters must be created in the Characters tab first — this only lets you
// attach/detach already-created characters, it never accepts free text.
export default function CharacterSelect({ projectId, values, onChange, placeholder = 'Add character…' }: Props) {
  const { getCharactersForProject } = useCharacterStore()
  const projectCharacters = getCharactersForProject(projectId)
  const available = projectCharacters.filter(c => !values.includes(c.name))

  const addCharacter = (name: string) => {
    if (!name || values.includes(name)) return
    onChange([...values, name])
  }

  const removeCharacter = (name: string) => {
    onChange(values.filter(v => v !== name))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        padding: '5px 6px',
        background: 'var(--color-surface-raised)',
        border: '0.5px solid var(--color-border-subtle)',
        borderRadius: 5,
        minHeight: 32,
        alignItems: 'center',
      }}
    >
      {values.map(v => (
        <span
          key={v}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '1px 6px',
            background: 'var(--color-surface)',
            border: '0.5px solid var(--color-border)',
            borderRadius: 3,
            fontSize: '0.65rem',
            color: 'var(--color-text-secondary)',
            fontFamily: '"DM Mono", monospace',
          }}
        >
          {v}
          <button
            onClick={() => removeCharacter(v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, lineHeight: 0, fontSize: '0.7rem' }}
          >
            ×
          </button>
        </span>
      ))}

      {projectCharacters.length === 0 ? (
        <span
          className="font-mono"
          style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', padding: '2px 0' }}
        >
          No characters yet — add one in the Characters tab
        </span>
      ) : available.length === 0 ? (
        <span
          className="font-mono"
          style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', padding: '2px 0' }}
        >
          All characters added
        </span>
      ) : (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 90 }}>
          <select
            value=""
            onChange={e => addCharacter(e.target.value)}
            title={placeholder}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.7rem',
              color: 'var(--color-text-tertiary)',
              fontFamily: '"DM Mono", monospace',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="" disabled style={{ background: 'var(--color-surface-raised)' }}>
              {placeholder}
            </option>
            {available.map(c => (
              <option key={c.id} value={c.name} style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}>
                {c.name}
              </option>
            ))}
          </select>
          <IconPlus size={10} style={{ color: 'var(--color-text-tertiary)', pointerEvents: 'none', flexShrink: 0 }} />
        </div>
      )}
    </div>
  )
}
