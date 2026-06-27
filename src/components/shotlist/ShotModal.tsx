import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import type { Shot, Scene } from '@/types'

interface Props {
  shot: Shot | null
  scenes: Scene[]
  onSave: (patch: Partial<Shot>) => void
  onClose: () => void
  mode: 'edit' | 'add'
}

const SHOT_TYPES = ['EWS','WS','MS','MCU','CU','ECU','OTS','POV','INSERT','TWO'] as const
const MOVEMENTS = ['Static','Pan','Tilt','Dolly','Track','Crane/Jib','Handheld','Steadicam','Rack Focus','Zoom'] as const
const INT_EXT = ['INT','EXT','INT/EXT'] as const
const LENS_PRESETS = [14, 24, 28, 35, 50, 85, 100, 135, 200]

const labelStyle: React.CSSProperties = {
  fontSize: '0.55rem',
  letterSpacing: '0.08em',
  color: 'var(--color-text-tertiary)',
  marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-raised)',
  border: '0.5px solid var(--color-border-subtle)',
  borderRadius: 5,
  padding: '6px 8px',
  color: 'var(--color-text-primary)',
  fontFamily: 'Outfit, sans-serif',
  fontSize: '0.78rem',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: '"DM Mono", monospace',
  fontSize: '0.65rem',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono" style={labelStyle}>{label}</p>
      {children}
    </div>
  )
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
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
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        padding: '5px 6px',
        background: 'var(--color-surface-raised)',
        border: '0.5px solid var(--color-border-subtle)',
        borderRadius: 5,
        minHeight: 34,
        alignItems: 'center',
      }}
    >
      {values.map(v => (
        <span
          key={v}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
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
          <button onClick={() => onChange(values.filter(x => x !== v))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, lineHeight: 0, fontSize: '0.7rem' }}>×</button>
        </span>
      ))}
      <input placeholder={placeholder} onKeyDown={handleKeyDown} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.72rem', color: 'var(--color-text-primary)', flex: 1, minWidth: 60, fontFamily: 'Outfit, sans-serif' }} />
    </div>
  )
}

