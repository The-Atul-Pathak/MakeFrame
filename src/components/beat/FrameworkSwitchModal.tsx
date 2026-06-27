import { useState } from 'react'
import { IconX, IconArrowRight, IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import type { BeatFramework } from '@/types/beatsheet'
import type { BeatRemapping } from '@/types/framework'
import { FRAMEWORK_DEFS } from '@/data/frameworks'
import { useBeatSheetStore } from '@/store/beatSheetSlice'

interface Props {
  projectId: string
  fromFramework: BeatFramework
  toFramework: BeatFramework
  onConfirm: (remappings: BeatRemapping[]) => void
  onCancel: () => void
}

export default function FrameworkSwitchModal({
  projectId,
  fromFramework,
  toFramework,
  onConfirm,
  onCancel,
}: Props) {
  const { beatSheets, buildRemappings } = useBeatSheetStore()
  const sheet = beatSheets[projectId]

  const initialRemappings = buildRemappings(projectId, toFramework)
  const [remappings, setRemappings] = useState<BeatRemapping[]>(initialRemappings)

  const fromDef = FRAMEWORK_DEFS[fromFramework]
  const toDef   = FRAMEWORK_DEFS[toFramework]

  const autoMapped  = remappings.filter(r => !r.isAmbiguous).length
  const needsReview = remappings.filter(r => r.isAmbiguous).length
  const noSlot      = sheet?.beats.filter(b => !b.frameworkBeatId).length ?? 0

  function setConfirmedTarget(userBeatId: string, targetId: string) {
    setRemappings(prev =>
      prev.map(r => r.userBeatId === userBeatId ? { ...r, confirmedTargetId: targetId } : r)
    )
  }

  function getTargetBeatLabel(beatId: string): string {
    return toDef?.beats.find(b => b.id === beatId)?.label ?? beatId
  }

  // Group remappings by current framework beat slot for the left column
  const fromSlots = fromDef?.beats ?? []
  const toSlots   = toDef?.beats   ?? []

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 780,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px 16px',
            borderBottom: '0.5px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              Switching to {toDef?.name}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Here's how your beats will be reassigned. Adjust any amber entries before confirming.
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', lineHeight: 0, flexShrink: 0, padding: 2 }}
          >
            <IconX size={14} />
          </button>
        </div>

        {/* Summary pills */}
        <div
          style={{
            padding: '10px 24px',
            borderBottom: '0.5px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: '0.6rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <IconCheck size={10} />
            {autoMapped} mapped automatically
          </span>
          {needsReview > 0 && (
            <span
              className="font-mono"
              style={{ fontSize: '0.6rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <IconAlertTriangle size={10} />
              {needsReview} need review
            </span>
          )}
          {noSlot > 0 && (
            <span
              className="font-mono"
              style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}
            >
              {noSlot} beat{noSlot !== 1 ? 's' : ''} without slot assignment — kept as-is
            </span>
          )}
        </div>

        {/* Two-column preview */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
          }}
        >
          {/* LEFT: current framework */}
          <div
            style={{
              overflowY: 'auto',
              padding: '16px 20px',
              borderRight: '0.5px solid var(--color-border-subtle)',
            }}
          >
            <p
              className="font-mono"
              style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 12 }}
            >
              CURRENT — {fromDef?.name.toUpperCase()}
            </p>
            {fromSlots.map(slot => {
              const slotRemappings = remappings.filter(r => r.currentFrameworkBeatId === slot.id)
              if (slotRemappings.length === 0) return null
              return (
                <div key={slot.id} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}
                    >
                      {slot.label}
                    </span>
                    {slot.targetPageStart && (
                      <span
                        className="font-mono"
                        style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', opacity: 0.6 }}
                      >
                        p.{slot.targetPageStart}
                        {slot.targetPageEnd !== slot.targetPageStart ? `–${slot.targetPageEnd}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {slotRemappings.map(r => {
                      const beat = sheet?.beats.find(b => b.id === r.userBeatId)
                      return (
                        <div
                          key={r.userBeatId}
                          style={{
                            padding: '5px 10px',
                            background: 'var(--color-surface-raised)',
                            border: `0.5px solid ${r.isAmbiguous ? 'var(--color-warning)' : 'var(--color-border-subtle)'}`,
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            color: 'var(--color-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {beat?.name ?? 'Beat'}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {remappings.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                No beats have been assigned to specific slots yet. All beats will be kept as-is.
              </p>
            )}
          </div>

          {/* Arrow divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              color: 'var(--color-text-tertiary)',
              flexShrink: 0,
            }}
          >
            <IconArrowRight size={16} />
          </div>

          {/* RIGHT: proposed new framework */}
          <div style={{ overflowY: 'auto', padding: '16px 20px' }}>
            <p
              className="font-mono"
              style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)', marginBottom: 12 }}
            >
              AFTER SWITCHING — {toDef?.name.toUpperCase()}
            </p>
            {toSlots.map(slot => {
              const slotRemappings = remappings.filter(r => r.confirmedTargetId === slot.id)
              if (slotRemappings.length === 0) return null
              return (
                <div key={slot.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      className="font-mono"
                      style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}
                    >
                      {slot.label}
                    </span>
                    {slot.targetPageStart && (
                      <span
                        className="font-mono"
                        style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', opacity: 0.6 }}
                      >
                        p.{slot.targetPageStart}
                        {slot.targetPageEnd !== slot.targetPageStart ? `–${slot.targetPageEnd}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {slotRemappings.map(r => {
                      const beat = sheet?.beats.find(b => b.id === r.userBeatId)
                      return (
                        <div key={r.userBeatId}>
                          <div
                            style={{
                              padding: '5px 10px',
                              background: r.isAmbiguous ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
                              border: `0.5px solid ${r.isAmbiguous ? 'var(--color-warning)' : 'var(--color-border-subtle)'}`,
                              borderRadius: r.isAmbiguous ? '6px 6px 0 0' : 6,
                              fontSize: '0.78rem',
                              color: 'var(--color-text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {beat?.name ?? 'Beat'}
                            {r.isAmbiguous && (
                              <span
                                className="font-mono"
                                style={{ marginLeft: 8, fontSize: '0.55rem', color: 'var(--color-warning)' }}
                              >
                                REVIEW
                              </span>
                            )}
                          </div>
                          {r.isAmbiguous && (
                            <select
                              value={r.confirmedTargetId}
                              onChange={e => setConfirmedTarget(r.userBeatId, e.target.value)}
                              style={{
                                width: '100%',
                                background: 'var(--color-surface-raised)',
                                border: '0.5px solid var(--color-warning)',
                                borderTop: 'none',
                                borderRadius: '0 0 6px 6px',
                                padding: '4px 8px',
                                color: 'var(--color-text-secondary)',
                                fontFamily: '"DM Mono", monospace',
                                fontSize: '0.6rem',
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              {r.possibleTargetIds.map(tid => (
                                <option
                                  key={tid}
                                  value={tid}
                                  style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}
                                >
                                  {getTargetBeatLabel(tid)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {remappings.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                Framework will be applied to new beats going forward.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '0.5px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onCancel}
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
            onClick={() => onConfirm(remappings)}
            style={{
              padding: '7px 18px',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--color-background)',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            Switch to {toDef?.name}
            <IconArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
