import { supabase } from '@/lib/supabase'
import type { Panel, ShotType, CameraMovement } from '@/types'

type PanelRow = {
  id: string
  scene_id: string
  number: number
  shot_type: ShotType
  movement: CameraMovement
  lens: number
  action_description: string
  dialogue_note: string
  duration_estimate: number
  sketch_storage_path: string | null
  needs_review: boolean
  created_at: string
  updated_at: string
}

const PANEL_COLUMNS =
  'id,scene_id,number,shot_type,movement,lens,action_description,dialogue_note,duration_estimate,sketch_storage_path,needs_review,created_at,updated_at'

const SKETCH_SIGNED_URL_TTL_SECONDS = 60 * 60

async function signSketchPaths(paths: string[]): Promise<Map<string, string>> {
  const signed = new Map<string, string>()
  if (paths.length === 0) return signed
  const { data, error } = await supabase.storage.from('sketches').createSignedUrls(paths, SKETCH_SIGNED_URL_TTL_SECONDS)
  if (error) throw error
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl)
  }
  return signed
}

function toPanel(row: PanelRow, sketchUrl: string | null): Panel {
  return {
    id: row.id,
    sceneId: row.scene_id,
    number: row.number,
    shotType: row.shot_type,
    movement: row.movement,
    lens: row.lens,
    actionDescription: row.action_description,
    dialogueNote: row.dialogue_note,
    durationEstimate: row.duration_estimate,
    sketchDataUrl: sketchUrl,
    needsReview: row.needs_review,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchPanelsForProject(projectId: string): Promise<Panel[]> {
  const { data, error } = await supabase
    .from('storyboard_panels')
    .select(`${PANEL_COLUMNS},scenes!inner(project_id)`)
    .eq('scenes.project_id', projectId)
    .order('number')
    .returns<(PanelRow & { scenes: { project_id: string } })[]>()
  if (error) throw error
  const rows = data ?? []

  const paths = rows.map((r) => r.sketch_storage_path).filter((p): p is string => !!p)
  const signedUrls = await signSketchPaths(paths)

  return rows.map((row) =>
    toPanel(row, row.sketch_storage_path ? signedUrls.get(row.sketch_storage_path) ?? null : null),
  )
}

export async function insertPanel(panel: Panel): Promise<void> {
  const { error } = await supabase.from('storyboard_panels').insert({
    id: panel.id,
    scene_id: panel.sceneId,
    number: panel.number,
    shot_type: panel.shotType,
    movement: panel.movement,
    lens: panel.lens,
    action_description: panel.actionDescription,
    dialogue_note: panel.dialogueNote,
    duration_estimate: panel.durationEstimate,
    needs_review: panel.needsReview,
  })
  if (error) throw error
}

export async function updatePanelRow(id: string, patch: Partial<Panel>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.number !== undefined) row.number = patch.number
  if (patch.shotType !== undefined) row.shot_type = patch.shotType
  if (patch.movement !== undefined) row.movement = patch.movement
  if (patch.lens !== undefined) row.lens = patch.lens
  if (patch.actionDescription !== undefined) row.action_description = patch.actionDescription
  if (patch.dialogueNote !== undefined) row.dialogue_note = patch.dialogueNote
  if (patch.durationEstimate !== undefined) row.duration_estimate = patch.durationEstimate
  if (patch.needsReview !== undefined) row.needs_review = patch.needsReview
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('storyboard_panels').update(row).eq('id', id)
  if (error) throw error
}

export async function deletePanelRow(id: string): Promise<void> {
  const { error } = await supabase.from('storyboard_panels').delete().eq('id', id)
  if (error) throw error
}

export interface RecentPanelActivity {
  id: string
  projectId: string
  projectTitle: string
  label: string
  updatedAt: string
}

type RecentPanelRow = {
  id: string
  number: number
  shot_type: ShotType
  updated_at: string
  scenes: { project_id: string; projects: { title: string } | null } | null
}

/** Most recently updated storyboard panels across all projects the current user can access, for the dashboard activity feed. */
export async function fetchRecentPanelActivity(limit = 4): Promise<RecentPanelActivity[]> {
  const { data, error } = await supabase
    .from('storyboard_panels')
    .select('id,number,shot_type,updated_at,scenes(project_id,projects(title))')
    .order('updated_at', { ascending: false })
    .limit(limit)
    .returns<RecentPanelRow[]>()
  if (error) throw error
  return (data ?? [])
    .filter((row) => row.scenes)
    .map((row) => ({
      id: row.id,
      projectId: row.scenes!.project_id,
      projectTitle: row.scenes!.projects?.title ?? '',
      label: `Panel ${String(row.number).padStart(2, '0')} — ${row.shot_type}`,
      updatedAt: row.updated_at,
    }))
}

/** Sketches live in the private `sketches` bucket at `<projectId>/<panelId>.png`; uploads overwrite in place. */
export async function uploadSketch(projectId: string, panelId: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob()
  const path = `${projectId}/${panelId}.png`
  const { error: uploadError } = await supabase.storage
    .from('sketches')
    .upload(path, blob, { upsert: true, contentType: 'image/png' })
  if (uploadError) throw uploadError
  const { error: updateError } = await supabase
    .from('storyboard_panels')
    .update({ sketch_storage_path: path })
    .eq('id', panelId)
  if (updateError) throw updateError
  return path
}
