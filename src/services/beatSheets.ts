import { supabase } from '@/lib/supabase'
import type { Beat, BeatSheet, BeatFramework, EmotionalTone, BeatStatus } from '@/types/beatsheet'

type BeatSheetRow = {
  id: string
  project_id: string
  framework: BeatFramework
  total_pages: number
  genre: string | null
  created_at: string
  updated_at: string
}

type BeatRow = {
  id: string
  beat_sheet_id: string
  order: number
  name: string
  description: string
  page_start: number
  page_end: number
  act_key: string
  framework_beat_id: string | null
  needs_review: boolean
  percentage: number
  emotional_tone: EmotionalTone | null
  characters: string[] | null
  location: string | null
  notes: string
  status: BeatStatus
}

const BEAT_SHEET_COLUMNS = 'id,project_id,framework,total_pages,genre,created_at,updated_at'
const BEAT_COLUMNS =
  'id,beat_sheet_id,order,name,description,page_start,page_end,act_key,framework_beat_id,needs_review,percentage,emotional_tone,characters,location,notes,status'

function toBeat(row: BeatRow): Beat {
  return {
    id: row.id,
    order: row.order,
    name: row.name,
    description: row.description,
    pageStart: row.page_start,
    pageEnd: row.page_end,
    actKey: row.act_key,
    frameworkBeatId: row.framework_beat_id ?? undefined,
    needsReview: row.needs_review,
    percentage: row.percentage,
    emotionalTone: row.emotional_tone,
    characters: row.characters ?? [],
    location: row.location,
    notes: row.notes,
    status: row.status,
  }
}

function toBeatSheet(row: BeatSheetRow, beats: Beat[]): BeatSheet {
  return {
    id: row.id,
    projectId: row.project_id,
    framework: row.framework,
    totalPages: row.total_pages,
    genre: row.genre,
    beats,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchBeatSheetForProject(projectId: string): Promise<BeatSheet | null> {
  const { data: sheetRow, error: sheetError } = await supabase
    .from('beat_sheets')
    .select(BEAT_SHEET_COLUMNS)
    .eq('project_id', projectId)
    .maybeSingle()
  if (sheetError) throw sheetError
  if (!sheetRow) return null

  const { data: beatRows, error: beatError } = await supabase
    .from('beats')
    .select(BEAT_COLUMNS)
    .eq('beat_sheet_id', sheetRow.id)
    .order('order')
  if (beatError) throw beatError

  return toBeatSheet(sheetRow, (beatRows ?? []).map(toBeat))
}

export async function insertBeatSheet(sheet: BeatSheet): Promise<void> {
  const { error } = await supabase.from('beat_sheets').insert({
    id: sheet.id,
    project_id: sheet.projectId,
    framework: sheet.framework,
    total_pages: sheet.totalPages,
    genre: sheet.genre,
  })
  if (error) throw error
}

export async function updateBeatSheetRow(
  id: string,
  patch: Partial<Pick<BeatSheet, 'framework' | 'totalPages' | 'genre'>>,
): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.framework !== undefined) row.framework = patch.framework
  if (patch.totalPages !== undefined) row.total_pages = patch.totalPages
  if (patch.genre !== undefined) row.genre = patch.genre
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('beat_sheets').update(row).eq('id', id)
  if (error) throw error
}

export async function insertBeat(beatSheetId: string, beat: Beat): Promise<void> {
  const { error } = await supabase.from('beats').insert({
    id: beat.id,
    beat_sheet_id: beatSheetId,
    order: Math.round(beat.order),
    name: beat.name,
    description: beat.description,
    page_start: beat.pageStart,
    page_end: beat.pageEnd,
    act_key: beat.actKey,
    framework_beat_id: beat.frameworkBeatId ?? null,
    needs_review: beat.needsReview ?? false,
    percentage: beat.percentage,
    emotional_tone: beat.emotionalTone,
    characters: beat.characters,
    location: beat.location,
    notes: beat.notes,
    status: beat.status,
  })
  if (error) throw error
}

export async function updateBeatRow(id: string, patch: Partial<Beat>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.description !== undefined) row.description = patch.description
  if (patch.pageStart !== undefined) row.page_start = patch.pageStart
  if (patch.pageEnd !== undefined) row.page_end = patch.pageEnd
  if (patch.actKey !== undefined) row.act_key = patch.actKey
  if (patch.frameworkBeatId !== undefined) row.framework_beat_id = patch.frameworkBeatId ?? null
  if (patch.needsReview !== undefined) row.needs_review = patch.needsReview
  if (patch.percentage !== undefined) row.percentage = patch.percentage
  if (patch.emotionalTone !== undefined) row.emotional_tone = patch.emotionalTone
  if (patch.characters !== undefined) row.characters = patch.characters
  if (patch.location !== undefined) row.location = patch.location
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.status !== undefined) row.status = patch.status
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('beats').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteBeatRow(id: string): Promise<void> {
  const { error } = await supabase.from('beats').delete().eq('id', id)
  if (error) throw error
}

/**
 * Beats' `order` column is a unique-per-sheet integer, but the in-memory store uses
 * fractional ordering for O(1) drag-and-drop reorders. Renumber the whole sheet to
 * sequential integers and write them as one upsert — a single SQL command, so the
 * unique constraint only sees the final values, not the swap in progress.
 */
export async function persistBeatOrder(beatsInOrder: { id: string; order: number }[]): Promise<void> {
  if (beatsInOrder.length === 0) return
  const { error } = await supabase
    .from('beats')
    .upsert(
      beatsInOrder.map((b, idx) => ({ id: b.id, order: idx + 1 })),
      { onConflict: 'id' },
    )
  if (error) throw error
}

export async function confirmFrameworkSwitchRemote(
  projectId: string,
  toFramework: BeatFramework,
  remappings: { userBeatId: string; confirmedTargetId: string; isAmbiguous: boolean; actKey?: string }[],
): Promise<void> {
  const { error } = await supabase.rpc('confirm_beat_sheet_framework_switch', {
    p_project_id: projectId,
    p_to_framework: toFramework,
    p_remappings: remappings,
  })
  if (error) throw error
}
