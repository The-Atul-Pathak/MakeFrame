import { supabase } from '@/lib/supabase'
import type { Scene, ScreenplayElement, ScreenplayElementType, IntExt, TimeOfDay, ActNumber } from '@/types'

// The `int_ext`/`time_of_day` Postgres enums predate the client's display-style
// values (slash/space vs underscore) — translate at the boundary.
const INT_EXT_TO_DB: Record<IntExt, string> = { INT: 'INT', EXT: 'EXT', 'INT/EXT': 'INT_EXT' }
const INT_EXT_FROM_DB: Record<string, IntExt> = { INT: 'INT', EXT: 'EXT', INT_EXT: 'INT/EXT' }
const TIME_OF_DAY_TO_DB: Record<TimeOfDay, string> = {
  DAY: 'DAY', NIGHT: 'NIGHT', DAWN: 'DAWN', DUSK: 'DUSK',
  CONTINUOUS: 'CONTINUOUS', LATER: 'LATER', 'MOMENTS LATER': 'MOMENTS_LATER',
}
const TIME_OF_DAY_FROM_DB: Record<string, TimeOfDay> = {
  DAY: 'DAY', NIGHT: 'NIGHT', DAWN: 'DAWN', DUSK: 'DUSK',
  CONTINUOUS: 'CONTINUOUS', LATER: 'LATER', MOMENTS_LATER: 'MOMENTS LATER',
}

type SceneRow = {
  id: string
  project_id: string
  number: number
  int_ext: string
  location: string
  time_of_day: string
  act: ActNumber
  page_start: number
  page_length: string
  characters: string[] | null
  props: string[] | null
  special_requirements: string[] | null
  emotional_tone: string | null
  needs_review: boolean
  created_at: string
  updated_at: string
}

type ElementRow = {
  id: string
  scene_id: string
  type: string
  text: string
  order: number
}

const SCENE_COLUMNS =
  'id,project_id,number,int_ext,location,time_of_day,act,page_start,page_length,characters,props,special_requirements,emotional_tone,needs_review,created_at,updated_at'
const ELEMENT_COLUMNS = 'id,scene_id,type,text,order'

