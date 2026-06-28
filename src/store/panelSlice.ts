import { create } from 'zustand'
import type { Panel, ShotType, CameraMovement } from '@/types'
import * as panelsService from '@/services/panels'
import { useSyncStatusStore } from '@/store/syncStatusSlice'
import { debouncedPatch, debouncedRun } from '@/utils/debouncedPersist'

interface PanelState {
  panels: Panel[]
  loadForProject: (projectId: string) => Promise<void>
  createPanel: (projectId: string, sceneId: string, overrides?: Partial<Panel>) => Panel
  updatePanel: (projectId: string, id: string, patch: Partial<Panel>) => void
  deletePanel: (id: string) => void
  reorderPanels: (sceneId: string, panels: Panel[]) => void
  flagNeedsReview: (panelId: string) => void
  clearNeedsReview: (panelId: string) => void
  getPanelsForScene: (sceneId: string) => Panel[]
}

function reportError(err: unknown) {
  useSyncStatusStore.getState().setError(err instanceof Error ? err.message : 'Failed to save changes.')
}

const defaultPanel = (sceneId: string, number: number): Panel => ({
  id: crypto.randomUUID(),
  sceneId,
  number,
  shotType: 'MS' as ShotType,
  movement: 'Static' as CameraMovement,
  lens: 50,
  actionDescription: '',
  dialogueNote: '',
  durationEstimate: 5,
  sketchDataUrl: null,
  needsReview: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const usePanelStore = create<PanelState>()((set, get) => ({
  panels: [],

  loadForProject: async (projectId) => {
    const fetched = await panelsService.fetchPanelsForProject(projectId)
    const fetchedIds = new Set(fetched.map((p) => p.id))
    set((s) => ({ panels: [...s.panels.filter((p) => !fetchedIds.has(p.id)), ...fetched] }))
  },

  createPanel: (_projectId, sceneId, overrides = {}) => {
    const existing = get().panels.filter((p) => p.sceneId === sceneId)
    const panel: Panel = { ...defaultPanel(sceneId, existing.length + 1), ...overrides }
    set((s) => ({ panels: [...s.panels, panel] }))
    panelsService.insertPanel(panel).catch(reportError)
    return panel
  },

  updatePanel: (projectId, id, patch) => {
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      ),
    }))

    if (patch.sketchDataUrl !== undefined) {
      const { sketchDataUrl, ...rest } = patch
      if (sketchDataUrl) {
        debouncedRun(
          `panel-sketch:${id}`,
          () => panelsService.uploadSketch(projectId, id, sketchDataUrl).then(() => undefined),
          reportError,
          1500,
        )
      }
      if (Object.keys(rest).length === 0) return
      debouncedPatch(`panel:${id}`, rest, (merged) => panelsService.updatePanelRow(id, merged), reportError)
      return
    }

    debouncedPatch(`panel:${id}`, patch, (merged) => panelsService.updatePanelRow(id, merged), reportError)
  },

  deletePanel: (id) => {
    set((s) => ({ panels: s.panels.filter((p) => p.id !== id) }))
    panelsService.deletePanelRow(id).catch(reportError)
  },

  reorderPanels: (sceneId, panels) => {
    set((s) => ({
      panels: [...s.panels.filter((p) => p.sceneId !== sceneId), ...panels],
    }))
    panels.forEach((panel, idx) => {
      panelsService.updatePanelRow(panel.id, { number: idx + 1 }).catch(reportError)
    })
  },

  flagNeedsReview: (panelId) => {
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === panelId ? { ...p, needsReview: true } : p
      ),
    }))
    panelsService.updatePanelRow(panelId, { needsReview: true }).catch(reportError)
  },

  clearNeedsReview: (panelId) => {
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === panelId ? { ...p, needsReview: false } : p
      ),
    }))
    panelsService.updatePanelRow(panelId, { needsReview: false }).catch(reportError)
  },

  getPanelsForScene: (sceneId) =>
    get().panels.filter((p) => p.sceneId === sceneId),
}))
