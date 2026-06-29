import { create } from 'zustand'
import type { Panel, ShotType, CameraMovement } from '@/types'
import * as panelsService from '@/services/panels'
import { reportSyncError } from '@/store/syncStatusSlice'
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
    panelsService.insertPanel(panel).catch(reportSyncError)
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
          reportSyncError,
          1500,
        )
      }
      if (Object.keys(rest).length === 0) return
      debouncedPatch(`panel:${id}`, rest, (merged) => panelsService.updatePanelRow(id, merged), reportSyncError)
      return
    }

    debouncedPatch(`panel:${id}`, patch, (merged) => panelsService.updatePanelRow(id, merged), reportSyncError)
  },

  deletePanel: (id) => {
    set((s) => ({ panels: s.panels.filter((p) => p.id !== id) }))
    panelsService.deletePanelRow(id).catch(reportSyncError)
  },

  reorderPanels: (sceneId, panels) => {
    set((s) => ({
      panels: [...s.panels.filter((p) => p.sceneId !== sceneId), ...panels],
    }))
    panels.forEach((panel, idx) => {
      panelsService.updatePanelRow(panel.id, { number: idx + 1 }).catch(reportSyncError)
    })
  },

  flagNeedsReview: (panelId) => {
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === panelId ? { ...p, needsReview: true } : p
      ),
    }))
    panelsService.updatePanelRow(panelId, { needsReview: true }).catch(reportSyncError)
  },

  clearNeedsReview: (panelId) => {
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === panelId ? { ...p, needsReview: false } : p
      ),
    }))
    panelsService.updatePanelRow(panelId, { needsReview: false }).catch(reportSyncError)
  },

  getPanelsForScene: (sceneId) =>
    get().panels.filter((p) => p.sceneId === sceneId),
}))