export default function ShotModal({ shot, scenes, onSave, onClose, mode }: Props) {
  const [draft, setDraft] = useState<Partial<Shot>>(shot ?? {
    shotType: 'MS',
    movement: 'Static',
    lens: 50,
    intExt: 'INT',
    location: '',
    description: '',
    cast: [],
    specialEquipment: '',
    estimatedSetupMinutes: 15,
    notes: '',
    sceneId: scenes[0]?.id ?? '',
    needsReview: false,
  })

  const patch = <K extends keyof Shot>(key: K, value: Shot[K]) => setDraft(d => ({ ...d, [key]: value }))

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '0.5px solid var(--color-border-subtle)', flexShrink: 0 }}>
          <p className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
            {mode === 'add' ? 'ADD SHOT' : 'EDIT SHOT'}
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', lineHeight: 0 }}>
            <IconX size={15} />
          </button>
        </div>

        {/* Form */}
        <div style={{ overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
          {/* Scene */}
          <Field label="SCENE">
            <select
              value={draft.sceneId ?? ''}
              onChange={e => patch('sceneId', e.target.value)}
              style={selectStyle}
            >
              {scenes.map((s, i) => (
                <option key={s.id} value={s.id} style={{ background: 'var(--color-surface-raised)' }}>
                  {String(i + 1).padStart(2, '0')} — {s.intExt}. {s.location}
                </option>
              ))}
              {scenes.length === 0 && <option value="" style={{ background: 'var(--color-surface-raised)' }}>No scenes</option>}
            </select>
          </Field>

          {/* INT/EXT */}
          <Field label="INT / EXT">
            <div style={{ display: 'flex', gap: 5 }}>
              {INT_EXT.map(opt => (
                <button
                  key={opt}
                  onClick={() => patch('intExt', opt as Shot['intExt'])}
                  style={{
                    flex: 1, padding: '5px 0',
                    background: draft.intExt === opt ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                    border: `0.5px solid ${draft.intExt === opt ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    borderRadius: 4, cursor: 'pointer',
                    color: draft.intExt === opt ? 'var(--color-background)' : 'var(--color-text-secondary)',
                    fontFamily: '"DM Mono", monospace', fontSize: '0.6rem', transition: 'all 120ms',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          {/* Location — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="LOCATION">
              <input
                value={draft.location ?? ''}
                onChange={e => patch('location', e.target.value.toUpperCase())}
                style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: '"Courier Prime", monospace', fontSize: '0.72rem' }}
              />
            </Field>
          </div>

          {/* Shot type */}
          <Field label="SHOT TYPE">
            <select value={draft.shotType ?? 'MS'} onChange={e => patch('shotType', e.target.value as Shot['shotType'])} style={selectStyle}>
              {SHOT_TYPES.map(s => <option key={s} value={s} style={{ background: 'var(--color-surface-raised)' }}>{s}</option>)}
            </select>
          </Field>

          {/* Movement */}
          <Field label="MOVEMENT">
            <select value={draft.movement ?? 'Static'} onChange={e => patch('movement', e.target.value as Shot['movement'])} style={selectStyle}>
              {MOVEMENTS.map(m => <option key={m} value={m} style={{ background: 'var(--color-surface-raised)' }}>{m}</option>)}
            </select>
          </Field>

          {/* Lens */}
          <Field label="LENS (MM)">
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {LENS_PRESETS.map(l => (
                <button
                  key={l}
                  onClick={() => patch('lens', l)}
                  style={{
                    padding: '3px 8px',
                    background: draft.lens === l ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                    border: `0.5px solid ${draft.lens === l ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    borderRadius: 4, cursor: 'pointer',
                    color: draft.lens === l ? 'var(--color-background)' : 'var(--color-text-secondary)',
                    fontFamily: '"DM Mono", monospace', fontSize: '0.58rem', transition: 'all 120ms',
                  }}
                >
                  {l}
                </button>
              ))}
              <input
                type="number"
                value={draft.lens ?? 50}
                onChange={e => patch('lens', Number(e.target.value))}
                min={14}
                style={{ ...inputStyle, width: 56, fontFamily: '"DM Mono", monospace', fontSize: '0.65rem', textAlign: 'center', padding: '3px 5px' }}
              />
            </div>
          </Field>

          {/* Setup time */}
          <Field label="EST. SETUP (MIN)">
            <input
              type="number"
              value={draft.estimatedSetupMinutes ?? 15}
              onChange={e => patch('estimatedSetupMinutes', Number(e.target.value))}
              min={0}
              style={inputStyle}
            />
          </Field>

          {/* Description — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="DESCRIPTION">
              <textarea
                value={draft.description ?? ''}
                onChange={e => patch('description', e.target.value)}
                placeholder="What does this shot capture…"
                rows={2}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              />
            </Field>
          </div>

          {/* Cast — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="CAST">
              <TagInput values={draft.cast ?? []} onChange={cast => patch('cast', cast)} placeholder="Add character…" />
            </Field>
          </div>

          {/* Special equipment — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="SPECIAL EQUIPMENT">
              <input
                value={draft.specialEquipment ?? ''}
                onChange={e => patch('specialEquipment', e.target.value)}
                placeholder="Crane, gimbal, underwater rig…"
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Notes — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="NOTES">
              <textarea
                value={draft.notes ?? ''}
                onChange={e => patch('notes', e.target.value)}
                placeholder="Director / DP notes…"
                rows={2}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              />
            </Field>
          </div>

          {/* Needs review */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', gridColumn: '1 / -1' }}>
            <input
              type="checkbox"
              checked={draft.needsReview ?? false}
              onChange={e => patch('needsReview', e.target.checked)}
              style={{ accentColor: 'var(--color-warning)' }}
            />
            <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}>FLAG FOR REVIEW</span>
          </label>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '14px 20px',
            borderTop: '0.5px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
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
            onClick={() => { onSave(draft); onClose() }}
            style={{
              padding: '7px 16px',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--color-background)',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            {mode === 'add' ? 'Add Shot' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
