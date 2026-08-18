import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/workspace/Sidebar'
import { useSceneStore } from '@/store/sceneSlice'
import { useCharacterStore } from '@/store/characterSlice'
import { useShotStore } from '@/store/shotSlice'
import { usePanelStore } from '@/store/panelSlice'
import { useBeatSheetStore } from '@/store/beatSheetSlice'
import type { Project } from '@/types/project'
import type { Scene, Character } from '@/types'

const PROJECT: Project = {
  id: 'project-1',
  title: 'Signal Hill',
  format: 'Short Film',
  genres: [],
  logline: null,
  thumbnailUrl: null,
  sceneCount: 0,
  panelCount: 0,
  shotCount: 0,
  draftNumber: 1,
  createdAt: new Date().toISOString(),
  lastEditedAt: new Date().toISOString(),
}

function renderSidebar() {
  return render(
    <Sidebar
      project={PROJECT}
      activeModule="characters"
      onModuleChange={vi.fn()}
      onBack={vi.fn()}
    />,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    useCharacterStore.setState({ characters: [] })
    useSceneStore.setState({ scenes: [] })
    useShotStore.setState({ shots: [] })
    usePanelStore.setState({ panels: [] })
    useBeatSheetStore.setState({ beatSheets: {} })
  })

  it('groups the modules so the downstream chain is visible', () => {
    renderSidebar()

    expect(screen.getByText('DEVELOPMENT')).toBeInTheDocument()
    expect(screen.getByText('PIPELINE')).toBeInTheDocument()
  })

  it('tells storyboard it needs a scene before one exists', () => {
    renderSidebar()

    expect(screen.getByText('Add a scene first')).toBeInTheDocument()
    expect(screen.queryByText('Shot-by-shot panels')).not.toBeInTheDocument()
  })

  it('restores the description once the upstream scene exists', () => {
    useSceneStore.setState({ scenes: [{ id: 's1', projectId: PROJECT.id } as Scene] })
    renderSidebar()

    expect(screen.getByText('Shot-by-shot panels')).toBeInTheDocument()
    expect(screen.queryByText('Add a scene first')).not.toBeInTheDocument()
  })

  it('shows how much is in each module and how many are started', () => {
    useCharacterStore.setState({
      characters: [
        { id: 'c1', projectId: PROJECT.id } as Character,
        { id: 'c2', projectId: PROJECT.id } as Character,
      ],
    })
    renderSidebar()

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1 / 5 MODULES STARTED')).toBeInTheDocument()
  })
})
