import { useEffect, useState } from 'react'
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconFileText,
} from '@tabler/icons-react'
import type { Project } from '@/types/project'
import type { ScreenplayElement, ScreenplayElementType } from '@/types'
import { useSceneStore } from '@/store/sceneSlice'
import SceneListSidebar from '@/components/screenplay/SceneListSidebar'
import ScreenplayCanvas from '@/components/screenplay/ScreenplayCanvas'
import SceneMetaPanel from '@/components/screenplay/SceneMetaPanel'

interface Props {
  project: Project
}

export default function Screenplay({ project }: Props) {
  const { scenes, createScene, updateScene, deleteScene, addElement, updateElement, deleteElement } = useSceneStore()
  const projectScenes = scenes.filter(s => s.projectId === project.id).sort((a, b) => a.number - b.number)

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [showMeta, setShowMeta] = useState(true)

  // Auto-select first scene on load
  useEffect(() => {
    if (!activeSceneId && projectScenes.length > 0) {
      setActiveSceneId(projectScenes[0].id)
    }
  }, [projectScenes.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeScene = projectScenes.find(s => s.id === activeSceneId) ?? null

  const handleAddScene = () => {
    const scene = createScene(project.id)
    setActiveSceneId(scene.id)
  }

  const handleDeleteScene = (id: string) => {
    deleteScene(id)
    if (activeSceneId === id) {
      const remaining = projectScenes.filter(s => s.id !== id)
      setActiveSceneId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const handleAddElement = (sceneId: string, afterId: string | null, type: ScreenplayElementType): ScreenplayElement => {
    const element: ScreenplayElement = {
      id: crypto.randomUUID(),
      type,
      text: '',
    }
    const scene = projectScenes.find(s => s.id === sceneId)
    if (!scene) return element

    if (afterId === null) {
      addElement(sceneId, element)
    } else {
      const afterIdx = scene.elements.findIndex(e => e.id === afterId)
      const newElements = [...scene.elements]
      newElements.splice(afterIdx + 1, 0, element)
      updateScene(sceneId, { elements: newElements })
    }
    return element
  }

  const totalPages = projectScenes.reduce((acc, s) => {
    const parts = s.pageLength.split(' ')
    let pages = 0
    for (const p of parts) {
      if (p.includes('/')) {
        const [n, d] = p.split('/').map(Number)
        pages += n / d
      } else {
        pages += Number(p) || 0
      }
    }
    return acc + pages
  }, 0)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '0.5px solid var(--color-border-subtle)',
          padding: '12px 24px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          Screenplay
        </h1>
        <div style={{ flex: 1 }} />
        <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
          {projectScenes.length} scenes · ~{Math.ceil(totalPages)}p · ~{Math.ceil(totalPages)} min
        </span>
        <button
          onClick={() => setShowMeta(m => !m)}
          title={showMeta ? 'Hide metadata panel' : 'Show metadata panel'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            background: showMeta ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
            border: `0.5px solid ${showMeta ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
            borderRadius: 6,
            cursor: 'pointer',
            color: showMeta ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            transition: 'all 150ms',
          }}
        >
          {showMeta ? <IconLayoutSidebarRightCollapse size={13} /> : <IconLayoutSidebarRightExpand size={13} />}
          <span className="font-mono" style={{ fontSize: '0.6rem' }}>METADATA</span>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Scene list */}
        <SceneListSidebar
          scenes={projectScenes}
          activeSceneId={activeSceneId}
          onSelect={setActiveSceneId}
          onAdd={handleAddScene}
          onDelete={handleDeleteScene}
        />

        {/* Canvas area */}
        {activeScene ? (
          <ScreenplayCanvas
            scene={activeScene}
            onUpdateElement={(elementId, patch) => updateElement(activeScene.id, elementId, patch)}
            onAddElement={(afterId, type) => handleAddElement(activeScene.id, afterId, type)}
            onDeleteElement={(elementId) => deleteElement(activeScene.id, elementId)}
            onUpdateScene={(patch) => updateScene(activeScene.id, patch)}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              opacity: 0.5,
            }}
          >
            <IconFileText size={32} style={{ color: 'var(--color-text-tertiary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              No scene selected
            </span>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
              Add a scene from the sidebar to start writing your screenplay.
            </span>
          </div>
        )}

        {/* Meta panel */}
        {showMeta && activeScene && (
          <SceneMetaPanel
            scene={activeScene}
            onChange={(patch) => updateScene(activeScene.id, patch)}
            onClose={() => setShowMeta(false)}
          />
        )}
      </div>
    </div>
  )
}
