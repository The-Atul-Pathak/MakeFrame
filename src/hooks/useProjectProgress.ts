import { useMemo } from 'react'
import { useCharacterStore } from '@/store/characterSlice'
import { useSceneStore } from '@/store/sceneSlice'
import { useShotStore } from '@/store/shotSlice'
import { usePanelStore } from '@/store/panelSlice'
import { useBeatSheetStore } from '@/store/beatSheetSlice'
import type { WorkspaceModule } from '@/components/workspace/Sidebar'

export interface ModuleProgress {
  /** How many items of this module's primary record type exist in the project. */
  count: number
  /** The module has content the user put there. */
  started: boolean
  /**
   * The module's upstream requirement is unmet, so there is nothing useful to do
   * here yet. Only Storyboard has a hard version of this (panels.scene_id is
   * NOT NULL — a panel literally cannot exist without a scene); Shot List's
   * upstream link is nullable, so it is never blocked, only nudged.
   */
  blocked: boolean
  /** The module this one draws from, for empty-state nudges. */
  upstream: WorkspaceModule | null
}

export type ProjectProgress = Record<WorkspaceModule, ModuleProgress> & {
  /** Modules containing any content — the numerator of "3 of 5 started". */
  startedCount: number
  totalModules: number
}

/**
 * Derives per-module progress for a project from the stores that are already
 * loaded by ProjectWorkspace. Adds no fetches of its own — every count here is
 * read from state the workspace populated on mount.
 */
export function useProjectProgress(projectId: string): ProjectProgress {
  const characters = useCharacterStore(s => s.characters)
  const scenes     = useSceneStore(s => s.scenes)
  const shots      = useShotStore(s => s.shots)
  const panels     = usePanelStore(s => s.panels)
  const beatSheets = useBeatSheetStore(s => s.beatSheets)

  return useMemo(() => {
    const projectScenes  = scenes.filter(s => s.projectId === projectId)
    const sceneIds       = new Set(projectScenes.map(s => s.id))
    // Panels carry only a sceneId, so project membership is resolved through scenes.
    const projectPanels  = panels.filter(p => sceneIds.has(p.sceneId))
    const projectShots   = shots.filter(s => s.projectId === projectId)
    const projectChars   = characters.filter(c => c.projectId === projectId)
    const beats          = beatSheets[projectId]?.beats ?? []

    const modules: Record<WorkspaceModule, ModuleProgress> = {
      characters: {
        count: projectChars.length,
        started: projectChars.length > 0,
        blocked: false,
        upstream: null,
      },
      beatsheet: {
        count: beats.length,
        started: beats.length > 0,
        blocked: false,
        upstream: null,
      },
      screenplay: {
        count: projectScenes.length,
        started: projectScenes.length > 0,
        blocked: false,
        upstream: null,
      },
      storyboard: {
        count: projectPanels.length,
        started: projectPanels.length > 0,
        blocked: projectScenes.length === 0,
        upstream: 'screenplay',
      },
      shotlist: {
        count: projectShots.length,
        started: projectShots.length > 0,
        blocked: false,
        upstream: 'storyboard',
      },
    }

    const startedCount = Object.values(modules).filter(m => m.started).length

    return { ...modules, startedCount, totalModules: 5 }
  }, [projectId, characters, scenes, shots, panels, beatSheets])
}
