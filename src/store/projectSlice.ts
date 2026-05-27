import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@/types'

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  // Actions
  createProject: (title: string) => Project
  updateProject: (id: string, patch: Partial<Pick<Project, 'title'>>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,

      createProject: (title) => {
        const project: Project = {
          id: crypto.randomUUID(),
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ projects: [...s.projects, project] }))
        return project
      },

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),

      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    { name: 'makeframe-projects' }
  )
)
