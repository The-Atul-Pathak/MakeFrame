import type { Scene, IntExt, TimeOfDay, ActNumber } from '@/types'
import CharacterSelect from '@/components/shared/CharacterSelect'

const INT_EXT_OPTIONS: IntExt[] = ['INT', 'EXT', 'INT/EXT']
const TIME_OPTIONS: TimeOfDay[] = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS', 'LATER', 'MOMENTS LATER']
const ACT_OPTIONS: ActNumber[] = [1, 2, 3]
const PAGE_LENGTH_OPTIONS = [
  '1/8','2/8','3/8','4/8','5/8','6/8','7/8',
  '1','1 1/8','1 2/8','1 3/8','1 4/8','1 5/8','1 6/8','1 7/8',
  '2','2 1/8','2 2/8','2 3/8','2 4/8','2 5/8','2 6/8','2 7/8',
  '3','4','5',
]
const TONE_OPTIONS = [
  'tense','warm','comic','tragic','mysterious','romantic',
  'action','contemplative','dark','hopeful','neutral',
]

interface Props {
  scene: Scene
  onChange: (patch: Partial<Scene>) => void
  onClose: () => void
}

function FieldLabel({ label }: { label: string }) {
  return (
    <p
      className="font-mono"
      style={{
        fontSize: '0.55rem',
        letterSpacing: '0.08em',
        color: 'var(--color-text-tertiary)',
        marginBottom: 4,
      }}
    >
      {label}
    </p>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-raised)',
  border: '0.5px solid var(--color-border-subtle)',
  borderRadius: 5,
  padding: '5px 8px',
  color: 'var(--color-text-secondary)',
  fontFamily: '"DM Mono", monospace',
  fontSize: '0.65rem',
  outline: 'none',
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-raised)',
  border: '0.5px solid var(--color-border-subtle)',
  borderRadius: 5,
  padding: '5px 8px',
  color: 'var(--color-text-primary)',
  fontFamily: 'Outfit, sans-serif',
  fontSize: '0.78rem',
  outline: 'none',
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = (e.currentTarget as HTMLInputElement).value.trim()
      if (val && !values.includes(val)) {
        onChange([...values, val])
        ;(e.currentTarget as HTMLInputElement).value = ''
      }
    } else if (e.key === 'Backspace' && (e.currentTarget as HTMLInputElement).value === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div>
      <FieldLabel label={label} />
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
              onClick={() => onChange(values.filter(x => x !== v))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, lineHeight: 0, fontSize: '0.7rem' }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.72rem',
            color: 'var(--color-text-primary)',
            flex: 1,
            minWidth: 60,
            fontFamily: 'Outfit, sans-serif',
          }}
        />
      </div>
    </div>
  )
}

export default function SceneMetaPanel({ scene, onChange, onClose }: Props) {
  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        borderLeft: '0.5px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
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
        <p className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
          SCENE METADATA
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            fontSize: '0.9rem',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* INT / EXT */}
        <div>
          <FieldLabel label="INT / EXT" />
          <div style={{ display: 'flex', gap: 6 }}>
            {INT_EXT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => onChange({ intExt: opt })}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  background: scene.intExt === opt ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                  border: `0.5px solid ${scene.intExt === opt ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: scene.intExt === opt ? 'var(--color-background)' : 'var(--color-text-secondary)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '0.6rem',
                  transition: 'all 120ms',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <FieldLabel label="LOCATION" />
          <input
            value={scene.location}
            onChange={e => onChange({ location: e.target.value.toUpperCase() })}
            style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: '"Courier Prime", monospace', fontSize: '0.72rem' }}
          />
        </div>

        {/* Time of day */}
        <div>
          <FieldLabel label="TIME OF DAY" />
          <select
            value={scene.timeOfDay}
            onChange={e => onChange({ timeOfDay: e.target.value as TimeOfDay })}
            style={selectStyle}
          >
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t} style={{ background: 'var(--color-surface-raised)' }}>{t}</option>
            ))}
          </select>
        </div>

        {/* Act */}
        <div>
          <FieldLabel label="ACT" />
          <div style={{ display: 'flex', gap: 6 }}>
            {ACT_OPTIONS.map(act => (
              <button
                key={act}
                onClick={() => onChange({ act })}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  background: scene.act === act ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                  border: `0.5px solid ${scene.act === act ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: scene.act === act ? 'var(--color-background)' : 'var(--color-text-secondary)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '0.6rem',
                  transition: 'all 120ms',
                }}
              >
                ACT {act}
              </button>
            ))}
          </div>
        </div>

        {/* Page length */}
        <div>
          <FieldLabel label="PAGE LENGTH" />
          <select
            value={scene.pageLength}
            onChange={e => onChange({ pageLength: e.target.value })}
            style={selectStyle}
          >
            {PAGE_LENGTH_OPTIONS.map(p => (
              <option key={p} value={p} style={{ background: 'var(--color-surface-raised)' }}>{p}</option>
            ))}
          </select>
        </div>

        {/* Emotional tone */}
        <div>
          <FieldLabel label="EMOTIONAL TONE" />
          <select
            value={scene.emotionalTone}
            onChange={e => onChange({ emotionalTone: e.target.value })}
            style={selectStyle}
          >
            <option value="" style={{ background: 'var(--color-surface-raised)' }}>none</option>
            {TONE_OPTIONS.map(t => (
              <option key={t} value={t} style={{ background: 'var(--color-surface-raised)' }}>{t}</option>
            ))}
          </select>
        </div>

        {/* Characters */}
        <div>
          <FieldLabel label="CHARACTERS" />
          <CharacterSelect
            projectId={scene.projectId}
            values={scene.characters}
            onChange={chars => onChange({ characters: chars })}
          />
        </div>

        {/* Props */}
        <TagInput
          label="PROPS"
          values={scene.props}
          onChange={props => onChange({ props })}
          placeholder="Add prop…"
        />

        {/* Special requirements */}
        <TagInput
          label="SPECIAL REQUIREMENTS"
          values={scene.specialRequirements}
          onChange={reqs => onChange({ specialRequirements: reqs })}
          placeholder="Stunts, VFX…"
        />
      </div>
    </aside>
  )
}
