import { create } from 'zustand'
import type { BeatSheet, Beat, BeatFramework } from '@/types/beatsheet'
import type { BeatRemapping } from '@/types/framework'
import { FRAMEWORKS } from '@/utils/beatSheetFrameworks'
import { getConversionTargets } from '@/data/frameworkConversions'
import * as beatSheetsService from '@/services/beatSheets'
import { useSyncStatusStore } from '@/store/syncStatusSlice'
import { debouncedPatch, debouncedRun } from '@/utils/debouncedPersist'

interface BeatSheetState {
  beatSheets: Record<string, BeatSheet>

  loadForProject: (projectId: string) => Promise<void>

  createBeatSheet: (
    projectId: string,
    framework: BeatFramework,
    totalPages: number,
    genre: string | null
  ) => BeatSheet

  switchFramework: (projectId: string, framework: BeatFramework) => void
  confirmFrameworkSwitch: (
    projectId: string,
    toFramework: BeatFramework,
    remappings: BeatRemapping[]
  ) => void

  updateBeatSheet:  (projectId: string, patch: Partial<Pick<BeatSheet, 'totalPages' | 'genre'>>) => void
  updateBeat:       (projectId: string, beatId: string, patch: Partial<Beat>) => void
  assignBeatToSlot: (projectId: string, beatId: string, frameworkBeatId: string) => void
  addBeat:          (projectId: string, actKey?: string, frameworkBeatId?: string) => Beat | null
  deleteBeat:       (projectId: string, beatId: string) => void
  reorderBeat:      (projectId: string, beatId: string, beforeId: string | null, afterId: string | null) => void

  buildRemappings: (projectId: string, toFramework: BeatFramework) => BeatRemapping[]
}

function reportError(err: unknown) {
  useSyncStatusStore.getState().setError(err instanceof Error ? err.message : 'Failed to save changes.')
}

function recomputePercentages(beats: Beat[], totalPages: number): Beat[] {
  return beats.map(b => ({
    ...b,
    percentage: totalPages > 0 ? b.pageStart / totalPages : 0,
  }))
}

/** Mirrors the act-key derivation in confirmFrameworkSwitch, used to send a consistent value to the RPC. */
function deriveActKeyForFrameworkBeat(toFramework: BeatFramework, frameworkBeatId: string | undefined): string | undefined {
  if (!frameworkBeatId) return undefined
  const frameworkDef = FRAMEWORKS[toFramework]
  return frameworkDef?.acts.find(a =>
    a.beatOrders.includes(
      frameworkDef.defaultBeats.find(db => db.name.toLowerCase().replace(/\s+/g, '_') === frameworkBeatId)?.order ?? -1
    )
  )?.key
}

