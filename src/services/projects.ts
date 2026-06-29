import { supabase } from '@/lib/supabase'
import type { Project, ProjectFormat } from '@/types/project'

type ProjectRow = {
  id: string
  title: string
  format: string | null
  genres: string[]
  logline: string | null
  thumbnail_url: string | null
  draft_number: number
  created_at: string
  updated_at: string
}

const PROJECT_COLUMNS = 'id,title,format,genres,logline,thumbnail_url,draft_number,created_at,updated_at'
const THUMBNAIL_SIGNED_URL_TTL_SECONDS = 60 * 60

// `thumbnail_url` stores a path within the private `thumbnails` bucket, not a
// usable URL — sign it at read time. (Column name predates the bucket going private.)
async function signThumbnailPath(path: string | null): Promise<string | null> {
  if (!path) return null
  const { data, error } = await supabase.storage.from('thumbnails').createSignedUrl(path, THUMBNAIL_SIGNED_URL_TTL_SECONDS)
  if (error) return null
  return data.signedUrl
}

async function signThumbnailPaths(paths: string[]): Promise<Map<string, string>> {
  const signed = new Map<string, string>()
  const uniquePaths = [...new Set(paths)]
  if (uniquePaths.length === 0) return signed
  const { data, error } = await supabase.storage.from('thumbnails').createSignedUrls(uniquePaths, THUMBNAIL_SIGNED_URL_TTL_SECONDS)
  if (error) return signed
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl)
  }
  return signed
}

function toProject(
  row: ProjectRow,
  thumbnailUrl: string | null,
  counts?: { sceneCount: number; panelCount: number; shotCount: number },
): Project {
  return {
    id: row.id,
    title: row.title,
    format: (row.format as ProjectFormat) ?? null,
    genres: row.genres ?? [],
    logline: row.logline,
    thumbnailUrl,
    sceneCount: counts?.sceneCount ?? 0,
    panelCount: counts?.panelCount ?? 0,
    shotCount: counts?.shotCount ?? 0,
    draftNumber: row.draft_number,
    createdAt: row.created_at,
    lastEditedAt: row.updated_at,
  }
}

/** Tallies rows per project_id from a flat list — used to turn per-row fetches into counts. */
function tallyByProjectId(rows: { project_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1)
  }
  return counts
}

async function fetchContentCounts(projectIds: string[]) {
  if (projectIds.length === 0) {
    return { sceneCounts: new Map<string, number>(), panelCounts: new Map<string, number>(), shotCounts: new Map<string, number>() }
  }

  const [scenesRes, shotsRes, panelsRes] = await Promise.all([
    supabase.from('scenes').select('project_id').in('project_id', projectIds),
    supabase.from('shots').select('project_id').in('project_id', projectIds),
    supabase
      .from('storyboard_panels')
      .select('scenes!inner(project_id)')
      .in('scenes.project_id', projectIds)
      .returns<{ scenes: { project_id: string } }[]>(),
  ])
  if (scenesRes.error) throw scenesRes.error
  if (shotsRes.error) throw shotsRes.error
  if (panelsRes.error) throw panelsRes.error

  return {
    sceneCounts: tallyByProjectId(scenesRes.data ?? []),
    shotCounts: tallyByProjectId(shotsRes.data ?? []),
    panelCounts: tallyByProjectId((panelsRes.data ?? []).map((r) => ({ project_id: r.scenes.project_id }))),
  }
}

/**
 * Confirms a real (non-anonymous) signed-in user before talking to Supabase.
 * `ProtectedRoute` is the primary gate — this is defense-in-depth so a stale
 * client-side session produces a clear error instead of an opaque RLS denial.
 * Uses `getUser()` rather than `getSession()` because it round-trips to the
 * Auth server and verifies the JWT instead of trusting the local copy.
 */
async function requireUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('You must be signed in to do that.')
  return data.user
}

