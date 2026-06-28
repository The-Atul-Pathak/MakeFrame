import { supabase } from '@/lib/supabase'
import type { Shot, ShotType } from '@/types'

// The `int_ext`/`camera_movement` Postgres enums predate the client's display-style
// values (slash/TitleCase vs underscore/lowercase) — translate at the boundary.
const INT_EXT_TO_DB: Record<string, string> = { INT: 'INT', EXT: 'EXT', 'INT/EXT': 'INT_EXT' }
const INT_EXT_FROM_DB: Record<string, string> = { INT: 'INT', EXT: 'EXT', INT_EXT: 'INT/EXT' }
const MOVEMENT_TO_DB: Record<string, string> = {
  Static: 'static', Pan: 'pan', Tilt: 'tilt', Dolly: 'dolly', Track: 'track',
  'Crane/Jib': 'crane', Handheld: 'handheld', Steadicam: 'steadicam',
  'Rack Focus': 'rack_focus', Zoom: 'zoom',
}
const MOVEMENT_FROM_DB: Record<string, string> = {
  static: 'Static', pan: 'Pan', tilt: 'Tilt', dolly: 'Dolly', track: 'Track',
  crane: 'Crane/Jib', handheld: 'Handheld', steadicam: 'Steadicam',
  rack_focus: 'Rack Focus', zoom: 'Zoom',
}

type ShotRow = {
  id: string
  project_id: string
  scene_id: string | null
  panel_id: string | null
  shot_number: number
  int_ext: string
  location: string
  shot_type: ShotType
  movement: string
  lens: number
  description: string
  cast: string[] | null
  special_equipment: string
  estimated_setup_minutes: number
  notes: string
  needs_review: boolean
  created_at: string
  updated_at: string
}

const SHOT_COLUMNS =
  'id,project_id,scene_id,panel_id,shot_number,int_ext,location,shot_type,movement,lens,description,cast,special_equipment,estimated_setup_minutes,notes,needs_review,created_at,updated_at'

function toShot(row: ShotRow): Shot {
  return {
    id: row.id,
    projectId: row.project_id,
    sceneId: row.scene_id ?? '',
    panelId: row.panel_id,
    shotNumber: row.shot_number,
    intExt: (INT_EXT_FROM_DB[row.int_ext] ?? 'INT') as Shot['intExt'],
    location: row.location,
    shotType: row.shot_type,
    movement: (MOVEMENT_FROM_DB[row.movement] ?? 'Static') as Shot['movement'],
    lens: row.lens,
    description: row.description,
    cast: row.cast ?? [],
    specialEquipment: row.special_equipment,
    estimatedSetupMinutes: row.estimated_setup_minutes,
    notes: row.notes,
    needsReview: row.needs_review,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchShotsForProject(projectId: string): Promise<Shot[]> {
  const { data, error } = await supabase
    .from('shots')
    .select(SHOT_COLUMNS)
    .eq('project_id', projectId)
    .order('shot_number')
  if (error) throw error
  return (data ?? []).map(toShot)
}

export async function insertShot(shot: Shot): Promise<void> {
  const { error } = await supabase.from('shots').insert({
    id: shot.id,
    project_id: shot.projectId,
    scene_id: shot.sceneId || null,
    panel_id: shot.panelId,
    shot_number: shot.shotNumber,
    int_ext: INT_EXT_TO_DB[shot.intExt],
    location: shot.location,
    shot_type: shot.shotType,
    movement: MOVEMENT_TO_DB[shot.movement],
    lens: shot.lens,
    description: shot.description,
    cast: shot.cast,
    special_equipment: shot.specialEquipment,
    estimated_setup_minutes: shot.estimatedSetupMinutes,
    notes: shot.notes,
    needs_review: shot.needsReview,
  })
  if (error) throw error
}

export async function updateShotRow(id: string, patch: Partial<Shot>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.sceneId !== undefined) row.scene_id = patch.sceneId || null
  if (patch.panelId !== undefined) row.panel_id = patch.panelId
  if (patch.shotNumber !== undefined) row.shot_number = patch.shotNumber
  if (patch.intExt !== undefined) row.int_ext = INT_EXT_TO_DB[patch.intExt]
  if (patch.location !== undefined) row.location = patch.location
  if (patch.shotType !== undefined) row.shot_type = patch.shotType
  if (patch.movement !== undefined) row.movement = MOVEMENT_TO_DB[patch.movement]
  if (patch.lens !== undefined) row.lens = patch.lens
  if (patch.description !== undefined) row.description = patch.description
  if (patch.cast !== undefined) row.cast = patch.cast
  if (patch.specialEquipment !== undefined) row.special_equipment = patch.specialEquipment
  if (patch.estimatedSetupMinutes !== undefined) row.estimated_setup_minutes = patch.estimatedSetupMinutes
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.needsReview !== undefined) row.needs_review = patch.needsReview
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('shots').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteShotRow(id: string): Promise<void> {
  const { error } = await supabase.from('shots').delete().eq('id', id)
  if (error) throw error
}
