import { useState } from 'react'
import SectionLabel from './SectionLabel'

interface RecentItem {
  type: 'scene' | 'panel'
  label: string
  projectTitle: string
  relativeTime: string
}

const RECENT_ITEMS: RecentItem[] = [
  { type: 'scene', label: 'INT. WAREHOUSE — NIGHT',  projectTitle: 'The Long Way Home', relativeTime: '2 days ago' },
  { type: 'scene', label: 'EXT. ROOFTOP — DAY',      projectTitle: 'Neon Requiem',       relativeTime: '4 days ago' },
  { type: 'scene', label: 'INT. KITCHEN — DAWN',     projectTitle: 'The Long Way Home', relativeTime: '1 week ago' },
  { type: 'panel', label: 'Panel 03 — WS',           projectTitle: 'Neon Requiem',       relativeTime: '1 week ago' },
]

export default function RecentlyEdited() {
  return (
    <div>
      <SectionLabel>Recently edited</SectionLabel>
      <div style={{ marginTop: 20 }}>
        {RECENT_ITEMS.map((item, i) => (
          <RecentRow key={i} item={item} isLast={i === RECENT_ITEMS.length - 1} />
        ))}
      </div>
    </div>
  )
}

function RecentRow({ item, isLast }: { item: RecentItem; isLast: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      className="w-full text-left flex flex-col gap-0.5 transition-colors duration-150"
      style={{
        padding: '14px 0',
        borderBottom: isLast ? 'none' : '0.5px solid var(--color-border-subtle)',
        background: hovered ? 'var(--color-surface)' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => console.log('open recent', item.label)}
    >
      <span
        className="font-mono"
        style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}
      >
        {item.type}
      </span>
      <span
        className="font-ui"
        style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', lineHeight: 1.3 }}
      >
        {item.label}
      </span>
      <div className="flex items-center justify-between" style={{ marginTop: 3 }}>
        <span className="font-ui" style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          {item.projectTitle}
        </span>
        <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}>
          {item.relativeTime}
        </span>
      </div>
    </button>
  )
}