export async function fetchProjects(): Promise<Project[]> {
  await requireUser()

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_COLUMNS)
    .order('updated_at', { ascending: false })

  if (error) throw error
  const rows = data ?? []

  const [counts, signedThumbnails] = await Promise.all([
    fetchContentCounts(rows.map((r) => r.id)),
    signThumbnailPaths(rows.map((r) => r.thumbnail_url).filter((p): p is string => !!p)),
  ])

  return rows.map((row) =>
    toProject(row, row.thumbnail_url ? signedThumbnails.get(row.thumbnail_url) ?? null : null, {
      sceneCount: counts.sceneCounts.get(row.id) ?? 0,
      panelCount: counts.panelCounts.get(row.id) ?? 0,
      shotCount: counts.shotCounts.get(row.id) ?? 0,
    }),
  )
}

export interface SaveProjectInput {
  title: string
  format: ProjectFormat | null
  logline: string
  genres: string[]
  thumbnailFile: File | null
  removeThumbnail?: boolean
}

export async function updateProject(id: string, input: SaveProjectInput): Promise<Project> {
  await requireUser()

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      title: input.title,
      format: input.format ?? null,
      logline: input.logline || null,
      genres: input.genres,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) throw updateError

  if (input.thumbnailFile) {
    const ext = input.thumbnailFile.name.split('.').pop() ?? 'jpg'
    const path = `${id}/thumbnail.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(path, input.thumbnailFile, { upsert: true })

    if (!uploadError) {
      await supabase.from('projects').update({ thumbnail_url: path }).eq('id', id)
    }
  } else if (input.removeThumbnail) {
    await supabase.from('projects').update({ thumbnail_url: null }).eq('id', id)
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_COLUMNS)
    .eq('id', id)
    .single()

  if (error) throw error
  const [counts, thumbnailUrl] = await Promise.all([
    fetchContentCounts([data.id]),
    signThumbnailPath(data.thumbnail_url),
  ])
  return toProject(data, thumbnailUrl, {
    sceneCount: counts.sceneCounts.get(data.id) ?? 0,
    panelCount: counts.panelCounts.get(data.id) ?? 0,
    shotCount: counts.shotCounts.get(data.id) ?? 0,
  })
}

export async function fetchProjectById(id: string): Promise<Project> {
  await requireUser()
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_COLUMNS)
    .eq('id', id)
    .single()
  if (error) throw error
  const [counts, thumbnailUrl] = await Promise.all([
    fetchContentCounts([data.id]),
    signThumbnailPath(data.thumbnail_url),
  ])
  return toProject(data, thumbnailUrl, {
    sceneCount: counts.sceneCounts.get(data.id) ?? 0,
    panelCount: counts.panelCounts.get(data.id) ?? 0,
    shotCount: counts.shotCounts.get(data.id) ?? 0,
  })
}

export async function saveProject(input: SaveProjectInput): Promise<Project> {
  const user = await requireUser()
  const projectId = crypto.randomUUID()

  const { error: insertError } = await supabase
    .from('projects')
    .insert({
      id: projectId,
      owner_id: user.id,
      title: input.title,
      format: input.format ?? null,
      logline: input.logline || null,
      genres: input.genres,
    })

  if (insertError) throw insertError

  // Upload thumbnail after project exists (storage RLS checks ownership)
  if (input.thumbnailFile) {
    const ext = input.thumbnailFile.name.split('.').pop() ?? 'jpg'
    const path = `${projectId}/thumbnail.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(path, input.thumbnailFile, { upsert: true })

    if (!uploadError) {
      await supabase.from('projects').update({ thumbnail_url: path }).eq('id', projectId)
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_COLUMNS)
    .eq('id', projectId)
    .single()

  if (error) throw error
  const thumbnailUrl = await signThumbnailPath(data.thumbnail_url)
  return toProject(data, thumbnailUrl, { sceneCount: 0, panelCount: 0, shotCount: 0 })
}
