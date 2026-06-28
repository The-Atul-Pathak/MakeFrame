import { useState, useRef, useEffect } from 'react'
import { IconTrash, IconLock, IconCheck, IconChevronDown, IconChevronUp, IconGripVertical } from '@tabler/icons-react'
import type { Beat, BeatStatus } from '@/types/beatsheet'
import { EMOTIONAL_TONES, TONE_COLOR_VAR } from '@/types/beatsheet'
import { FRAMEWORKS } from '@/utils/beatSheetFrameworks'
import type { BeatFramework } from '@/types/beatsheet'
import CharacterSelect from '@/components/shared/CharacterSelect'

interface Props {
  beat: Beat
  projectId: string
  totalPages: number
  framework: BeatFramework
  hint: string
  onChange: (patch: Partial<Beat>) => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

const STATUS_COLOR: Record<BeatStatus, string> = {
  draft:    'var(--color-text-tertiary)',
  approved: 'var(--color-success)',
  locked:   'var(--color-accent)',
}

const STATUS_NEXT: Record<BeatStatus, BeatStatus> = {
  draft:    'approved',
  approved: 'locked',
  locked:   'draft',
}

const STATUS_LABEL: Record<BeatStatus, string> = {
  draft:    'Draft',
  approved: 'Approved',
  locked:   'Locked',
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  minRows = 3,
  style,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        resize: 'none',
        color: 'var(--color-text-primary)',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        overflowY: 'hidden',
        ...style,
      }}
    />
  )
}

export default function BeatCard({ beat, projectId, totalPages, framework, hint, onChange, onDelete, dragHandleProps }: Props) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hovered, setHovered]     = useState(false)

  const pct = totalPages > 0 ? Math.round((beat.pageStart / totalPages) * 100) : 0

  const handleStatusCycle = () => {
    onChange({ status: STATUS_NEXT[beat.status] })
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false) }}
      style={{
        background: 'var(--color-surface)',
        border: `0.5px solid ${hovered ? 'var(--color-border)' : 'var(--color-border-subtle)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 200ms',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px 8px',
          borderBottom: '0.5px solid var(--color-border-subtle)',
        }}
      >
        {/* Drag handle */}
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            title="Drag to reorder"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'grab',
              color: 'var(--color-text-tertiary)',
              lineHeight: 0,
              padding: 0,
              flexShrink: 0,
              touchAction: 'none',
            }}
          >
            <IconGripVertical size={13} />
          </button>
        )}

        {/* Beat number */}
        <span
          className="font-mono"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'var(--color-background)',
            background: 'var(--color-accent)',
            padding: '1px 6px',
            borderRadius: 3,
            flexShrink: 0,
          }}
        >
          {beat.order.toString().padStart(2, '0')}
        </span>

        {/* Beat name */}
        <input
          value={beat.name}
          onChange={e => onChange({ name: e.target.value })}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
            minWidth: 0,
          }}
        />

        {/* Act selector */}
        <select
          value={beat.actKey}
          onChange={e => onChange({ actKey: e.target.value })}
          title="Move to act"
          style={{
            background: 'var(--color-surface-raised)',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.06em',
            padding: '2px 4px',
            borderRadius: 3,
            flexShrink: 0,
            appearance: 'none',
          }}
        >
          {FRAMEWORKS[framework]?.acts.map(a => (
            <option
              key={a.key}
              value={a.key}
              style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}
            >
              {a.label.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Status dot */}
        <button
          onClick={handleStatusCycle}
          title={`Status: ${STATUS_LABEL[beat.status]} — click to cycle`}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: STATUS_COLOR[beat.status],
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 200ms',
          }}
        />
      </div>

      {/* Page range + tone row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderBottom: '0.5px solid var(--color-border-subtle)',
        }}
      >
        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
          p.
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={beat.pageStart}
          onChange={e => onChange({ pageStart: Number(e.target.value) })}
          style={{
            width: 36,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-secondary)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.65rem',
            textAlign: 'center',
          }}
        />
        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
          –
        </span>
        <input
          type="number"
          min={beat.pageStart}
          max={totalPages}
          value={beat.pageEnd}
          onChange={e => onChange({ pageEnd: Number(e.target.value) })}
          style={{
            width: 36,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-secondary)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.65rem',
            textAlign: 'center',
          }}
        />
        <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', opacity: 0.6 }}>
          ({pct}%)
        </span>

        <div style={{ flex: 1 }} />

        {/* Emotional tone selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={beat.emotionalTone ?? ''}
            onChange={e => onChange({ emotionalTone: e.target.value as Beat['emotionalTone'] || null })}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              color: beat.emotionalTone
                ? TONE_COLOR_VAR[beat.emotionalTone]
                : 'var(--color-text-tertiary)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.04em',
              appearance: 'none',
              paddingRight: 0,
            }}
          >
            <option value="">tone…</option>
            {EMOTIONAL_TONES.map(t => (
              <option key={t} value={t} style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '10px 14px' }}>
        <AutoTextarea
          value={beat.description}
          onChange={desc => onChange({ description: desc })}
          placeholder={hint || 'Describe what happens in this beat…'}
          minRows={3}
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Characters */}
      <div style={{ padding: '0 14px 8px' }}>
        <CharacterSelect
          projectId={projectId}
          values={beat.characters}
          onChange={characters => onChange({ characters })}
        />
      </div>

      {/* Notes (collapsible) */}
      <div style={{ borderTop: '0.5px solid var(--color-border-subtle)' }}>
        <button
          onClick={() => setNotesOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>
            NOTES {beat.notes ? '·' : ''}
          </span>
          {notesOpen ? <IconChevronUp size={10} /> : <IconChevronDown size={10} />}
        </button>
        {notesOpen && (
          <div style={{ padding: '0 14px 10px' }}>
            <AutoTextarea
              value={beat.notes}
              onChange={notes => onChange({ notes })}
              placeholder="Director notes, color palette, references…"
              minRows={2}
              style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}
            />
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '6px 14px',
          gap: 8,
          borderTop: '0.5px solid var(--color-border-subtle)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 150ms',
        }}
      >
        {beat.status === 'locked' && (
          <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconLock size={9} /> LOCKED
          </span>
        )}
        {beat.status === 'approved' && (
          <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconCheck size={9} /> APPROVED
          </span>
        )}
        <div style={{ flex: 1 }} />
        {confirmDelete ? (
          <>
            <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-danger)' }}>Delete?</span>
            <button
              onClick={onDelete}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontFamily: '"DM Mono", monospace', fontSize: '0.6rem' }}
            >
              yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontFamily: '"DM Mono", monospace', fontSize: '0.6rem' }}
            >
              no
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', lineHeight: 0, padding: 2 }}
            title="Delete beat"
          >
            <IconTrash size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
