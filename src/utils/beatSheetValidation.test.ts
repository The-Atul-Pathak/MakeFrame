import { describe, it, expect } from 'vitest'
import { validateBeatSheet } from './beatSheetValidation'
import type { Beat, BeatSheet, EmotionalTone } from '@/types/beatsheet'

function makeBeat(partial: Partial<Beat> & Pick<Beat, 'name' | 'order'>): Beat {
  return {
    id: `beat-${partial.order}`,
    description: 'desc',
    pageStart: 1,
    pageEnd: 2,
    actKey: 'act1',
    percentage: 0,
    emotionalTone: null,
    characters: ['A', 'B', 'C'],
    location: null,
    notes: '',
    status: 'draft',
    ...partial,
  }
}

function makeSheet(beats: Beat[], overrides: Partial<BeatSheet> = {}): BeatSheet {
  return {
    id: 'sheet-1',
    projectId: 'proj-1',
    framework: 'save_the_cat',
    totalPages: 100,
    genre: null,
    beats,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('validateBeatSheet', () => {
  it('returns no issues for an empty beat sheet', () => {
    expect(validateBeatSheet(makeSheet([]))).toEqual([])
  })

  it('flags a Catalyst that lands after page 15', () => {
    const sheet = makeSheet([makeBeat({ name: 'Catalyst', order: 1, pageStart: 20, pageEnd: 21 })])
    const issues = validateBeatSheet(sheet)
    expect(issues.some((i) => i.id === 'catalyst_late')).toBe(true)
  })

  it('does not flag a Catalyst on page 12', () => {
    const sheet = makeSheet([makeBeat({ name: 'Catalyst', order: 1, pageStart: 12, pageEnd: 13 })])
    expect(validateBeatSheet(sheet).some((i) => i.id === 'catalyst_late')).toBe(false)
  })

  it('flags a page overflow as an error severity', () => {
    const sheet = makeSheet(
      [makeBeat({ name: 'Finale', order: 1, pageStart: 99, pageEnd: 130 })],
      { totalPages: 100 },
    )
    const overflow = validateBeatSheet(sheet).find((i) => i.id === 'page_overflow')
    expect(overflow).toBeDefined()
    expect(overflow?.severity).toBe('error')
  })

  it('flags consecutive beats sharing the same emotional tone', () => {
    const tone: EmotionalTone = 'tense'
    const sheet = makeSheet([
      makeBeat({ name: 'One', order: 1, emotionalTone: tone }),
      makeBeat({ name: 'Two', order: 2, emotionalTone: tone }),
    ])
    expect(validateBeatSheet(sheet).some((i) => i.id.startsWith('pacing_'))).toBe(true)
  })
})
