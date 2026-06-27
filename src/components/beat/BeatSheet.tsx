import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconPlus,
  IconAlertTriangle,
  IconInfoCircle,
  IconWand,
  IconLayoutList,
} from '@tabler/icons-react'
import type { Project } from '@/types/project'
import type { Beat, BeatFramework } from '@/types/beatsheet'
import type { BeatRemapping } from '@/types/framework'
import { useBeatSheetStore } from '@/store/beatSheetSlice'
import { FRAMEWORKS } from '@/utils/beatSheetFrameworks'
import { FRAMEWORK_DEFS } from '@/data/frameworks'
import { validateBeatSheet } from '@/utils/beatSheetValidation'
import { autoAssignToFrameworkBeat } from '@/utils/beatAutoAssign'
import BeatCard from '@/components/beatsheet/BeatCard'
import ActTimeline from '@/components/beatsheet/ActTimeline'
import ValidationPanel from '@/components/beatsheet/ValidationPanel'
import FrameworkSwitchModal from '@/components/beat/FrameworkSwitchModal'

// ── Framework selector ────────────────────────────────────────────────────────

const FRAMEWORK_ORDER: BeatFramework[] = [
  'save_the_cat',
  'three_act',
  'hero_journey',
  'story_circle',
  'seven_point',
]

const FRAMEWORK_SHORT: Record<BeatFramework, string> = {
  save_the_cat:  'Save the Cat',
  three_act:     '3-Act',
  hero_journey:  "Hero's Journey",
  story_circle:  'Story Circle',
  seven_point:   '7-Point',
}

