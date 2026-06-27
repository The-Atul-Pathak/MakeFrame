import { useState } from 'react'
import { IconMaximize, IconTrash } from '@tabler/icons-react'
import type { Panel } from '@/types'
import SketchCanvas from './SketchCanvas'

const SHOT_TYPE_LABELS: Record<string, string> = {
  EWS: 'Extreme Wide', WS: 'Wide', MS: 'Medium', MCU: 'Med. Close-Up',
  CU: 'Close-Up', ECU: 'Extreme CU', OTS: 'Over Shoulder', POV: 'Point of View',
  INSERT: 'Insert', TWO: 'Two-Shot',
}

interface Props {
  panel: Panel
  index: number
  onUpdate: (patch: Partial<Panel>) => void
  onDelete: () => void
  onExpand: () => void
}

export default function PanelCard({ panel, index, onUpdate, onDelete, onExpand }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        border: `0.5px solid ${hovered ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 150ms, transform 150ms, box-shadow 150ms',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-card)' : 'none',
      }}
    >
      {/* Panel number + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px 6px',
          borderBottom: '0.5px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            className="font-mono"
            style={{
              fontSize: '0.55rem',
              color: 'var(--color-background)',
              background: 'var(--color-accent)',
              padding: '1px 5px',
              borderRadius: 3,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}>
            {panel.shotType} · {panel.lens}mm
          </span>
        </div>
        {hovered && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={onExpand}
              title="Expand panel"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                lineHeight: 0,
                padding: 2,
              }}
            >
              <IconMaximize size={12} />
            </button>
            <button
              onClick={onDelete}
              title="Delete panel"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-danger)',
                lineHeight: 0,
                padding: 2,
              }}
            >
              <IconTrash size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Sketch area */}
      <div style={{ padding: '8px 10px 6px' }}>
        <SketchCanvas
          dataUrl={panel.sketchDataUrl}
          onChange={dataUrl => onUpdate({ sketchDataUrl: dataUrl })}
        />
      </div>

      {/* Metadata */}
      <div style={{ padding: '6px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Shot type + movement row */}
        <div style={{ display: 'flex', gap: 5 }}>
          <select
            value={panel.shotType}
            onChange={e => onUpdate({ shotType: e.target.value as Panel['shotType'] })}
            style={{
              flex: 1,
              background: 'var(--color-surface-raised)',
              border: '0.5px solid var(--color-border-subtle)',
              borderRadius: 4,
              padding: '3px 5px',
              color: 'var(--color-text-secondary)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.6rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {Object.keys(SHOT_TYPE_LABELS).map(s => (
              <option key={s} value={s} style={{ background: 'var(--color-surface-raised)' }}>
                {s} — {SHOT_TYPE_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            value={panel.movement}
            onChange={e => onUpdate({ movement: e.target.value as Panel['movement'] })}
            style={{
              flex: 1,
              background: 'var(--color-surface-raised)',
              border: '0.5px solid var(--color-border-subtle)',
              borderRadius: 4,
              padding: '3px 5px',
              color: 'var(--color-text-secondary)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.6rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {['Static','Pan','Tilt','Dolly','Track','Crane/Jib','Handheld','Steadicam','Rack Focus','Zoom'].map(m => (
              <option key={m} value={m} style={{ background: 'var(--color-surface-raised)' }}>{m}</option>
            ))}
          </select>
        </div>

        {/* Lens + duration */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
            <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>LENS</span>
            <input
              type="number"
              value={panel.lens}
              onChange={e => onUpdate({ lens: Number(e.target.value) })}
              min={14}
              max={600}
              style={{
                flex: 1,
                background: 'var(--color-surface-raised)',
                border: '0.5px solid var(--color-border-subtle)',
                borderRadius: 4,
                padding: '3px 5px',
                color: 'var(--color-text-secondary)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.6rem',
                outline: 'none',
                textAlign: 'right',
              }}
            />
            <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)' }}>mm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
            <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>DUR</span>
            <input
              type="number"
              value={panel.durationEstimate}
              onChange={e => onUpdate({ durationEstimate: Number(e.target.value) })}
              min={1}
              style={{
                flex: 1,
                background: 'var(--color-surface-raised)',
                border: '0.5px solid var(--color-border-subtle)',
                borderRadius: 4,
                padding: '3px 5px',
                color: 'var(--color-text-secondary)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.6rem',
                outline: 'none',
                textAlign: 'right',
              }}
            />
            <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)' }}>s</span>
          </div>
        </div>

        {/* Action description */}
        <textarea
          value={panel.actionDescription}
          onChange={e => onUpdate({ actionDescription: e.target.value })}
          placeholder="Action description…"
          rows={2}
          style={{
            width: '100%',
            background: 'var(--color-surface-raised)',
            border: '0.5px solid var(--color-border-subtle)',
            borderRadius: 4,
            padding: '4px 6px',
            color: 'var(--color-text-primary)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.72rem',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.4,
          }}
        />

        {/* Dialogue note */}
        <input
          value={panel.dialogueNote}
          onChange={e => onUpdate({ dialogueNote: e.target.value })}
          placeholder="Dialogue / sound note…"
          style={{
            width: '100%',
            background: 'var(--color-surface-raised)',
            border: '0.5px solid var(--color-border-subtle)',
            borderRadius: 4,
            padding: '4px 6px',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.72rem',
            outline: 'none',
            fontStyle: 'italic',
          }}
        />
      </div>
    </div>
  )
}
