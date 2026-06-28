import { create } from 'zustand'
import type { Scene, ScreenplayElement, IntExt, TimeOfDay, ActNumber } from '@/types'
import * as scenesService from '@/services/scenes'
import { useSyncStatusStore } from '@/store/syncStatusSlice'
import { debouncedPatch, debouncedRun } from '@/utils/debouncedPersist'

interface SceneState {
  scenes: Scene[]
  // Actions
  loadForProject: (projectId: string) => Promise<void>
  createScene: (projectId: string, overrides?: Partial<Scene>) => Scene
  updateScene: (id: string, patch: Partial<Scene>) => void
  deleteScene: (id: string) => void
  addElement: (sceneId: string, element: ScreenplayElement) => void
  updateElement: (sceneId: string, elementId: string, patch: Partial<ScreenplayElement>) => void
  deleteElement: (sceneId: string, elementId: string) => void
  reorderElements: (sceneId: string, elements: ScreenplayElement[]) => void
  flagNeedsReview: (sceneId: string) => void
  clearNeedsReview: (sceneId: string) => void
  getScenesForProject: (projectId: string) => Scene[]
}

function reportError(err: unknown) {
  useSyncStatusStore.getState().setError(err instanceof Error ? err.message : 'Failed to save changes.')
}

const defaultScene = (projectId: string, number: number): Scene => ({
  id: crypto.randomUUID(),
  projectId,
  number,
  intExt: 'INT' as IntExt,
  location: 'LOCATION',
  timeOfDay: 'DAY' as TimeOfDay,
  act: 1 as ActNumber,
  pageStart: 1,
  pageLength: '1/8',
  characters: [],
  props: [],
  specialRequirements: [],
  emotionalTone: '',
  elements: [],
  needsReview: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const useSceneStore = create<SceneState>()((set, get) => ({
  scenes: [],

  loadForProject: async (projectId) => {
    const fetched = await scenesService.fetchScenesForProject(projectId)
    set((s) => ({ scenes: [...s.scenes.filter((sc) => sc.projectId !== projectId), ...fetched] }))
  },

  createScene: (projectId, overrides = {}) => {
    const existing = get().scenes.filter((s) => s.projectId === projectId)
    const scene: Scene = { ...defaultScene(projectId, existing.length + 1), ...overrides }
    set((s) => ({ scenes: [...s.scenes, scene] }))
    scenesService.insertScene(scene).catch(reportError)
    return scene
  },

  updateScene: (id, patch) => {
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === id ? { ...sc, ...patch, updatedAt: new Date().toISOString() } : sc
      ),
    }))

    if (patch.elements !== undefined) {
      const scene = get().scenes.find((sc) => sc.id === id)
      const elements = patch.elements
      if (scene) {
        debouncedRun(
          `scene-elements:${id}`,
          () => scenesService.replaceElementsForScene(scene.projectId, id, elements),
          reportError,
        )
      }
    }

    const { elements: _elements, ...columnPatch } = patch
    if (Object.keys(columnPatch).length > 0) {
      debouncedPatch(`scene:${id}`, columnPatch, (merged) => scenesService.updateSceneRow(id, merged), reportError)
    }
  },

  deleteScene: (id) => {
    set((s) => ({ scenes: s.scenes.filter((sc) => sc.id !== id) }))
    scenesService.deleteSceneRow(id).catch(reportError)
  },

  addElement: (sceneId, element) => {
    const sceneBefore = get().scenes.find((sc) => sc.id === sceneId)
    const order = (sceneBefore?.elements.length ?? 0) + 1
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId
          ? { ...sc, elements: [...sc.elements, element], updatedAt: new Date().toISOString() }
          : sc
      ),
    }))
    if (sceneBefore) {
      scenesService.insertElement(sceneBefore.projectId, sceneId, element, order).catch(reportError)
    }
  },

  updateElement: (sceneId, elementId, patch) => {
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId
          ? {
              ...sc,
              elements: sc.elements.map((el) =>
                el.id === elementId ? { ...el, ...patch } : el
              ),
              updatedAt: new Date().toISOString(),
            }
          : sc
      ),
    }))
    debouncedPatch(`element:${elementId}`, patch, (merged) => scenesService.updateElementRow(elementId, merged), reportError)
  },

  deleteElement: (sceneId, elementId) => {
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId
          ? {
              ...sc,
              elements: sc.elements.filter((el) => el.id !== elementId),
              updatedAt: new Date().toISOString(),
            }
          : sc
      ),
    }))
    scenesService.deleteElementRow(elementId).catch(reportError)
  },

  reorderElements: (sceneId, elements) => {
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId
          ? { ...sc, elements, updatedAt: new Date().toISOString() }
          : sc
      ),
    }))
    const scene = get().scenes.find((sc) => sc.id === sceneId)
    if (scene) {
      scenesService.replaceElementsForScene(scene.projectId, sceneId, elements).catch(reportError)
    }
  },

  flagNeedsReview: (sceneId) => {
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId ? { ...sc, needsReview: true } : sc
      ),
    }))
    scenesService.updateSceneRow(sceneId, { needsReview: true }).catch(reportError)
  },

  clearNeedsReview: (sceneId) => {
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId ? { ...sc, needsReview: false } : sc
      ),
    }))
    scenesService.updateSceneRow(sceneId, { needsReview: false }).catch(reportError)
  },

  getScenesForProject: (projectId) =>
    get().scenes.filter((s) => s.projectId === projectId),
}))