function FrameworkSelectorBar({
  value,
  onChange,
}: {
  value: BeatFramework
  onChange: (fw: BeatFramework) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {FRAMEWORK_ORDER.map(fw => {
        const isActive = fw === value
        return (
          <button
            key={fw}
            onClick={() => onChange(fw)}
            style={{
              padding: '5px 12px',
              background: isActive ? 'var(--color-accent)' : 'transparent',
              border: `0.5px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 6,
              cursor: 'pointer',
              color: isActive ? 'var(--color-background)' : 'var(--color-text-secondary)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.75rem',
              fontWeight: isActive ? 500 : 400,
              transition: 'all 150ms',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
              }
            }}
          >
            {FRAMEWORK_SHORT[fw]}
          </button>
        )
      })}
    </div>
  )
}

// ── Health dot ────────────────────────────────────────────────────────────────

type HealthStatus = 'green' | 'amber' | 'red'

function computeSlotHealth(
  slotId: string,
  beats: Beat[],
  targetStart?: number,
  targetEnd?: number
): HealthStatus {
  const assigned = beats.filter(b => b.frameworkBeatId === slotId)
  if (assigned.length === 0) return 'red'
  if (targetStart === undefined) return 'green'
  const inRange = assigned.some(
    b => b.pageStart >= (targetStart - 5) && b.pageStart <= ((targetEnd ?? targetStart) + 5)
  )
  return inRange ? 'green' : 'amber'
}

function HealthDot({ status, title }: { status: HealthStatus; title: string }) {
  const color =
    status === 'green' ? 'var(--color-success)'
    : status === 'amber' ? 'var(--color-warning)'
    : 'var(--color-danger)'
  return (
    <span
      title={title}
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  )
}

// ── Beat description popup ────────────────────────────────────────────────────

function BeatInfoPopup({ description, example }: { description: string; example: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-tertiary)',
          lineHeight: 0,
          padding: 0,
        }}
        title="What is this beat?"
      >
        <IconInfoCircle size={12} />
      </button>
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 50,
              width: 280,
              background: 'var(--color-surface-raised)',
              border: '0.5px solid var(--color-border)',
              borderRadius: 10,
              padding: '12px 14px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
              {description}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5, fontStyle: 'italic' }}>
              {example}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ── Slot reassignment select ──────────────────────────────────────────────────

function SlotSelect({
  value,
  framework,
  onAssign,
}: {
  value: string | undefined
  framework: BeatFramework
  onAssign: (frameworkBeatId: string) => void
}) {
  const def = FRAMEWORK_DEFS[framework]
  return (
    <select
      value={value ?? ''}
      onChange={e => onAssign(e.target.value)}
      title="Move to a different beat slot"
      style={{
        background: 'var(--color-surface-raised)',
        border: '0.5px solid var(--color-border-subtle)',
        borderRadius: 4,
        padding: '2px 5px',
        color: 'var(--color-text-tertiary)',
        fontFamily: '"DM Mono", monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        maxWidth: 130,
      }}
    >
      <option value="">move to slot…</option>
      {def?.beats.map(b => (
        <option
          key={b.id}
          value={b.id}
          style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}
        >
          {b.label}
        </option>
      ))}
    </select>
  )
}

// ── Beat slot wrapper ─────────────────────────────────────────────────────────

function BeatSlotWrapper({
  beat,
  framework,
  totalPages,
  hint,
  onChange,
  onDelete,
  onAssign,
}: {
  beat: Beat
  framework: BeatFramework
  totalPages: number
  hint: string
  onChange: (patch: Partial<Beat>) => void
  onDelete: () => void
  onAssign: (frameworkBeatId: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      {/* NeedsReview badge */}
      {beat.needsReview && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: 10,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 7px',
            background: 'var(--color-warning)',
            borderRadius: 3,
          }}
        >
          <IconAlertTriangle size={8} style={{ color: 'var(--color-background)' }} />
          <span className="font-mono" style={{ fontSize: '0.5rem', color: 'var(--color-background)', letterSpacing: '0.06em' }}>
            REVIEW SLOT
          </span>
        </div>
      )}

      <BeatCard
        beat={beat}
        totalPages={totalPages}
        framework={framework}
        hint={hint}
        onChange={onChange}
        onDelete={onDelete}
      />

      {/* Slot reassign bar — shown on hover */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'var(--color-surface-raised)',
            borderTop: '0.5px solid var(--color-border-subtle)',
            borderRadius: '0 0 10px 10px',
            zIndex: 3,
          }}
        >
          <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)' }}>
            slot:
          </span>
          <SlotSelect
            value={beat.frameworkBeatId}
            framework={framework}
            onAssign={onAssign}
          />
        </div>
      )}
    </div>
  )
}

// ── Timeline view (Save the Cat, Hero's Journey) ──────────────────────────────

function TimelineView({
  framework,
  beats,
  totalPages,
  onUpdateBeat,
  onDeleteBeat,
  onAddBeat,
  onAssignBeat,
}: {
  framework: BeatFramework
  beats: Beat[]
  totalPages: number
  onUpdateBeat: (id: string, patch: Partial<Beat>) => void
  onDeleteBeat: (id: string) => void
  onAddBeat: (frameworkBeatId: string) => void
  onAssignBeat: (beatId: string, frameworkBeatId: string) => void
}) {
  const def = FRAMEWORK_DEFS[framework]
  if (!def) return null

  const hintMap: Record<string, string> = Object.fromEntries(
    (FRAMEWORKS[framework]?.defaultBeats ?? []).map(t => [t.name, t.hint])
  )

  // Group beats by act
  const actGroups: Record<string, typeof def.beats> = { I: [], II: [], III: [] }
  for (const beat of def.beats) {
    actGroups[beat.actGroup].push(beat)
  }

  const ACT_LABELS: Record<string, string> = {
    I:   'Act I',
    II:  'Act II',
    III: 'Act III',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {(['I', 'II', 'III'] as const).map(group => {
        const groupBeats = actGroups[group]
        if (groupBeats.length === 0) return null
        const healthCount = groupBeats.reduce((acc, gb) => {
          return acc + (beats.some(b => b.frameworkBeatId === gb.id) ? 1 : 0)
        }, 0)

        return (
          <div key={group} style={{ marginBottom: 32 }}>
            {/* Act header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
                paddingBottom: 10,
                borderBottom: '0.5px solid var(--color-border-subtle)',
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}
              >
                {ACT_LABELS[group].toUpperCase()}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', opacity: 0.5 }}
              >
                {healthCount}/{groupBeats.length} slots filled
              </span>
              <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-subtle)' }} />
            </div>

            {/* Beat slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {groupBeats.map((slot) => {
                const slotBeats = beats.filter(b => b.frameworkBeatId === slot.id)
                const health = computeSlotHealth(slot.id, beats, slot.targetPageStart, slot.targetPageEnd)
                const healthTitle =
                  health === 'green' ? 'Beat is filled and on target'
                  : health === 'amber' ? 'Beat filled but page position may be off target'
                  : 'No beats assigned to this slot'
                return (
                  <div key={slot.id} style={{ display: 'flex', gap: 16 }}>
                    {/* Left rail: slot metadata */}
                    <div
                      style={{
                        width: 200,
                        flexShrink: 0,
                        paddingTop: 4,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '0.55rem',
                            color: 'var(--color-background)',
                            background: 'var(--color-accent)',
                            padding: '1px 5px',
                            borderRadius: 3,
                            flexShrink: 0,
                          }}
                        >
                          {String(
                            def.beats.indexOf(slot) + 1
                          ).padStart(2, '0')}
                        </span>
                        <HealthDot status={health} title={healthTitle} />
                        <BeatInfoPopup description={slot.description} example={slot.example} />
                      </div>

                      <p
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          color: slotBeats.length > 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          marginBottom: 3,
                          lineHeight: 1.3,
                        }}
                      >
                        {slot.label}
                      </p>

                      {slot.targetPageStart !== undefined && (
                        <span
                          className="font-mono"
                          style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}
                        >
                          p.{slot.targetPageStart}
                          {slot.targetPageEnd !== slot.targetPageStart
                            ? `–${slot.targetPageEnd}`
                            : ''}
                        </span>
                      )}
                    </div>

                    {/* Right: beats in this slot */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {slotBeats.map(beat => {
                        const pageOutOfRange =
                          slot.targetPageStart !== undefined &&
                          (beat.pageStart < (slot.targetPageStart - 5) ||
                           beat.pageStart > ((slot.targetPageEnd ?? slot.targetPageStart) + 5))
                        return (
                          <div key={beat.id} style={{ position: 'relative' }}>
                            {pageOutOfRange && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: -8,
                                  right: 10,
                                  zIndex: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 7px',
                                  background: 'var(--color-surface-raised)',
                                  border: '0.5px solid var(--color-warning)',
                                  borderRadius: 3,
                                }}
                              >
                                <IconAlertTriangle size={8} style={{ color: 'var(--color-warning)' }} />
                                <span
                                  className="font-mono"
                                  style={{ fontSize: '0.5rem', color: 'var(--color-warning)', letterSpacing: '0.04em' }}
                                >
                                  p.{beat.pageStart} (target p.{slot.targetPageStart}
                                  {slot.targetPageEnd !== slot.targetPageStart ? `–${slot.targetPageEnd}` : ''})
                                </span>
                              </div>
                            )}
                            <BeatSlotWrapper
                              beat={beat}
                              framework={framework}
                              totalPages={totalPages}
                              hint={hintMap[beat.name] ?? slot.description}
                              onChange={patch => onUpdateBeat(beat.id, patch)}
                              onDelete={() => onDeleteBeat(beat.id)}
                              onAssign={fwBeatId => onAssignBeat(beat.id, fwBeatId)}
                            />
                          </div>
                        )
                      })}

                      {/* Add beat to this slot */}
                      <button
                        onClick={() => onAddBeat(slot.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '8px',
                          background: 'transparent',
                          border: '0.5px dashed var(--color-border)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: 'var(--color-text-tertiary)',
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'
                        }}
                      >
                        <IconPlus size={11} />
                        <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.06em' }}>
                          ADD BEAT
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Columns view (3-Act) ──────────────────────────────────────────────────────

function ColumnsView({
  framework,
  beats,
  totalPages,
  onUpdateBeat,
  onDeleteBeat,
  onAddBeat,
  onAssignBeat,
}: {
  framework: BeatFramework
  beats: Beat[]
  totalPages: number
  onUpdateBeat: (id: string, patch: Partial<Beat>) => void
  onDeleteBeat: (id: string) => void
  onAddBeat: (frameworkBeatId: string) => void
  onAssignBeat: (beatId: string, frameworkBeatId: string) => void
}) {
  const def = FRAMEWORK_DEFS[framework]
  if (!def) return null

  const hintMap: Record<string, string> = Object.fromEntries(
    (FRAMEWORKS[framework]?.defaultBeats ?? []).map(t => [t.name, t.hint])
  )

  const ACT_COLORS: Record<string, string> = {
    I:   'var(--color-success)',
    II:  'var(--color-warning)',
    III: 'var(--color-accent)',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
      {def.beats.map(slot => {
        const slotBeats = beats.filter(b => b.frameworkBeatId === slot.id)
        const health = computeSlotHealth(slot.id, beats)

        return (
          <div
            key={slot.id}
            style={{
              background: 'var(--color-surface)',
              border: '0.5px solid var(--color-border-subtle)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: '14px 16px 12px',
                borderBottom: '0.5px solid var(--color-border-subtle)',
                borderTop: `2px solid ${ACT_COLORS[slot.actGroup]}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <HealthDot
                  status={health}
                  title={health === 'red' ? 'No beats in this act' : 'Beats assigned'}
                />
                <span
                  style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-text-primary)' }}
                >
                  {slot.label}
                </span>
                <div style={{ flex: 1 }} />
                <BeatInfoPopup description={slot.description} example={slot.example} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}>
                  {slotBeats.length} beat{slotBeats.length !== 1 ? 's' : ''}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', opacity: 0.5 }}
                >
                  ~{Math.round((slot.actGroup === 'I' ? 25 : slot.actGroup === 'II' ? 57 : 18))}% of runtime
                </span>
              </div>
            </div>

            {/* Beats */}
            <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {slotBeats.map(beat => (
                <BeatSlotWrapper
                  key={beat.id}
                  beat={beat}
                  framework={framework}
                  totalPages={totalPages}
                  hint={hintMap[beat.name] ?? slot.description}
                  onChange={patch => onUpdateBeat(beat.id, patch)}
                  onDelete={() => onDeleteBeat(beat.id)}
                  onAssign={fwBeatId => onAssignBeat(beat.id, fwBeatId)}
                />
              ))}

              {/* Add beat */}
              <button
                onClick={() => onAddBeat(slot.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '10px',
                  background: 'transparent',
                  border: '0.5px dashed var(--color-border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${ACT_COLORS[slot.actGroup]}`
                  ;(e.currentTarget as HTMLElement).style.color = `${ACT_COLORS[slot.actGroup]}`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'
                }}
              >
                <IconPlus size={11} />
                <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.06em' }}>
                  ADD BEAT
                </span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Coming soon stub ──────────────────────────────────────────────────────────

function ComingSoonView({ frameworkName }: { frameworkName: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '80px 0',
        opacity: 0.5,
      }}
    >
      <IconLayoutList size={32} style={{ color: 'var(--color-text-tertiary)' }} />
      <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
        {frameworkName} view coming soon
      </span>
      <span
        className="font-mono"
        style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}
      >
        The circular / diamond visual for this framework is in progress.
        <br />
        Your beats are saved and will be available when it launches.
      </span>
    </div>
  )
}

// ── Unassigned beats ──────────────────────────────────────────────────────────

function UnassignedSection({
  beats,
  framework,
  totalPages,
  onUpdateBeat,
  onDeleteBeat,
  onAssignBeat,
  onAutoAssignAll,
}: {
  beats: Beat[]
  framework: BeatFramework
  totalPages: number
  onUpdateBeat: (id: string, patch: Partial<Beat>) => void
  onDeleteBeat: (id: string) => void
  onAssignBeat: (beatId: string, frameworkBeatId: string) => void
  onAutoAssignAll: () => void
}) {
  if (beats.length === 0) return null
  return (
    <div style={{ marginTop: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: '0.5px solid var(--color-border-subtle)',
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}
        >
          UNASSIGNED BEATS
        </span>
        <span
          className="font-mono"
          style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', opacity: 0.5 }}
        >
          {beats.length} beat{beats.length !== 1 ? 's' : ''} not yet placed in a framework slot
        </span>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-subtle)' }} />
        <button
          onClick={onAutoAssignAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            background: 'transparent',
            border: '0.5px solid var(--color-border)',
            borderRadius: 5,
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
          }}
          title="Auto-assign all unassigned beats to slots based on page number"
        >
          <IconWand size={11} />
          <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.06em' }}>
            AUTO-ASSIGN
          </span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {beats.map(beat => (
          <BeatSlotWrapper
            key={beat.id}
            beat={beat}
            framework={framework}
            totalPages={totalPages}
            hint=""
            onChange={patch => onUpdateBeat(beat.id, patch)}
            onDelete={() => onDeleteBeat(beat.id)}
            onAssign={fwBeatId => onAssignBeat(beat.id, fwBeatId)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main BeatSheet component ──────────────────────────────────────────────────

interface Props {
  project: Project
}

const DEFAULT_PAGES = 110

export default function BeatSheet({ project }: Props) {
  const {
    beatSheets,
    createBeatSheet,
    switchFramework,
    confirmFrameworkSwitch,
    updateBeat,
    updateBeatSheet,
    addBeat,
    deleteBeat,
    assignBeatToSlot,
  } = useBeatSheetStore()

  const sheet = beatSheets[project.id] ?? null

  const [showValidation, setShowValidation]     = useState(false)
  const [pendingFramework, setPendingFramework] = useState<BeatFramework | null>(null)
  const [showSwitchModal, setShowSwitchModal]   = useState(false)
  const beatRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!sheet) {
      createBeatSheet(project.id, 'save_the_cat', DEFAULT_PAGES, project.genres?.[0] ?? null)
    }
  }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const issues = useMemo(() => (sheet ? validateBeatSheet(sheet) : []), [sheet])

  const handleFrameworkChange = (fw: BeatFramework) => {
    if (!sheet || fw === sheet.framework) return
    // If any beats have frameworkBeatId assignments, show the preview modal
    const hasAssigned = sheet.beats.some(b => b.frameworkBeatId)
    if (hasAssigned) {
      setPendingFramework(fw)
      setShowSwitchModal(true)
    } else {
      switchFramework(project.id, fw)
    }
  }

  const handleSwitchConfirm = (remappings: BeatRemapping[]) => {
    if (!pendingFramework) return
    confirmFrameworkSwitch(project.id, pendingFramework, remappings)
    setShowSwitchModal(false)
    setPendingFramework(null)
  }

  const handleSwitchCancel = () => {
    setShowSwitchModal(false)
    setPendingFramework(null)
  }

  const handleBeatFocus = (beatId: string) => {
    const el = beatRefs.current[beatId]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleAddToSlot = (frameworkBeatId: string) => {
    if (!sheet) return
    const fwDef = FRAMEWORK_DEFS[sheet.framework]
    const slot = fwDef?.beats.find(b => b.id === frameworkBeatId)
    const actKey = FRAMEWORKS[sheet.framework]?.acts.find(a =>
      // Map actGroup to actKey using the legacy framework
      (slot?.actGroup === 'I' && a.pageRange[0] <= 30) ||
      (slot?.actGroup === 'II' && a.pageRange[0] >= 25 && a.pageRange[1] <= 90) ||
      (slot?.actGroup === 'III' && a.pageRange[1] >= 85)
    )?.key ?? FRAMEWORKS[sheet.framework]?.acts[0]?.key
    addBeat(project.id, actKey, frameworkBeatId)
  }

  const handleAutoAssignAll = () => {
    if (!sheet) return
    const fwDef = FRAMEWORK_DEFS[sheet.framework]
    if (!fwDef) return
    const unassigned = sheet.beats.filter(b => !b.frameworkBeatId)
    for (const beat of unassigned) {
      const slotId = autoAssignToFrameworkBeat(beat.pageStart, sheet.totalPages, fwDef)
      if (slotId) assignBeatToSlot(project.id, beat.id, slotId)
    }
  }

  if (!sheet) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
          Initialising beat sheet…
        </span>
      </div>
    )
  }

  const sortedBeats   = [...sheet.beats].sort((a, b) => a.order - b.order)
  const fw            = sheet.framework
  const fwDef         = FRAMEWORK_DEFS[fw]
  const filledSlots   = fwDef?.beats.filter(slot =>
    sortedBeats.some(b => b.frameworkBeatId === slot.id)
  ).length ?? 0
  const totalSlots    = fwDef?.totalBeats ?? 0
  const coveragePct   = sortedBeats.length > 0
    ? Math.round((sortedBeats.filter(b => b.description.trim()).length / sortedBeats.length) * 100)
    : 0
  const unassigned    = sortedBeats.filter(b => !b.frameworkBeatId)
  const visualShape   = fwDef?.visualShape

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div
        style={{
          borderBottom: '0.5px solid var(--color-border-subtle)',
          padding: '14px 28px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Top row: title + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-primary)', flexShrink: 0 }}>
            Beat Sheet
          </h1>

          <div style={{ flex: 1 }} />

          {/* Stats */}
          <span
            className="font-mono"
            style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
          >
            {filledSlots}/{totalSlots} slots&nbsp;&nbsp;·&nbsp;&nbsp;
            <input
              type="number"
              min={1}
              max={999}
              value={sheet.totalPages}
              onChange={e => updateBeatSheet(project.id, { totalPages: Number(e.target.value) })}
              title="Total screenplay pages"
              style={{
                width: 36,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-tertiary)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.65rem',
                textAlign: 'center',
                cursor: 'text',
              }}
            />
            p&nbsp;&nbsp;·&nbsp;&nbsp;
            <span style={{ color: coveragePct === 100 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
              {coveragePct}% written
            </span>
          </span>

          {/* Validation toggle */}
          <button
            onClick={() => setShowValidation(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              background: showValidation ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
              border: `0.5px solid ${showValidation ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
              borderRadius: 6,
              cursor: 'pointer',
              color: issues.length > 0
                ? (issues.some(i => i.severity === 'error') ? 'var(--color-danger)' : 'var(--color-warning)')
                : 'var(--color-text-tertiary)',
              transition: 'background 150ms, border-color 150ms',
            }}
          >
            <IconAlertTriangle size={11} />
            <span className="font-mono" style={{ fontSize: '0.6rem' }}>
              {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </span>
          </button>

          {/* Add beat */}
          <button
            onClick={() => addBeat(project.id)}
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
            <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>
              ADD BEAT
            </span>
          </button>
        </div>

        {/* Framework selector row */}
        <FrameworkSelectorBar value={fw} onChange={handleFrameworkChange} />

        {/* Act timeline bar */}
        <ActTimeline sheet={sheet} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 0 }}>
        {/* Primary area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>

          {/* Empty state */}
          {sortedBeats.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '80px 0',
                opacity: 0.5,
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>◻</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>No beats yet</span>
              <span
                className="font-mono"
                style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}
              >
                Hit{' '}
                <strong style={{ color: 'var(--color-accent)' }}>+ ADD BEAT</strong>
                {' '}or use the slot buttons below each framework beat to build your structure.
              </span>
            </div>
          )}

          {/* Framework view */}
          {visualShape === 'timeline' && (
            <TimelineView
              framework={fw}
              beats={sortedBeats.filter(b => b.frameworkBeatId)}
              totalPages={sheet.totalPages}
              onUpdateBeat={(id, patch) => updateBeat(project.id, id, patch)}
              onDeleteBeat={id => deleteBeat(project.id, id)}
              onAddBeat={handleAddToSlot}
              onAssignBeat={(beatId, fwBeatId) => assignBeatToSlot(project.id, beatId, fwBeatId)}
            />
          )}

          {visualShape === 'columns' && (
            <ColumnsView
              framework={fw}
              beats={sortedBeats.filter(b => b.frameworkBeatId)}
              totalPages={sheet.totalPages}
              onUpdateBeat={(id, patch) => updateBeat(project.id, id, patch)}
              onDeleteBeat={id => deleteBeat(project.id, id)}
              onAddBeat={handleAddToSlot}
              onAssignBeat={(beatId, fwBeatId) => assignBeatToSlot(project.id, beatId, fwBeatId)}
            />
          )}

          {(visualShape === 'circle' || visualShape === 'diamond') && (
            <ComingSoonView frameworkName={fwDef?.name ?? ''} />
          )}

          {/* Unassigned beats */}
          <UnassignedSection
            beats={unassigned}
            framework={fw}
            totalPages={sheet.totalPages}
            onUpdateBeat={(id, patch) => updateBeat(project.id, id, patch)}
            onDeleteBeat={id => deleteBeat(project.id, id)}
            onAssignBeat={(beatId, fwBeatId) => assignBeatToSlot(project.id, beatId, fwBeatId)}
            onAutoAssignAll={handleAutoAssignAll}
          />
        </div>

        {/* Validation panel */}
        {showValidation && (
          <div
            style={{
              padding: '28px 20px 28px 0',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ValidationPanel
              issues={issues}
              onClose={() => setShowValidation(false)}
              onBeatFocus={handleBeatFocus}
            />
          </div>
        )}
      </div>

      {/* Framework switch modal */}
      {showSwitchModal && pendingFramework && (
        <FrameworkSwitchModal
          projectId={project.id}
          fromFramework={sheet.framework}
          toFramework={pendingFramework}
          onConfirm={handleSwitchConfirm}
          onCancel={handleSwitchCancel}
        />
      )}
    </div>
  )
}
