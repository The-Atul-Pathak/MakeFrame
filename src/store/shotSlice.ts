import { create } from 'zustand'
import type { Shot, IntExt, ShotType, CameraMovement } from '@/types'
import * as shotsService from '@/services/shots'
import { useSyncStatusStore } from '@/store/syncStatusSlice'
import { debouncedPatch } from '@/utils/debouncedPersist'

interface ShotState {
  shots: Shot[]
  // Actions
  loadForProject: (projectId: string) => Promise<void>
  createShot: (projectId: string, sceneId: string, overrides?: Partial<Shot>) => Shot
  updateShot: (id: string, patch: Partial<Shot>) => void
  deleteShot: (id: string) => void
  reorderShots: (shots: Shot[]) => void
  flagNeedsReview: (shotId: string) => void
  clearNeedsReview: (shotId: string) => void
  getShotsForProject: (projectId: string) => Shot[]
  getShotsForScene: (sceneId: string) => Shot[]
}

function reportError(err: unknown) {
  useSyncStatusStore.getState().setError(err instanceof Error ? err.message : 'Failed to save changes.')
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

export const useShotStore = create<ShotState>()((set, get) => ({
  shots: [],

  loadForProject: async (projectId) => {
    const fetched = await shotsService.fetchShotsForProject(projectId)
    set((s) => ({ shots: [...s.shots.filter((sh) => sh.projectId !== projectId), ...fetched] }))
  },

  createShot: (projectId, sceneId, overrides = {}) => {
    const existing = get().shots.filter((s) => s.projectId === projectId)
    const shot: Shot = { ...defaultShot(projectId, sceneId, existing.length + 1), ...overrides }
    set((s) => ({ shots: [...s.shots, shot] }))
    shotsService.insertShot(shot).catch(reportError)
    return shot
  },

  updateShot: (id, patch) => {
    set((s) => ({
      shots: s.shots.map((sh) =>
        sh.id === id ? { ...sh, ...patch, updatedAt: new Date().toISOString() } : sh
      ),
    }))
    debouncedPatch(`shot:${id}`, patch, (merged) => shotsService.updateShotRow(id, merged), reportError)
  },

  deleteShot: (id) => {
    set((s) => ({ shots: s.shots.filter((sh) => sh.id !== id) }))
    shotsService.deleteShotRow(id).catch(reportError)
  },

  reorderShots: (shots) => {
    set({ shots })
    shots.forEach((shot, idx) => {
      shotsService.updateShotRow(shot.id, { shotNumber: idx + 1 }).catch(reportError)
    })
  },

  flagNeedsReview: (shotId) => {
    set((s) => ({
      shots: s.shots.map((sh) =>
        sh.id === shotId ? { ...sh, needsReview: true } : sh
      ),
    }))
    shotsService.updateShotRow(shotId, { needsReview: true }).catch(reportError)
  },

  clearNeedsReview: (shotId) => {
    set((s) => ({
      shots: s.shots.map((sh) =>
        sh.id === shotId ? { ...sh, needsReview: false } : sh
      ),
    }))
    shotsService.updateShotRow(shotId, { needsReview: false }).catch(reportError)
  },

  getShotsForProject: (projectId) =>
    get().shots.filter((s) => s.projectId === projectId),

  getShotsForScene: (sceneId) =>
    get().shots.filter((s) => s.sceneId === sceneId),
}))
