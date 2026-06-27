import { useRef, useCallback } from 'react'
import { IconPlus } from '@tabler/icons-react'
import type { Scene, ScreenplayElement, ScreenplayElementType } from '@/types'

// ── Element style helpers ─────────────────────────────────────────────────────

const ELEMENT_LABELS: Record<ScreenplayElementType, string> = {
  'scene-heading':  'SCENE',
  'action':         'ACTION',
  'character':      'CHARACTER',
  'parenthetical':  'PAREN',
  'dialogue':       'DIALOGUE',
  'transition':     'TRANSITION',
}

function getElementContainerStyle(type: ScreenplayElementType): React.CSSProperties {
  switch (type) {
    case 'scene-heading':
      return { marginTop: 24, marginBottom: 4 }
    case 'action':
      return { marginTop: 12 }
    case 'character':
      return { marginTop: 16, paddingLeft: '37%' }
    case 'parenthetical':
      return { paddingLeft: '30%', paddingRight: '20%' }
    case 'dialogue':
      return { paddingLeft: '22%', paddingRight: '14%' }
    case 'transition':
      return { marginTop: 16, marginBottom: 4 }
    default:
      return {}
  }
}

function getTextareaStyle(type: ScreenplayElementType): React.CSSProperties {
  const base: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
    fontFamily: '"Courier Prime", monospace',
    fontSize: '12pt',
    lineHeight: '1.7',
    color: 'var(--color-canvas-text)',
    padding: 0,
    display: 'block',
  }
  switch (type) {
    case 'scene-heading':
      return { ...base, textTransform: 'uppercase', fontWeight: 700 }
    case 'character':
      return { ...base, textTransform: 'uppercase' }
    case 'parenthetical':
      return { ...base, fontStyle: 'italic' }
    case 'transition':
      return { ...base, textAlign: 'right', textTransform: 'uppercase' }
    default:
      return base
  }
}

// Tab-cycling order (not including scene-heading — that's added via Ctrl+Enter)
const TAB_CYCLE: ScreenplayElementType[] = ['action', 'character', 'parenthetical', 'dialogue', 'transition']

function nextType(current: ScreenplayElementType): ScreenplayElementType {
  if (current === 'scene-heading') return 'action'
  const idx = TAB_CYCLE.indexOf(current)
  if (idx === -1) return 'action'
  return TAB_CYCLE[(idx + 1) % TAB_CYCLE.length]
}

function prevType(current: ScreenplayElementType): ScreenplayElementType {
  if (current === 'scene-heading') return 'transition'
  const idx = TAB_CYCLE.indexOf(current)
  if (idx === -1) return 'action'
  return TAB_CYCLE[(idx - 1 + TAB_CYCLE.length) % TAB_CYCLE.length]
}

function defaultNextType(current: ScreenplayElementType): ScreenplayElementType {
  switch (current) {
    case 'scene-heading': return 'action'
    case 'action':        return 'action'
    case 'character':     return 'dialogue'
    case 'parenthetical': return 'dialogue'
    case 'dialogue':      return 'action'
    case 'transition':    return 'action'
    default:              return 'action'
  }
}

// ── Single element block ──────────────────────────────────────────────────────

interface ElementBlockProps {
  element: ScreenplayElement
  isOnly: boolean
  onTextChange: (text: string) => void
  onTypeChange: (type: ScreenplayElementType) => void
  onAddAfter: (type: ScreenplayElementType) => void
  onDelete: () => void
  onFocusNext: () => void
  onFocusPrev: () => void
  onRef: (el: HTMLTextAreaElement | null) => void
}

