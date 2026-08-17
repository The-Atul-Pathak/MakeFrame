import { IconAlertTriangle, IconAlertCircle, IconX } from '@tabler/icons-react'
import type { BeatValidationIssue } from '@/types/beatsheet'

interface Props {
  issues: BeatValidationIssue[]
  onClose: () => void
  onBeatFocus?: (beatId: string) => void
}

export default function ValidationPanel({ issues, onClose, onBeatFocus }: Props) {
  const errors   = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  return (
    <div
      style={{
        width: 288,
        flexShrink: 0,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.1em', color: 'var(--color-text-secondary)' }}
        >
          VALIDATION
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', lineHeight: 0 }}
        >
          <IconX size={12} />
        </button>
      </div>

      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '8px 14px',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: errors.length > 0 ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
          {errors.length} error{errors.length !== 1 ? 's' : ''}
        </span>
        <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: warnings.length > 0 ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }}>
          {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Issue list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {issues.length === 0 ? (
          <div style={{ padding: '24px 14px', textAlign: 'center' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)' }}>
              No issues found
            </span>
          </div>
        ) : (
          [...errors, ...warnings].map(issue => (
            <button
              key={issue.id}
              onClick={() => issue.beatId && onBeatFocus?.(issue.beatId)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                cursor: issue.beatId ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { if (issue.beatId) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-raised)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ flexShrink: 0, marginTop: 2, color: issue.severity === 'error' ? 'var(--color-danger)' : 'var(--color-warning)', lineHeight: 0 }}>
                {issue.severity === 'error'
                  ? <IconAlertCircle size={12} />
                  : <IconAlertTriangle size={12} />
                }
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {issue.message}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
