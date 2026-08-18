import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TipsStrip from '@/components/shared/TipsStrip'
import type { Project } from '@/types/project'

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled',
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
    ...overrides,
  }
}

describe('TipsStrip', () => {
  it('shows the milestones while the pipeline is unfinished', () => {
    render(<TipsStrip projects={[]} />)

    expect(screen.getByText('Getting started')).toBeInTheDocument()
    expect(screen.getByText('Start a project')).toBeInTheDocument()
    expect(screen.getByText('Write a scene')).toBeInTheDocument()
    // Shortcuts are useless advice before a scene exists, so they stay hidden.
    expect(screen.queryByText('Ctrl+Enter')).not.toBeInTheDocument()
  })

  it('swaps to shortcuts once every milestone is met', () => {
    render(<TipsStrip projects={[project({ sceneCount: 3, panelCount: 4, shotCount: 5 })]} />)

    expect(screen.getByText('Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+Enter')).toBeInTheDocument()
    expect(screen.queryByText('Getting started')).not.toBeInTheDocument()
  })

  it('counts milestones across all projects, not just one', () => {
    render(
      <TipsStrip
        projects={[
          project({ sceneCount: 2 }),
          project({ panelCount: 1 }),
          project({ shotCount: 7 }),
        ]}
      />,
    )

    expect(screen.getByText('Shortcuts')).toBeInTheDocument()
  })
})
