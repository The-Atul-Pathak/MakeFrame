import { useEffect, useState } from 'react'
import { IconPlus, IconMovie } from '@tabler/icons-react'
import type { Project } from '@/types/project'
import { useSceneStore } from '@/store/sceneSlice'
import { usePanelStore } from '@/store/panelSlice'
import PanelCard from '@/components/storyboard/PanelCard'
import PanelModal from '@/components/storyboard/PanelModal'

interface Props {
  project: Project
}

export default function Storyboard({ project }: Props) {
  const { scenes } = useSceneStore()
  const { createPanel, updatePanel, deletePanel, getPanelsForScene } = usePanelStore()

  const projectScenes = scenes
    .filter(s => s.projectId === project.id)
    .sort((a, b) => a.number - b.number)

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeSceneId && projectScenes.length > 0) {
      setActiveSceneId(projectScenes[0].id)
    }
  }, [projectScenes.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeScene = projectScenes.find(s => s.id === activeSceneId) ?? null
  const activePanels = activeScene ? getPanelsForScene(activeScene.id) : []
  const sortedPanels = [...activePanels].sort((a, b) => a.number - b.number)

  const expandedPanel = expandedPanelId ? sortedPanels.find(p => p.id === expandedPanelId) ?? null : null
  const expandedIdx = expandedPanel ? sortedPanels.findIndex(p => p.id === expandedPanelId) : -1

  const handleAddPanel = () => {
    if (!activeScene) return
    const panel = createPanel(activeScene.id)
    setExpandedPanelId(panel.id)
  }

  const totalDuration = sortedPanels.reduce((acc, p) => acc + p.durationEstimate, 0)

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
          Storyboard
        </h1>
        <div style={{ flex: 1 }} />
        {activeScene && (
          <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
            {sortedPanels.length} panels · ~{totalDuration}s
          </span>
        )}
        <button
          onClick={handleAddPanel}
          disabled={!activeScene}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 6,
            cursor: activeScene ? 'pointer' : 'default',
            color: 'var(--color-background)',
            opacity: activeScene ? 1 : 0.4,
          }}
        >
          <IconPlus size={12} />
          <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>ADD PANEL</span>
        </button>
      </div>

      {/* Scene tabs */}
      {projectScenes.length > 0 && (
        <div
          style={{
            borderBottom: '0.5px solid var(--color-border-subtle)',
            padding: '0 20px',
            display: 'flex',
            gap: 0,
            overflowX: 'auto',
            flexShrink: 0,
            background: 'var(--color-surface)',
          }}
        >
          {projectScenes.map((scene, i) => {
            const isActive = scene.id === activeSceneId
            const panelCount = getPanelsForScene(scene.id).length
            return (
              <button
                key={scene.id}
                onClick={() => setActiveSceneId(scene.id)}
                style={{
                  padding: '9px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                  cursor: 'pointer',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 150ms',
                  flexShrink: 0,
                }}
              >
                <span style={{ opacity: 0.6 }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{scene.intExt}. {scene.location} — {scene.timeOfDay}</span>
                {panelCount > 0 && (
                  <span style={{
                    background: isActive ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                    padding: '0px 4px',
                    borderRadius: 3,
                    fontSize: '0.5rem',
                  }}>
                    {panelCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Panel grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 48px' }}>
        {projectScenes.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 0', opacity: 0.5 }}>
            <IconMovie size={32} style={{ color: 'var(--color-text-tertiary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              No scenes yet
            </span>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
              Create scenes in the Screenplay module first, then come here to storyboard them.
            </span>
          </div>
        ) : sortedPanels.length === 0 ? (
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
            <IconMovie size={32} style={{ color: 'var(--color-text-tertiary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              No panels yet
            </span>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
              Hit <strong style={{ color: 'var(--color-accent)' }}>+ ADD PANEL</strong> to start storyboarding this scene.
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {sortedPanels.map((panel, i) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                index={i}
                onUpdate={patch => updatePanel(panel.id, patch)}
                onDelete={() => deletePanel(panel.id)}
                onExpand={() => setExpandedPanelId(panel.id)}
              />
            ))}

            {/* Add panel placeholder */}
            <button
              onClick={handleAddPanel}
              style={{
                background: 'transparent',
                border: '0.5px dashed var(--color-border)',
                borderRadius: 10,
                padding: '40px 20px',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'border-color 150ms, color 150ms',
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
              <IconPlus size={18} />
              <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.06em' }}>ADD PANEL</span>
            </button>
          </div>
        )}
      </div>

      {/* Expanded panel modal */}
      {expandedPanel && activeScene && (
        <PanelModal
          panel={expandedPanel}
          scene={activeScene}
          panelIndex={expandedIdx}
          totalPanels={sortedPanels.length}
          onUpdate={patch => updatePanel(expandedPanel.id, patch)}
          onClose={() => setExpandedPanelId(null)}
          onPrev={() => {
            if (expandedIdx > 0) setExpandedPanelId(sortedPanels[expandedIdx - 1].id)
          }}
          onNext={() => {
            if (expandedIdx < sortedPanels.length - 1) setExpandedPanelId(sortedPanels[expandedIdx + 1].id)
          }}
        />
      )}
    </div>
  )
}