export const useBeatSheetStore = create<BeatSheetState>()((set, get) => ({
  beatSheets: {},

  loadForProject: async (projectId) => {
    const sheet = await beatSheetsService.fetchBeatSheetForProject(projectId)
    if (!sheet) return
    set(s => ({ beatSheets: { ...s.beatSheets, [projectId]: sheet } }))
  },

  createBeatSheet: (projectId, framework, totalPages, genre) => {
    // Guards against React StrictMode's double-invoked mount effects (BeatSheet.tsx
    // calls this unconditionally if its render-time snapshot had no sheet yet) — a
    // fresh get() here sees the first call's write and skips the duplicate insert,
    // which would otherwise violate beat_sheets' unique(project_id) constraint.
    const existing = get().beatSheets[projectId]
    if (existing) return existing
    const sheet: BeatSheet = {
      id: crypto.randomUUID(),
      projectId,
      framework,
      totalPages,
      genre,
      beats: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(s => ({ beatSheets: { ...s.beatSheets, [projectId]: sheet } }))
    beatSheetsService.insertBeatSheet(sheet).catch(reportError)
    return sheet
  },

  switchFramework: (projectId, framework) => {
    const existing = get().beatSheets[projectId]
    if (!existing) return
    set(s => ({
      beatSheets: {
        ...s.beatSheets,
        [projectId]: {
          ...existing,
          framework,
          updatedAt: new Date().toISOString(),
        },
      },
    }))
    beatSheetsService.updateBeatSheetRow(existing.id, { framework }).catch(reportError)
  },

  confirmFrameworkSwitch: (projectId, toFramework, remappings) => {
    const sheet = get().beatSheets[projectId]
    if (!sheet) return

    set(s => {
      const remapIndex = Object.fromEntries(
        remappings.map(r => [r.userBeatId, r.confirmedTargetId])
      )
      const needsReviewSet = new Set(
        remappings.filter(r => r.isAmbiguous).map(r => r.userBeatId)
      )
      const frameworkDef = FRAMEWORKS[toFramework]
      const beats = sheet.beats.map(b => {
        const newFrameworkBeatId = remapIndex[b.id]
        if (!newFrameworkBeatId) return { ...b, framework: toFramework }
        const newActKey = frameworkDef?.acts.find(a =>
          a.beatOrders.includes(
            (frameworkDef.defaultBeats.find(db => db.name.toLowerCase().replace(/\s+/g, '_') === newFrameworkBeatId)?.order ?? -1)
          )
        )?.key ?? b.actKey
        return {
          ...b,
          frameworkBeatId: newFrameworkBeatId,
          needsReview: needsReviewSet.has(b.id),
          actKey: newActKey,
        }
      })
      return {
        beatSheets: {
          ...s.beatSheets,
          [projectId]: {
            ...sheet,
            framework: toFramework,
            beats,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })

    beatSheetsService
      .confirmFrameworkSwitchRemote(
        projectId,
        toFramework,
        remappings.map(r => ({
          userBeatId: r.userBeatId,
          confirmedTargetId: r.confirmedTargetId,
          isAmbiguous: r.isAmbiguous,
          actKey: deriveActKeyForFrameworkBeat(toFramework, r.confirmedTargetId),
        })),
      )
      .catch(reportError)
  },

  updateBeatSheet: (projectId, patch) => {
    set(s => {
      const sheet = s.beatSheets[projectId]
      if (!sheet) return s
      const next = { ...sheet, ...patch, updatedAt: new Date().toISOString() }
      if (patch.totalPages !== undefined) {
        next.beats = recomputePercentages(sheet.beats, patch.totalPages)
      }
      return { beatSheets: { ...s.beatSheets, [projectId]: next } }
    })
    const sheet = get().beatSheets[projectId]
    if (!sheet) return
    debouncedPatch(`beatsheet:${sheet.id}`, patch, (merged) => beatSheetsService.updateBeatSheetRow(sheet.id, merged), reportError)
  },

  updateBeat: (projectId, beatId, patch) => {
    set(s => {
      const sheet = s.beatSheets[projectId]
      if (!sheet) return s
      const beats = recomputePercentages(
        sheet.beats.map(b => (b.id === beatId ? { ...b, ...patch } : b)),
        sheet.totalPages
      )
      return {
        beatSheets: {
          ...s.beatSheets,
          [projectId]: { ...sheet, beats, updatedAt: new Date().toISOString() },
        },
      }
    })
    debouncedPatch(`beat:${beatId}`, patch, (merged) => beatSheetsService.updateBeatRow(beatId, merged), reportError)
  },

  assignBeatToSlot: (projectId, beatId, frameworkBeatId) => {
    set(s => {
      const sheet = s.beatSheets[projectId]
      if (!sheet) return s
      const beats = sheet.beats.map(b =>
        b.id === beatId
          ? { ...b, frameworkBeatId, needsReview: false }
          : b
      )
      return {
        beatSheets: {
          ...s.beatSheets,
          [projectId]: { ...sheet, beats, updatedAt: new Date().toISOString() },
        },
      }
    })
    beatSheetsService.updateBeatRow(beatId, { frameworkBeatId, needsReview: false }).catch(reportError)
  },

  addBeat: (projectId, actKey?, frameworkBeatId?) => {
    const sheet = get().beatSheets[projectId]
    if (!sheet) return null
    const maxOrder = sheet.beats.length > 0
      ? Math.max(...sheet.beats.map(b => b.order))
      : 0
    const resolvedActKey = actKey ?? FRAMEWORKS[sheet.framework]?.acts[0]?.key ?? 'act1'
    const newBeat: Beat = {
      id: crypto.randomUUID(),
      order: maxOrder + 1,
      name: 'New Beat',
      description: '',
      pageStart: 1,
      pageEnd: 1,
      actKey: resolvedActKey,
      frameworkBeatId,
      needsReview: false,
      percentage: 0,
      emotionalTone: null,
      characters: [],
      location: null,
      notes: '',
      status: 'draft',
    }
    set(s => {
      const existing = s.beatSheets[projectId]
      if (!existing) return s
      return {
        beatSheets: {
          ...s.beatSheets,
          [projectId]: {
            ...existing,
            beats: [...existing.beats, newBeat],
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })
    beatSheetsService.insertBeat(sheet.id, newBeat).catch(reportError)
    return newBeat
  },

  deleteBeat: (projectId, beatId) => {
    set(s => {
      const sheet = s.beatSheets[projectId]
      if (!sheet) return s
      return {
        beatSheets: {
          ...s.beatSheets,
          [projectId]: {
            ...sheet,
            beats: sheet.beats.filter(b => b.id !== beatId),
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })
    beatSheetsService.deleteBeatRow(beatId).catch(reportError)
  },

  // Reorders a beat relative to its neighbours within whatever list it's being
  // dragged in (a framework slot, or the unassigned section). Uses fractional
  // ordering between the neighbours' `order` values so we never need to touch
  // beats outside that list, including ones in other slots.
  reorderBeat: (projectId, beatId, beforeId, afterId) => {
    let beatSheetId: string | undefined
    set(s => {
      const sheet = s.beatSheets[projectId]
      if (!sheet) return s
      beatSheetId = sheet.id
      const beforeOrder = beforeId ? sheet.beats.find(b => b.id === beforeId)?.order : undefined
      const afterOrder = afterId ? sheet.beats.find(b => b.id === afterId)?.order : undefined
      let newOrder: number
      if (beforeOrder !== undefined && afterOrder !== undefined) {
        newOrder = (beforeOrder + afterOrder) / 2
      } else if (beforeOrder !== undefined) {
        newOrder = beforeOrder + 1
      } else if (afterOrder !== undefined) {
        newOrder = afterOrder - 1
      } else {
        return s
      }
      return {
        beatSheets: {
          ...s.beatSheets,
          [projectId]: {
            ...sheet,
            beats: sheet.beats.map(b => (b.id === beatId ? { ...b, order: newOrder } : b)),
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })
    if (!beatSheetId) return
    const sheetNow = get().beatSheets[projectId]
    if (!sheetNow) return
    const orderedIds = [...sheetNow.beats].sort((a, b) => a.order - b.order).map(b => ({ id: b.id, order: b.order }))
    debouncedRun(`beatsheet-order:${beatSheetId}`, () => beatSheetsService.persistBeatOrder(orderedIds), reportError)
  },

  buildRemappings: (projectId, toFramework) => {
    const sheet = get().beatSheets[projectId]
    if (!sheet) return []
    const fromFramework = sheet.framework
    return sheet.beats
      .filter(b => b.frameworkBeatId)
      .map(b => {
        const possibleTargetIds = getConversionTargets(
          fromFramework,
          toFramework,
          b.frameworkBeatId!
        )
        const isAmbiguous = possibleTargetIds.length > 1
        return {
          userBeatId: b.id,
          currentFrameworkBeatId: b.frameworkBeatId,
          proposedFrameworkBeatId: possibleTargetIds[0] ?? b.frameworkBeatId!,
          isAmbiguous,
          possibleTargetIds,
          confirmedTargetId: possibleTargetIds[0] ?? b.frameworkBeatId!,
        } satisfies BeatRemapping
      })
  },
}))
