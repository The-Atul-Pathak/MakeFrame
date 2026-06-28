import { useEffect, useState, Suspense, lazy } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconDeviceTv, IconX } from '@tabler/icons-react'
import type { Project } from '@/types/project'
import { fetchProjectById } from '@/services/projects'
import Sidebar, { type WorkspaceModule } from '@/components/workspace/Sidebar'
import RouteLoadingFallback from '@/components/shared/RouteLoadingFallback'
import { useCharacterStore } from '@/store/characterSlice'
import { useSceneStore } from '@/store/sceneSlice'
import { useShotStore } from '@/store/shotSlice'
import { usePanelStore } from '@/store/panelSlice'
import { useBeatSheetStore } from '@/store/beatSheetSlice'
import { useSyncStatusStore } from '@/store/syncStatusSlice'

const BeatSheet = lazy(() => import('@/pages/BeatSheet'))
const Screenplay = lazy(() => import('@/pages/Screenplay'))
const Storyboard = lazy(() => import('@/pages/Storyboard'))
const ShotList = lazy(() => import('@/pages/ShotList'))
const Characters = lazy(() => import('@/pages/Characters'))

// ── Leave-project confirmation modal ─────────────────────────────────────────

interface LeaveModalProps {
  onConfirm: () => void
  onCancel: () => void
}

function LeaveModal({ onConfirm, onCancel }: LeaveModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 12,
          padding: '28px 32px',
          width: 360,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <span
            className="font-mono"
            style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}
          >
            LEAVE PROJECT
          </span>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', lineHeight: 0 }}
          >
            <IconX size={13} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 8, lineHeight: 1.5 }}>
          Go back to dashboard?
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 24, lineHeight: 1.5 }}>
          All your changes are saved automatically.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 16px',
              background: 'transparent',
              border: '0.5px solid var(--color-border)',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              fontSize: '0.82rem',
            }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '7px 16px',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--color-background)',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Workspace topbar ──────────────────────────────────────────────────────────

interface TopbarProps {
  projectTitle: string
  activeModule: WorkspaceModule
  onLogoClick: () => void
}

const MODULE_LABELS: Record<WorkspaceModule, string> = {
  beatsheet:  'Beat Sheet',
  screenplay: 'Screenplay',
  storyboard: 'Storyboard',
  shotlist:   'Shot List',
  characters: 'Characters',
}

function WorkspaceTopbar({ projectTitle, activeModule, onLogoClick }: TopbarProps) {
  const [logoHovered, setLogoHovered] = useState(false)

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        borderBottom: '0.5px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        flexShrink: 0,
        gap: 0,
      }}
    >
      <button
        onClick={onLogoClick}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        title="Back to dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: logoHovered ? 'var(--color-surface-raised)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 6,
          transition: 'background 150ms',
        }}
      >
        <span
          className="font-display tracking-tight"
          style={{
            fontSize: '1rem',
            color: logoHovered ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            transition: 'color 150ms',
          }}
        >
          MakeFrame
        </span>
        <IconDeviceTv
          size={13}
          style={{
            color: logoHovered ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            transition: 'color 150ms',
          }}
        />
      </button>

      <span
        style={{
          margin: '0 8px',
          color: 'var(--color-text-tertiary)',
          fontSize: '0.75rem',
          userSelect: 'none',
        }}
      >
        /
      </span>

      <span
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-primary)',
          fontWeight: 500,
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {projectTitle}
      </span>

      <span
        style={{
          margin: '0 8px',
          color: 'var(--color-text-tertiary)',
          fontSize: '0.75rem',
          userSelect: 'none',
        }}
      >
        /
      </span>

      <span
        className="font-mono"
        style={{
          fontSize: '0.65rem',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.04em',
        }}
      >
        {MODULE_LABELS[activeModule]}
      </span>
    </header>
  )
}

// ── Main workspace ────────────────────────────────────────────────────────────

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject]           = useState<Project | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [activeModule, setActiveModule] = useState<WorkspaceModule>('beatsheet')
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  useEffect(() => {
    if (!projectId) { navigate('/'); return }
    Promise.all([
      fetchProjectById(projectId),
      useCharacterStore.getState().loadForProject(projectId),
      useSceneStore.getState().loadForProject(projectId),
      useShotStore.getState().loadForProject(projectId),
      usePanelStore.getState().loadForProject(projectId),
      useBeatSheetStore.getState().loadForProject(projectId),
    ])
      .then(([p]) => { setProject(p); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const syncError = useSyncStatusStore(s => s.error)
  const clearSyncError = useSyncStatusStore(s => s.clearError)

  const handleLogoClick = () => setShowLeaveModal(true)
  const handleLeaveConfirm = () => navigate('/')
  const handleLeaveCancel  = () => setShowLeaveModal(false)

  if (loading) {
    return <RouteLoadingFallback label="Loading project…" />
  }

  if (error || !project) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>
          {error ?? 'Project not found.'}
        </span>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}
        >
          ← Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      <WorkspaceTopbar
        projectTitle={project.title}
        activeModule={activeModule}
        onLogoClick={handleLogoClick}
      />

      {syncError && (
        <div
          style={{
            background: 'var(--color-danger)',
            color: 'var(--color-background)',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '0.8rem',
            flexShrink: 0,
          }}
        >
          <span style={{ flex: 1 }}>{syncError}</span>
          <button
            onClick={clearSyncError}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-background)', lineHeight: 0 }}
          >
            <IconX size={13} />
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar
          project={project}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          onBack={handleLogoClick}
        />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-background)' }}>
          <Suspense fallback={<RouteLoadingFallback />}>
            {activeModule === 'beatsheet'  && <BeatSheet  project={project} />}
            {activeModule === 'screenplay' && <Screenplay project={project} />}
            {activeModule === 'storyboard' && <Storyboard project={project} />}
            {activeModule === 'shotlist'   && <ShotList   project={project} />}
            {activeModule === 'characters' && <Characters project={project} />}
          </Suspense>
        </main>
      </div>

      {showLeaveModal && (
        <LeaveModal onConfirm={handleLeaveConfirm} onCancel={handleLeaveCancel} />
      )}
    </div>
  )
}
