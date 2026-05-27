import { create } from 'zustand'
import type { ActiveView } from '@/types'

interface UIState {
  activeView: ActiveView
  activeSceneId: string | null
  activePanelId: string | null
  // Actions
  setActiveView: (view: ActiveView) => void
  setActiveScene: (id: string | null) => void
  setActivePanel: (id: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  activeView: 'screenplay',
  activeSceneId: null,
  activePanelId: null,

  setActiveView: (view) => set({ activeView: view }),
  setActiveScene: (id) => set({ activeSceneId: id }),
  setActivePanel: (id) => set({ activePanelId: id }),
}))
