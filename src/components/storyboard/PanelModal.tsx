import { IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { Panel, Scene } from '@/types'
import SketchCanvas from './SketchCanvas'

interface Props {
  panel: Panel
  scene: Scene
  panelIndex: number
  totalPanels: number
  onUpdate: (patch: Partial<Panel>) => void
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const SHOT_TYPES = ['EWS','WS','MS','MCU','CU','ECU','OTS','POV','INSERT','TWO'] as const
const MOVEMENTS = ['Static','Pan','Tilt','Dolly','Track','Crane/Jib','Handheld','Steadicam','Rack Focus','Zoom'] as const

const LENS_GUIDE: Array<{ range: string; feel: string }> = [
  { range: '14–24mm', feel: 'Ultra wide — distortion, scale' },
  { range: '28–35mm', feel: 'Wide — environmental, naturalistic' },
  { range: '40–50mm', feel: 'Normal — closest to human eye' },
  { range: '85mm', feel: 'Portrait — subject pops from bg' },
  { range: '100–135mm', feel: 'Telephoto — intimate compression' },
  { range: '200mm+', feel: 'Long — surveillance, isolated' },
]

const labelStyle: React.CSSProperties = {
  fontSize: '0.55rem',
  letterSpacing: '0.08em',
  color: 'var(--color-text-tertiary)',
  marginBottom: 5,
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-raised)',
  border: '0.5px solid var(--color-border-subtle)',
  borderRadius: 5,
  padding: '6px 8px',
  color: 'var(--color-text-secondary)',
  fontFamily: '"DM Mono", monospace',
  fontSize: '0.65rem',
  outline: 'none',
  cursor: 'pointer',
}

export default function PanelModal({ panel, scene, panelIndex, totalPanels, onUpdate, onClose, onPrev, onNext }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 920,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 12px',
            borderBottom: '0.5px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
              PANEL
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: '0.6rem',
                background: 'var(--color-accent)',
                color: 'var(--color-background)',
                padding: '1px 6px',
                borderRadius: 3,
              }}
            >
              {String(panelIndex + 1).padStart(2, '0')} / {String(totalPanels).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              {scene.intExt}. {scene.location} — {scene.timeOfDay}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onPrev}
              disabled={panelIndex === 0}
              style={{
                background: 'none',
                border: '0.5px solid var(--color-border-subtle)',
                borderRadius: 5,
                cursor: panelIndex === 0 ? 'default' : 'pointer',
                color: panelIndex === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
                lineHeight: 0,
                padding: 5,
                opacity: panelIndex === 0 ? 0.4 : 1,
              }}
            >
              <IconChevronLeft size={14} />
            </button>
            <button
              onClick={onNext}
              disabled={panelIndex === totalPanels - 1}
              style={{
                background: 'none',
                border: '0.5px solid var(--color-border-subtle)',
                borderRadius: 5,
                cursor: panelIndex === totalPanels - 1 ? 'default' : 'pointer',
                color: panelIndex === totalPanels - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
                lineHeight: 0,
                padding: 5,
                opacity: panelIndex === totalPanels - 1 ? 0.4 : 1,
              }}
            >
              <IconChevronRight size={14} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                lineHeight: 0,
                padding: 4,
              }}
            >
              <IconX size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {/* Sketch area */}
          <div style={{ padding: '20px 24px', borderRight: '0.5px solid var(--color-border-subtle)', overflowY: 'auto' }}>
            <SketchCanvas
              dataUrl={panel.sketchDataUrl}
              onChange={dataUrl => onUpdate({ sketchDataUrl: dataUrl })}
              width={720}
              height={405}
            />
          </div>

          {/* Detail panel */}
          <div
            style={{
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Shot type */}
            <div>
              <p className="font-mono" style={labelStyle}>SHOT TYPE</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {SHOT_TYPES.map(s => (
                  <button
                    key={s}
                    onClick={() => onUpdate({ shotType: s })}
                    style={{
                      padding: '3px 8px',
                      background: panel.shotType === s ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                      border: `0.5px solid ${panel.shotType === s ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      color: panel.shotType === s ? 'var(--color-background)' : 'var(--color-text-secondary)',
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '0.6rem',
                      transition: 'all 120ms',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera movement */}
            <div>
              <p className="font-mono" style={labelStyle}>CAMERA MOVEMENT</p>
              <select
                value={panel.movement}
                onChange={e => onUpdate({ movement: e.target.value as Panel['movement'] })}
                style={selectStyle}
              >
                {MOVEMENTS.map(m => (
                  <option key={m} value={m} style={{ background: 'var(--color-surface-raised)' }}>{m}</option>
                ))}
              </select>
            </div>

            {/* Lens */}
            <div>
              <p className="font-mono" style={labelStyle}>LENS (MM)</p>
              <input
                type="number"
                value={panel.lens}
                onChange={e => onUpdate({ lens: Number(e.target.value) })}
                min={14}
                max={600}
                style={{
                  ...selectStyle,
                  fontFamily: '"DM Mono", monospace',
                  color: 'var(--color-text-primary)',
                }}
              />
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {LENS_GUIDE.map(g => (
                  <span key={g.range} className="font-mono" style={{ fontSize: '0.5rem', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
                    {g.range} — {g.feel}
                  </span>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="font-mono" style={labelStyle}>DURATION (SECONDS)</p>
              <input
                type="number"
                value={panel.durationEstimate}
                onChange={e => onUpdate({ durationEstimate: Number(e.target.value) })}
                min={1}
                style={selectStyle}
              />
            </div>

            {/* Action description */}
            <div>
              <p className="font-mono" style={labelStyle}>ACTION DESCRIPTION</p>
              <textarea
                value={panel.actionDescription}
                onChange={e => onUpdate({ actionDescription: e.target.value })}
                placeholder="What is seen on screen…"
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--color-surface-raised)',
                  border: '0.5px solid var(--color-border-subtle)',
                  borderRadius: 5,
                  padding: '6px 8px',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.78rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Dialogue / sound note */}
            <div>
              <p className="font-mono" style={labelStyle}>DIALOGUE / SOUND NOTE</p>
              <textarea
                value={panel.dialogueNote}
                onChange={e => onUpdate({ dialogueNote: e.target.value })}
                placeholder="Dialogue or sound cue…"
                rows={2}
                style={{
                  width: '100%',
                  background: 'var(--color-surface-raised)',
                  border: '0.5px solid var(--color-border-subtle)',
                  borderRadius: 5,
                  padding: '6px 8px',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.78rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}
              />
            </div>

            {/* Needs review */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={panel.needsReview}
                onChange={e => onUpdate({ needsReview: e.target.checked })}
                style={{ accentColor: 'var(--color-warning)' }}
              />
              <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}>
                FLAG FOR REVIEW
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
