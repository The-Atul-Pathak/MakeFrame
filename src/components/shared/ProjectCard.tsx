import { useState } from 'react'
import { IconPencil } from '@tabler/icons-react'
import type { Project } from '@/types/project'

interface Props {
  project: Project
  onEdit: () => void
  onOpen: () => void
}

export default function ProjectCard({ project, onEdit, onOpen }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', width: 248, height: 184 }}
    >
      <button
        onClick={onOpen}
        className="flex flex-col overflow-hidden text-left"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 10,
          background: hovered ? 'var(--color-surface-raised)' : 'var(--color-surface)',
          border: `1px solid ${hovered ? 'var(--color-border-accent)' : 'transparent'}`,
          boxShadow: 'var(--shadow-card)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform 200ms ease, background 200ms ease, border-color 200ms ease',
        }}
      >
        {/* Thumbnail */}
        <div
          className="shrink-0 w-full relative overflow-hidden"
          style={{
            /* Scaled with the card (165->184) so the info strip below keeps
               enough room for the now-larger title and metadata. */
            height: 112,
            background: project.thumbnailUrl ? undefined : 'var(--color-surface-raised)',
            backgroundImage: project.thumbnailUrl ? `url(${project.thumbnailUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!project.thumbnailUrl && [
            'top-2 left-2 border-t border-l',
            'top-2 right-2 border-t border-r',
            'bottom-2 left-2 border-b border-l',
            'bottom-2 right-2 border-b border-r',
          ].map((pos, i) => (
            <span
              key={i}
              className={`absolute ${pos}`}
              style={{ width: 8, height: 8, borderColor: 'var(--color-border)', opacity: 0.5 }}
            />
          ))}

          {project.thumbnailUrl && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: hovered ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.15)',
                transition: 'background 200ms',
              }}
            />
          )}
        </div>

        {/* Info strip */}
        <div className="flex flex-col justify-center flex-1 gap-px overflow-hidden" style={{ padding: '0 16px' }}>
          {/* The card's primary identifier, so it gets the body size rather
              than a caption size. Truncated: a long title would otherwise wrap
              to two lines and push the metadata out of the strip. */}
          <span
            className="font-ui leading-tight"
            title={project.title}
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.title}
          </span>
          <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
            {project.format ?? 'Untitled'}&nbsp;&nbsp;·&nbsp;&nbsp;Draft {project.draftNumber}
          </span>
        </div>
      </button>

      {/* Edit pencil — shown on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit() }}
        title="Edit project"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 26,
          height: 26,
          borderRadius: 6,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 150ms ease, transform 150ms ease',
          backdropFilter: 'blur(4px)',
          lineHeight: 0,
        }}
      >
        <IconPencil size={12} />
      </button>
    </div>
  )
}