function ElementBlock({
  element,
  isOnly,
  onTextChange,
  onTypeChange,
  onAddAfter,
  onDelete,
  onFocusNext,
  onFocusPrev,
  onRef,
}: ElementBlockProps) {
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget

    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        onTypeChange(prevType(element.type))
      } else {
        onTypeChange(nextType(element.type))
      }
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onAddAfter('scene-heading')
      return
    }

    if (e.key === 'Enter' && !e.shiftKey && element.type !== 'action') {
      e.preventDefault()
      onAddAfter(defaultNextType(element.type))
      return
    }

    if (e.key === 'Enter' && !e.shiftKey && element.type === 'action') {
      e.preventDefault()
      onAddAfter('action')
      return
    }

    if (e.key === 'ArrowDown') {
      const pos = ta.selectionStart
      const lines = ta.value.substring(0, pos).split('\n')
      if (lines.length === ta.value.split('\n').length) {
        onFocusNext()
      }
    }

    if (e.key === 'ArrowUp') {
      const pos = ta.selectionStart
      const beforeCursor = ta.value.substring(0, pos)
      if (!beforeCursor.includes('\n')) {
        onFocusPrev()
      }
    }

    if (e.key === 'Backspace' && ta.value === '' && !isOnly) {
      e.preventDefault()
      onDelete()
      onFocusPrev()
    }
  }

  return (
    <div
      style={{ position: 'relative', ...getElementContainerStyle(element.type) }}
      className="screenplay-element-block"
    >
      <textarea
        ref={onRef}
        value={element.text}
        placeholder={`${ELEMENT_LABELS[element.type]}…`}
        onChange={e => {
          onTextChange(e.target.value)
          autoResize(e.target)
        }}
        onFocus={e => autoResize(e.target)}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{
          ...getTextareaStyle(element.type),
          minHeight: '1.7em',
        }}
        spellCheck
      />
      {/* Type label — shown on hover via parent CSS */}
      <span
        className="element-type-label font-mono"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          fontSize: '0.45rem',
          letterSpacing: '0.08em',
          color: '#bbb9b5',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 120ms',
        }}
      >
        {ELEMENT_LABELS[element.type]}
      </span>
    </div>
  )
}

// ── Canvas ────────────────────────────────────────────────────────────────────

interface Props {
  scene: Scene
  onUpdateElement: (elementId: string, patch: Partial<ScreenplayElement>) => void
  onAddElement: (afterId: string | null, type: ScreenplayElementType) => ScreenplayElement
  onDeleteElement: (elementId: string) => void
  onUpdateScene: (patch: Partial<Scene>) => void
}

