import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Shot, IntExt, ShotType, CameraMovement } from '@/types'

interface ShotState {
  shots: Shot[]
  // Actions
  createShot: (projectId: string, sceneId: string, overrides?: Partial<Shot>) => Shot
  updateShot: (id: string, patch: Partial<Shot>) => void
  deleteShot: (id: string) => void
  reorderShots: (shots: Shot[]) => void
  flagNeedsReview: (shotId: string) => void
  clearNeedsReview: (shotId: string) => void
  getShotsForProject: (projectId: string) => Shot[]
  getShotsForScene: (sceneId: string) => Shot[]
}

const defaultShot = (projectId: string, sceneId: string, number: number): Shot => ({
  id: crypto.randomUUID(),
  projectId,
  sceneId,
  panelId: null,
  shotNumber: number,
  intExt: 'INT' as IntExt,
  location: '',
  shotType: 'MS' as ShotType,
  movement: 'Static' as CameraMovement,
  lens: 50,
  description: '',
  cast: [],
  specialEquipment: '',
  estimatedSetupMinutes: 15,
  notes: '',
  needsReview: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const useShotStore = create<ShotState>()(
  persist(
    (set, get) => ({
      shots: [],

      createShot: (projectId, sceneId, overrides = {}) => {
        const existing = get().shots.filter((s) => s.projectId === projectId)
        const shot: Shot = { ...defaultShot(projectId, sceneId, existing.length + 1), ...overrides }
        set((s) => ({ shots: [...s.shots, shot] }))
        return shot
      },

      updateShot: (id, patch) =>
        set((s) => ({
          shots: s.shots.map((sh) =>
            sh.id === id ? { ...sh, ...patch, updatedAt: new Date().toISOString() } : sh
          ),
        })),

      deleteShot: (id) =>
        set((s) => ({ shots: s.shots.filter((sh) => sh.id !== id) })),

      reorderShots: (shots) => set({ shots }),

      flagNeedsReview: (shotId) =>
        set((s) => ({
          shots: s.shots.map((sh) =>
            sh.id === shotId ? { ...sh, needsReview: true } : sh
          ),
        })),

      clearNeedsReview: (shotId) =>
        set((s) => ({
          shots: s.shots.map((sh) =>
            sh.id === shotId ? { ...sh, needsReview: false } : sh
          ),
        })),

      getShotsForProject: (projectId) =>
        get().shots.filter((s) => s.projectId === projectId),

      getShotsForScene: (sceneId) =>
        get().shots.filter((s) => s.sceneId === sceneId),
    }),
    { name: 'makeframe-shots' }
  )
)
