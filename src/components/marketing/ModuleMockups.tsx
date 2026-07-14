/**
 * Stylized CSS miniatures of the four modules, used on the landing page.
 * Decorative stand-ins until real product screenshots are captured —
 * swap freely; each mockup is self-contained and aria-hidden.
 */

const chipClass =
  'rounded-sm border border-border bg-surface-raised px-2 py-1 font-mono text-[0.55rem] text-text-secondary'

export function BeatSheetMock() {
  return (
    <div aria-hidden="true" className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-text-tertiary">
          Save the Cat &middot; 15 beats
        </span>
        <span className="rounded-sm bg-accent-muted px-2 py-[2px] font-mono text-[0.52rem] uppercase tracking-[0.1em] text-accent">
          On track
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { act: 'Act I', beats: ['Opening Image', 'Catalyst', 'Debate'] },
          { act: 'Act II', beats: ['B Story', 'Midpoint', 'All Is Lost'] },
          { act: 'Act III', beats: ['Finale', 'Final Image'] },
        ].map(({ act, beats }, i) => (
          <div key={act} className="flex flex-col gap-2">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-text-tertiary">
              {act}
            </span>
            {beats.map((b, j) => (
              <span
                key={b}
                className={
                  i === 1 && j === 1
                    ? `${chipClass} border-accent text-text-primary`
                    : chipClass
                }
              >
                {b}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScreenplayMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-sm bg-canvas-bg px-6 py-5 font-screenplay text-[0.62rem] leading-[1.9] text-canvas-text"
      style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
    >
      <p className="font-bold">12 INT. DARKROOM &mdash; NIGHT</p>
      <p className="mt-2">
        Photographs hang from a wire like evidence. MAYA, 30s, studies one under red light.
      </p>
      <p className="mt-2 text-center">MAYA</p>
      <p className="text-center">(not looking up)</p>
      <p className="mx-auto w-[70%]">We shoot it at dawn. Before the light gets honest.</p>
      <p className="mt-2">She pins the photo to the wall. It is a frame from Scene 14.</p>
    </div>
  )
}

function PanelArt({ variant }: { variant: 'wide' | 'two-shot' | 'closeup' }) {
  return (
    <svg viewBox="0 0 64 36" className="h-full w-full text-text-tertiary" fill="none">
      {variant === 'wide' && (
        <>
          <line x1="0" y1="26" x2="64" y2="26" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="10" r="5" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="26" x2="14" y2="18" stroke="currentColor" strokeWidth="1" />
          <line x1="18" y1="26" x2="14" y2="18" stroke="currentColor" strokeWidth="1" />
        </>
      )}
      {variant === 'two-shot' && (
        <>
          <circle cx="24" cy="14" r="5" stroke="currentColor" strokeWidth="1" />
          <line x1="24" y1="19" x2="24" y2="32" stroke="currentColor" strokeWidth="1" />
          <circle cx="42" cy="16" r="5" stroke="currentColor" strokeWidth="1" />
          <line x1="42" y1="21" x2="42" y2="32" stroke="currentColor" strokeWidth="1" />
        </>
      )}
      {variant === 'closeup' && (
        <>
          <circle cx="32" cy="20" r="11" stroke="currentColor" strokeWidth="1" />
          <line x1="27" y1="18" x2="29" y2="18" stroke="currentColor" strokeWidth="1.4" />
          <line x1="35" y1="18" x2="37" y2="18" stroke="currentColor" strokeWidth="1.4" />
        </>
      )}
    </svg>
  )
}

export function StoryboardMock() {
  const panels = [
    { id: '12A', label: 'WIDE', variant: 'wide' as const },
    { id: '12B', label: 'TWO-SHOT', variant: 'two-shot' as const },
    { id: '12C', label: 'CU', variant: 'closeup' as const },
  ]
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-3">
      {panels.map(({ id, label, variant }) => (
        <div key={id} className="flex flex-col gap-2">
          <div className="aspect-video overflow-hidden rounded-sm border border-border bg-surface-raised p-2">
            <PanelArt variant={variant} />
          </div>
          <span className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-text-tertiary">
            {id} &middot; {label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ShotListMock() {
  const rows = [
    { shot: '12A', size: 'WIDE', move: 'STATIC', lens: '24mm', review: false, active: false },
    { shot: '12B', size: 'MED', move: 'DOLLY', lens: '35mm', review: false, active: true },
    { shot: '12C', size: 'CU', move: 'STATIC', lens: '50mm', review: true, active: false },
  ]
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1.4fr] gap-2 border-b border-border-subtle px-4 py-2 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-text-tertiary">
        <span>Shot</span>
        <span>Size</span>
        <span>Move</span>
        <span>Lens</span>
        <span />
      </div>
      {rows.map(({ shot, size, move, lens, review, active }) => (
        <div
          key={shot}
          className={`grid grid-cols-[1fr_1fr_1fr_1fr_1.4fr] items-center gap-2 border-b border-border-subtle px-4 py-2 font-mono text-[0.58rem] text-text-secondary last:border-b-0 ${
            active ? 'list-item-active bg-surface-raised' : ''
          }`}
        >
          <span className="text-text-primary">{shot}</span>
          <span>{size}</span>
          <span>{move}</span>
          <span>{lens}</span>
          <span className="justify-self-end">
            {review && (
              <span className="rounded-sm px-2 py-[2px] text-[0.5rem] uppercase tracking-[0.1em] text-warning" style={{ background: 'var(--color-accent-muted)' }}>
                Needs review
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
