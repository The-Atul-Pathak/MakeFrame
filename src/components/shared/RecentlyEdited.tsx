import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionLabel from './SectionLabel'
import { fetchRecentSceneActivity } from '@/services/scenes'
import { fetchRecentPanelActivity } from '@/services/panels'
import { relativeTime } from '@/utils/relativeTime'

interface RecentItem {
  id: string
  type: 'scene' | 'panel'
  projectId: string
  projectTitle: string
  label: string
  updatedAt: string
}

const FEED_LIMIT = 4

export default function RecentlyEdited() {
  const navigate = useNavigate()
  const [items, setItems] = useState<RecentItem[] | null>(null)

  useEffect(() => {
    Promise.all([fetchRecentSceneActivity(FEED_LIMIT), fetchRecentPanelActivity(FEED_LIMIT)])
      .then(([scenes, panels]) => {
        const merged: RecentItem[] = [
          ...scenes.map((s) => ({ id: s.id, type: 'scene' as const, projectId: s.projectId, projectTitle: s.projectTitle, label: s.label, updatedAt: s.updatedAt })),
          ...panels.map((p) => ({ id: p.id, type: 'panel' as const, projectId: p.projectId, projectTitle: p.projectTitle, label: p.label, updatedAt: p.updatedAt })),
        ]
        merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setItems(merged.slice(0, FEED_LIMIT))
      })
      .catch(() => setItems([]))
  }, [])

  return (
    <div>
      <SectionLabel>Recently edited</SectionLabel>
      <div style={{ marginTop: 20 }}>
        {items === null && (
          <p className="font-ui" style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', padding: '14px 0' }}>
            Loading…
          </p>
        )}
        {items?.length === 0 && (
          <p className="font-ui" style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', padding: '14px 0' }}>
            No activity yet. Open a project to get started.
          </p>
        )}
        {items?.map((item, i) => (
          <RecentRow
            key={item.id}
            item={item}
            isLast={i === items.length - 1}
            onClick={() => navigate(`/project/${item.projectId}`)}
          />
        ))}
      </div>
    </div>
  )
}

function RecentRow({
  item,
  isLast,
  onClick,
}: {
  item: RecentItem
  isLast: boolean
  onClick: () => void
}) {
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
      onClick={onClick}
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
          {relativeTime(item.updatedAt)}
        </span>
      </div>
    </button>
  )
}
