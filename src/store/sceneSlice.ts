import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Scene, ScreenplayElement, IntExt, TimeOfDay, ActNumber } from '@/types'

interface SceneState {
  scenes: Scene[]
  // Actions
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

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: [],

      createScene: (projectId, overrides = {}) => {
        const existing = get().scenes.filter((s) => s.projectId === projectId)
        const scene: Scene = { ...defaultScene(projectId, existing.length + 1), ...overrides }
        set((s) => ({ scenes: [...s.scenes, scene] }))
        return scene
      },

      updateScene: (id, patch) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === id ? { ...sc, ...patch, updatedAt: new Date().toISOString() } : sc
          ),
        })),

      deleteScene: (id) =>
        set((s) => ({ scenes: s.scenes.filter((sc) => sc.id !== id) })),

      addElement: (sceneId, element) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId
              ? { ...sc, elements: [...sc.elements, element], updatedAt: new Date().toISOString() }
              : sc
          ),
        })),

      updateElement: (sceneId, elementId, patch) =>
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
        })),

      deleteElement: (sceneId, elementId) =>
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
        })),

      reorderElements: (sceneId, elements) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId
              ? { ...sc, elements, updatedAt: new Date().toISOString() }
              : sc
          ),
        })),

      flagNeedsReview: (sceneId) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId ? { ...sc, needsReview: true } : sc
          ),
        })),

      clearNeedsReview: (sceneId) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId ? { ...sc, needsReview: false } : sc
          ),
        })),

      getScenesForProject: (projectId) =>
        get().scenes.filter((s) => s.projectId === projectId),
    }),
    { name: 'makeframe-scenes' }
  )
)
