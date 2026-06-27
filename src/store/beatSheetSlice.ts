import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BeatSheet, Beat, BeatFramework } from '@/types/beatsheet'
import type { BeatRemapping } from '@/types/framework'
import { FRAMEWORKS } from '@/utils/beatSheetFrameworks'
import { getConversionTargets } from '@/data/frameworkConversions'

interface BeatSheetState {
  beatSheets: Record<string, BeatSheet>

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

  buildRemappings: (projectId: string, toFramework: BeatFramework) => BeatRemapping[]
}

function recomputePercentages(beats: Beat[], totalPages: number): Beat[] {
  return beats.map(b => ({
    ...b,
    percentage: totalPages > 0 ? b.pageStart / totalPages : 0,
  }))
}

export const useBeatSheetStore = create<BeatSheetState>()(
  persist(
    (set, get) => ({
      beatSheets: {},

      createBeatSheet: (projectId, framework, totalPages, genre) => {
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
      },

      confirmFrameworkSwitch: (projectId, toFramework, remappings) => {
        set(s => {
          const sheet = s.beatSheets[projectId]
          if (!sheet) return s
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
            // Derive actKey from the new framework beat's act
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
    }),
    { name: 'makeframe-beatsheets' }
  )
)
