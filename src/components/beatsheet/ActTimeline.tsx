import type { BeatSheet } from '@/types/beatsheet'
import { FRAMEWORKS } from '@/utils/beatSheetFrameworks'

interface Props {
  sheet: BeatSheet
  onActClick?: (actKey: string) => void
  activeActKey?: string | null
}

const ACT_OPACITIES = ['1', '0.75', '0.55', '0.35']

export default function ActTimeline({ sheet, onActClick, activeActKey }: Props) {
  const framework = FRAMEWORKS[sheet.framework]
  if (!framework) return null

  const { acts } = framework
  const totalRange = sheet.totalPages

  return (
    <div style={{ width: '100%' }}>
      {/* Bar */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          gap: 2,
        }}
      >
        {acts.map((act, i) => {
          const width = ((act.pageRange[1] - act.pageRange[0]) / totalRange) * 100
          const isActive = activeActKey === act.key
          return (
            <button
              key={act.key}
              onClick={() => onActClick?.(act.key)}
              title={`${act.label} · p.${act.pageRange[0]}–${act.pageRange[1]}`}
              style={{
                width: `${width}%`,
                height: '100%',
                background: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                opacity: isActive ? 1 : Number(ACT_OPACITIES[i] ?? 0.4),
                border: 'none',
                cursor: 'pointer',
                transition: 'background 200ms, opacity 200ms',
                padding: 0,
                borderRadius: 0,
              }}
            />
          )
        })}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', width: '100%', marginTop: 6, gap: 2 }}>
        {acts.map((act) => {
          const width = ((act.pageRange[1] - act.pageRange[0]) / totalRange) * 100
          const isActive = activeActKey === act.key
          const beatCount = sheet.beats.filter(b => b.actKey === act.key).length
          return (
            <div
              key={act.key}
              style={{
                width: `${width}%`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color 200ms',
                }}
              >
                {act.label.toUpperCase()}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.55rem',
                  color: 'var(--color-text-tertiary)',
                  opacity: 0.6,
                }}
              >
                p.{act.pageRange[0]}–{act.pageRange[1]}&nbsp;·&nbsp;{beatCount}b
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