export default function ScreenplayCanvas({
  scene,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  onUpdateScene,
}: Props) {
  const elRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const focusElement = useCallback((id: string) => {
    const el = elRefs.current[id]
    if (el) {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [])

  const heading = `${scene.intExt}. ${scene.location} — ${scene.timeOfDay}`

  const handleHeadingKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (scene.elements.length > 0) {
        focusElement(scene.elements[0].id)
      } else {
        const el = onAddElement(null, 'action')
        requestAnimationFrame(() => focusElement(el.id))
      }
    }
  }

  const handleAddAfter = (afterId: string, type: ScreenplayElementType) => {
    const el = onAddElement(afterId, type)
    requestAnimationFrame(() => focusElement(el.id))
  }

  const handleDeleteElement = (id: string) => {
    const idx = scene.elements.findIndex(e => e.id === id)
    onDeleteElement(id)
    if (idx > 0) {
      requestAnimationFrame(() => focusElement(scene.elements[idx - 1].id))
    }
  }

  const getFocusNext = (currentId: string) => () => {
    const idx = scene.elements.findIndex(e => e.id === currentId)
    if (idx < scene.elements.length - 1) {
      focusElement(scene.elements[idx + 1].id)
    }
  }

  const getFocusPrev = (currentId: string) => () => {
    const idx = scene.elements.findIndex(e => e.id === currentId)
    if (idx > 0) {
      focusElement(scene.elements[idx - 1].id)
    }
  }

  const pageCountEst = (() => {
    const parts = scene.pageLength.split(' ')
    let pages = 0
    for (const p of parts) {
      if (p.includes('/')) {
        const [n, d] = p.split('/').map(Number)
        pages += n / d
      } else {
        pages += Number(p) || 0
      }
    }
    return pages
  })()

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        background: '#e8e5e0',
        padding: '48px 32px',
      }}
    >
      {/* Paper */}
      <div
        style={{
          width: 680,
          minHeight: 880,
          background: 'var(--color-canvas-bg)',
          color: 'var(--color-canvas-text)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
          borderRadius: 2,
          padding: '48px 64px',
          flexShrink: 0,
        }}
      >
        {/* Scene heading (always first — derives from scene metadata) */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={heading}
            onChange={e => {
              const raw = e.target.value.replace(/^(INT|EXT|INT\/EXT)\.\s*/i, '')
              const [loc, tod] = raw.split(' — ')
              const intExt = e.target.value.startsWith('INT/EXT') ? 'INT/EXT'
                : e.target.value.startsWith('EXT') ? 'EXT'
                : 'INT'
              onUpdateScene({
                intExt: intExt as Scene['intExt'],
                location: (loc ?? scene.location).toUpperCase(),
                timeOfDay: (tod?.trim() as Scene['timeOfDay']) ?? scene.timeOfDay,
              })
            }}
            onKeyDown={handleHeadingKeyDown}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: '"Courier Prime", monospace',
              fontSize: '12pt',
              lineHeight: '1.7',
              color: 'var(--color-canvas-text)',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: 0,
            }}
          />
          <div
            className="font-mono"
            style={{
              fontSize: '0.55rem',
              color: '#9a9591',
              display: 'flex',
              gap: 12,
              marginTop: 2,
            }}
          >
            <span>ACT {scene.act}</span>
            <span>{scene.pageLength}p · ~{Math.round(pageCountEst)} min</span>
            {scene.characters.length > 0 && <span>{scene.characters.join(', ')}</span>}
          </div>
        </div>

        {/* Screenplay elements */}
        <div
          style={{
            position: 'relative',
          }}
          css-hover-labels="true"
        >
          <style>{`
            .screenplay-element-block:hover .element-type-label { opacity: 1 !important; }
          `}</style>

          {scene.elements.map(element => (
            <ElementBlock
              key={element.id}
              element={element}
              isOnly={scene.elements.length === 1}
              onTextChange={text => onUpdateElement(element.id, { text })}
              onTypeChange={type => onUpdateElement(element.id, { type })}
              onAddAfter={(type) => handleAddAfter(element.id, type)}
              onDelete={() => handleDeleteElement(element.id)}
              onFocusNext={getFocusNext(element.id)}
              onFocusPrev={getFocusPrev(element.id)}
              onRef={el => { elRefs.current[element.id] = el }}
            />
          ))}

          {/* Add element controls */}
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['action', 'character', 'dialogue', 'transition'] as ScreenplayElementType[]).map(type => (
              <button
                key={type}
                onClick={() => {
                  const lastId = scene.elements.length > 0 ? scene.elements[scene.elements.length - 1].id : null
                  handleAddAfter(lastId ?? '', type)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  background: 'transparent',
                  border: '0.5px dashed #c8c5bf',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: '#9a9591',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '0.55rem',
                  letterSpacing: '0.06em',
                  transition: 'all 120ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#8a7555'
                  ;(e.currentTarget as HTMLElement).style.color = '#8a7555'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#c8c5bf'
                  ;(e.currentTarget as HTMLElement).style.color = '#9a9591'
                }}
              >
                <IconPlus size={9} />
                {ELEMENT_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom page end mark */}
        <div
          style={{
            marginTop: 48,
            borderTop: '0.5px dashed #d0cdc8',
            paddingTop: 8,
            textAlign: 'center',
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.5rem',
            color: '#b0ada8',
            letterSpacing: '0.08em',
          }}
        >
          END SCENE
        </div>
      </div>
    </div>
  )
}
