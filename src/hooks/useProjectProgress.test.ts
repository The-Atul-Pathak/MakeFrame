import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProjectProgress } from '@/hooks/useProjectProgress'
import { useCharacterStore } from '@/store/characterSlice'
import { useSceneStore } from '@/store/sceneSlice'
import { useShotStore } from '@/store/shotSlice'
import { usePanelStore } from '@/store/panelSlice'
import { useBeatSheetStore } from '@/store/beatSheetSlice'
import type { Scene, Panel, Shot, Character } from '@/types'

const PROJECT_ID = 'project-1'
const OTHER_PROJECT_ID = 'project-2'
const SCENE_ID = 'scene-1'

const scene = (id: string, projectId: string) => ({ id, projectId } as Scene)
const panel = (sceneId: string) => ({ id: crypto.randomUUID(), sceneId } as Panel)
const shot  = (projectId: string) => ({ id: crypto.randomUUID(), projectId } as Shot)
const char  = (projectId: string) => ({ id: crypto.randomUUID(), projectId } as Character)

function resetStores() {
  useCharacterStore.setState({ characters: [] })
  useSceneStore.setState({ scenes: [] })
  useShotStore.setState({ shots: [] })
  usePanelStore.setState({ panels: [] })
  useBeatSheetStore.setState({ beatSheets: {} })
}

describe('useProjectProgress', () => {
  beforeEach(resetStores)

  it('reports nothing started for an empty project', () => {
    const { result } = renderHook(() => useProjectProgress(PROJECT_ID))

    expect(result.current.startedCount).toBe(0)
    expect(result.current.characters.started).toBe(false)
    expect(result.current.screenplay.count).toBe(0)
  })

  it('blocks storyboard only while the project has no scenes', () => {
    const { result: blocked } = renderHook(() => useProjectProgress(PROJECT_ID))
    expect(blocked.current.storyboard.blocked).toBe(true)

    useSceneStore.setState({ scenes: [scene(SCENE_ID, PROJECT_ID)] })

    const { result: unblocked } = renderHook(() => useProjectProgress(PROJECT_ID))
    expect(unblocked.current.storyboard.blocked).toBe(false)
    // Shot List's upstream link is nullable in the schema, so it is never gated.
    expect(unblocked.current.shotlist.blocked).toBe(false)
  })

  it('resolves panel membership through the project\'s scenes', () => {
    useSceneStore.setState({ scenes: [scene(SCENE_ID, PROJECT_ID)] })
    usePanelStore.setState({ panels: [panel(SCENE_ID), panel('scene-elsewhere')] })

    const { result } = renderHook(() => useProjectProgress(PROJECT_ID))

    expect(result.current.storyboard.count).toBe(1)
  })

  it('ignores records belonging to other projects', () => {
    useCharacterStore.setState({ characters: [char(PROJECT_ID), char(OTHER_PROJECT_ID)] })
    useShotStore.setState({ shots: [shot(OTHER_PROJECT_ID)] })

    const { result } = renderHook(() => useProjectProgress(PROJECT_ID))

    expect(result.current.characters.count).toBe(1)
    expect(result.current.shotlist.count).toBe(0)
    expect(result.current.startedCount).toBe(1)
  })

  it('counts every module that has content', () => {
    useCharacterStore.setState({ characters: [char(PROJECT_ID)] })
    useSceneStore.setState({ scenes: [scene(SCENE_ID, PROJECT_ID)] })
    usePanelStore.setState({ panels: [panel(SCENE_ID)] })
    useShotStore.setState({ shots: [shot(PROJECT_ID)] })
    useBeatSheetStore.setState({
      // Only `beats` is read here; the rest of the sheet is irrelevant to progress.
      beatSheets: { [PROJECT_ID]: { beats: [{ id: 'b1' }] } as never },
    })

    const { result } = renderHook(() => useProjectProgress(PROJECT_ID))

    expect(result.current.startedCount).toBe(5)
    expect(result.current.totalModules).toBe(5)
  })
})