function toScene(row: SceneRow, elements: ScreenplayElement[]): Scene {
  return {
    id: row.id,
    projectId: row.project_id,
    number: row.number,
    intExt: INT_EXT_FROM_DB[row.int_ext] ?? 'INT',
    location: row.location,
    timeOfDay: TIME_OF_DAY_FROM_DB[row.time_of_day] ?? 'DAY',
    act: row.act,
    pageStart: row.page_start,
    pageLength: row.page_length,
    characters: row.characters ?? [],
    props: row.props ?? [],
    specialRequirements: row.special_requirements ?? [],
    emotionalTone: row.emotional_tone ?? '',
    elements,
    needsReview: row.needs_review,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toElement(row: ElementRow): ScreenplayElement {
  return { id: row.id, type: row.type as ScreenplayElementType, text: row.text }
}

export async function fetchScenesForProject(projectId: string): Promise<Scene[]> {
  const { data: sceneRows, error: sceneError } = await supabase
    .from('scenes')
    .select(SCENE_COLUMNS)
    .eq('project_id', projectId)
    .order('number')
  if (sceneError) throw sceneError
  if (!sceneRows || sceneRows.length === 0) return []

  const sceneIds = sceneRows.map((r) => r.id)
  const { data: elementRows, error: elementError } = await supabase
    .from('screenplay_elements')
    .select(ELEMENT_COLUMNS)
    .in('scene_id', sceneIds)
    .order('order')
  if (elementError) throw elementError

  const elementsBySceneId = new Map<string, ScreenplayElement[]>()
  for (const row of elementRows ?? []) {
    const list = elementsBySceneId.get(row.scene_id) ?? []
    list.push(toElement(row))
    elementsBySceneId.set(row.scene_id, list)
  }

  return sceneRows.map((row) => toScene(row, elementsBySceneId.get(row.id) ?? []))
}

export async function insertScene(scene: Scene): Promise<void> {
  const { error } = await supabase.from('scenes').insert({
    id: scene.id,
    project_id: scene.projectId,
    number: scene.number,
    int_ext: INT_EXT_TO_DB[scene.intExt],
    location: scene.location,
    time_of_day: TIME_OF_DAY_TO_DB[scene.timeOfDay],
    act: scene.act,
    page_start: scene.pageStart,
    page_length: scene.pageLength,
    characters: scene.characters,
    props: scene.props,
    special_requirements: scene.specialRequirements,
    emotional_tone: scene.emotionalTone || null,
    needs_review: scene.needsReview,
  })
  if (error) throw error
}

function sceneColumnPatch(patch: Partial<Scene>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (patch.number !== undefined) row.number = patch.number
  if (patch.intExt !== undefined) row.int_ext = INT_EXT_TO_DB[patch.intExt]
  if (patch.location !== undefined) row.location = patch.location
  if (patch.timeOfDay !== undefined) row.time_of_day = TIME_OF_DAY_TO_DB[patch.timeOfDay]
  if (patch.act !== undefined) row.act = patch.act
  if (patch.pageStart !== undefined) row.page_start = patch.pageStart
  if (patch.pageLength !== undefined) row.page_length = patch.pageLength
  if (patch.characters !== undefined) row.characters = patch.characters
  if (patch.props !== undefined) row.props = patch.props
  if (patch.specialRequirements !== undefined) row.special_requirements = patch.specialRequirements
  if (patch.emotionalTone !== undefined) row.emotional_tone = patch.emotionalTone || null
  if (patch.needsReview !== undefined) row.needs_review = patch.needsReview
  return row
}

export async function updateSceneRow(id: string, patch: Partial<Scene>): Promise<void> {
  const row = sceneColumnPatch(patch)
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('scenes').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteSceneRow(id: string): Promise<void> {
  const { error } = await supabase.from('scenes').delete().eq('id', id)
  if (error) throw error
}

export interface RecentSceneActivity {
  id: string
  projectId: string
  projectTitle: string
  label: string
  updatedAt: string
}

type RecentSceneRow = {
  id: string
  project_id: string
  int_ext: IntExt
  location: string
  time_of_day: TimeOfDay
  updated_at: string
  projects: { title: string } | null
}

/** Most recently updated scenes across all projects the current user can access, for the dashboard activity feed. */
export async function fetchRecentSceneActivity(limit = 4): Promise<RecentSceneActivity[]> {
  const { data, error } = await supabase
    .from('scenes')
    .select('id,project_id,int_ext,location,time_of_day,updated_at,projects(title)')
    .order('updated_at', { ascending: false })
    .limit(limit)
    .returns<RecentSceneRow[]>()
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    projectTitle: row.projects?.title ?? '',
    label: `${row.int_ext}. ${row.location} — ${row.time_of_day}`,
    updatedAt: row.updated_at,
  }))
}

export async function insertElement(
  projectId: string,
  sceneId: string,
  element: ScreenplayElement,
  order: number,
): Promise<void> {
  const { error } = await supabase.from('screenplay_elements').insert({
    id: element.id,
    project_id: projectId,
    scene_id: sceneId,
    type: element.type,
    text: element.text,
    order,
  })
  if (error) throw error
}

export async function updateElementRow(id: string, patch: Partial<ScreenplayElement>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.type !== undefined) row.type = patch.type
  if (patch.text !== undefined) row.text = patch.text
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('screenplay_elements').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteElementRow(id: string): Promise<void> {
  const { error } = await supabase.from('screenplay_elements').delete().eq('id', id)
  if (error) throw error
}

/** Full replace of a scene's elements — used for reordering and mid-list inserts. */
export async function replaceElementsForScene(
  projectId: string,
  sceneId: string,
  elements: ScreenplayElement[],
): Promise<void> {
  const { error: deleteError } = await supabase.from('screenplay_elements').delete().eq('scene_id', sceneId)
  if (deleteError) throw deleteError
  if (elements.length === 0) return

  const { error: insertError } = await supabase.from('screenplay_elements').insert(
    elements.map((el, idx) => ({
      id: el.id,
      project_id: projectId,
      scene_id: sceneId,
      type: el.type,
      text: el.text,
      order: idx + 1,
    })),
  )
  if (insertError) throw insertError
}
