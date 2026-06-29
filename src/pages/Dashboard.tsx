import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconDeviceTv } from '@tabler/icons-react'
import ProjectCard from '@/components/shared/ProjectCard'
import AddProjectCard from '@/components/shared/AddProjectCard'
import NewProjectModal from '@/components/shared/NewProjectModal'
import RecentlyEdited from '@/components/shared/RecentlyEdited'
import TipsStrip from '@/components/shared/TipsStrip'
import SectionLabel from '@/components/shared/SectionLabel'
import type { Project } from '@/types/project'
import { fetchProjects, saveProject, updateProject } from '@/services/projects'
import type { SaveProjectInput } from '@/services/projects'
import { useAuth } from '@/hooks/useAuth'

function initialsFromUser(email: string | undefined, fullName: unknown): string {
  const name = typeof fullName === 'string' && fullName.trim() ? fullName : email ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

const QUOTES = [
  'Every frame, a choice.',
  'Cut to the truth.',
  'Light reveals, shadow hides.',
  'One take, one chance.',
  'Story above all else.',
]

function DashboardHeader() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className="flex items-center justify-between border-b border-border shrink-0"
      style={{ height: 'var(--topbar-height)', padding: '0 40px', position: 'relative' }}
    >
      <div className="flex items-center gap-2">
        <span className="font-display text-lg text-text-primary tracking-tight">MakeFrame</span>
        <IconDeviceTv size={15} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>

      <button
        aria-label="Profile"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center justify-center rounded-full font-mono text-xs font-medium"
        style={{ width: 34, height: 34, background: 'var(--color-accent)', color: 'var(--color-background)', cursor: 'pointer' }}
      >
        {initialsFromUser(user?.email, user?.user_metadata?.full_name)}
      </button>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(var(--topbar-height) - 6px)',
              right: 40,
              zIndex: 50,
              minWidth: 200,
              background: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              borderRadius: 10,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', padding: '6px 10px', wordBreak: 'break-all' }}>
              {user?.email}
            </div>
            <div style={{ height: '0.5px', background: 'var(--color-border)' }} />
            <button
              onClick={() => signOut()}
              className="font-mono"
              style={{
                textAlign: 'left',
                fontSize: '0.68rem',
                color: 'var(--color-text-secondary)',
                padding: '8px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </header>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  // Pick a quote once per mount. A lazy useState initializer runs exactly once,
  // so it stays stable across re-renders (unlike Math.random() called in render).
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const totalScenes = projects.reduce((a, p) => a + p.sceneCount, 0)
  const totalPanels = projects.reduce((a, p) => a + p.panelCount, 0)
  const totalShots = projects.reduce((a, p) => a + p.shotCount, 0)

  useEffect(() => {
    let mounted = true
    fetchProjects()
      .then((p) => { if (mounted) { setProjects(p); setIsLoading(false) } })
      .catch((e) => { if (mounted) { setLoadError(e.message); setIsLoading(false) } })
    return () => { mounted = false }
  }, [])

  const handleCreate = async (input: SaveProjectInput) => {
    const project = await saveProject(input)
    setProjects((prev) => [project, ...prev])
    setShowCreateModal(false)
  }

  const handleEdit = async (input: SaveProjectInput) => {
    if (!editingProject) return
    const updated = await updateProject(editingProject.id, input)
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    setEditingProject(null)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <DashboardHeader />

      <main className="flex-1 overflow-auto" style={{ padding: '64px 72px' }}>

        {/* Quote + stats */}
        <div className="animate-fade-up" style={{ marginBottom: 56 }}>
          <p className="font-display italic text-text-secondary" style={{ fontSize: '1.6rem', lineHeight: 1.25 }}>
            "{quote}"
          </p>
          <div className="flex items-center gap-5" style={{ marginTop: 20 }}>
            <div className="flex-1" style={{ height: '0.5px', background: 'var(--color-border)' }} />
            <span className="font-mono text-text-tertiary shrink-0" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              {projects.length} projects&nbsp;&nbsp;·&nbsp;&nbsp;{totalScenes} scenes&nbsp;&nbsp;·&nbsp;&nbsp;{totalPanels} panels&nbsp;&nbsp;·&nbsp;&nbsp;{totalShots} shots
            </span>
          </div>
        </div>

        {/* Two-column content */}
        <div className="flex animate-fade-up" style={{ gap: 56, animationDelay: '60ms', marginBottom: 56 }}>

          {/* Projects */}
          <div className="flex-1 min-w-0">
            <SectionLabel>Projects</SectionLabel>

            {loadError && (
              <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-danger)', marginTop: 16 }}>
                {loadError}
              </p>
            )}

            <div className="flex flex-row flex-wrap" style={{ gap: 20, marginTop: 20 }}>
              {!isLoading && projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={() => setEditingProject(p)}
                  onOpen={() => navigate(`/project/${p.id}`)}
                />
              ))}
              <AddProjectCard onClick={() => setShowCreateModal(true)} />
            </div>
          </div>

          {/* Recently edited */}
          <div className="shrink-0 animate-fade-up" style={{ width: 280, animationDelay: '100ms' }}>
            <RecentlyEdited />
          </div>
        </div>

        {/* Tips */}
        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          <TipsStrip />
        </div>

      </main>

      {showCreateModal && (
        <NewProjectModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingProject && (
        <NewProjectModal
          initialData={{
            title: editingProject.title,
            format: editingProject.format,
            logline: editingProject.logline,
            genres: editingProject.genres,
            thumbnailUrl: editingProject.thumbnailUrl,
          }}
          onSave={handleEdit}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  )
}
