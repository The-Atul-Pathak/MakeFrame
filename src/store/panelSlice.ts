import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Panel, ShotType, CameraMovement } from '@/types'

interface PanelState {
  panels: Panel[]
  // Actions
  createPanel: (sceneId: string, overrides?: Partial<Panel>) => Panel
  updatePanel: (id: string, patch: Partial<Panel>) => void
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

export const usePanelStore = create<PanelState>()(
  persist(
    (set, get) => ({
      panels: [],

      createPanel: (sceneId, overrides = {}) => {
        const existing = get().panels.filter((p) => p.sceneId === sceneId)
        const panel: Panel = { ...defaultPanel(sceneId, existing.length + 1), ...overrides }
        set((s) => ({ panels: [...s.panels, panel] }))
        return panel
      },

      updatePanel: (id, patch) =>
        set((s) => ({
          panels: s.panels.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deletePanel: (id) =>
        set((s) => ({ panels: s.panels.filter((p) => p.id !== id) })),

      reorderPanels: (sceneId, panels) =>
        set((s) => ({
          panels: [...s.panels.filter((p) => p.sceneId !== sceneId), ...panels],
        })),

      flagNeedsReview: (panelId) =>
        set((s) => ({
          panels: s.panels.map((p) =>
            p.id === panelId ? { ...p, needsReview: true } : p
          ),
        })),

      clearNeedsReview: (panelId) =>
        set((s) => ({
          panels: s.panels.map((p) =>
            p.id === panelId ? { ...p, needsReview: false } : p
          ),
        })),

      getPanelsForScene: (sceneId) =>
        get().panels.filter((p) => p.sceneId === sceneId),
    }),
    { name: 'makeframe-panels' }
  )
)
