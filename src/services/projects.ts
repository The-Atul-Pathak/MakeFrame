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

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    format: (row.format as ProjectFormat) ?? null,
    genres: row.genres ?? [],
    logline: row.logline,
    thumbnailUrl: row.thumbnail_url,
    sceneCount: 0,
    draftNumber: row.draft_number,
    createdAt: row.created_at,
    lastEditedAt: row.updated_at,
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
    .select('id,title,format,genres,logline,thumbnail_url,draft_number,created_at,updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toProject)
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
      const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path)
      const bustedUrl = `${urlData.publicUrl}?v=${Date.now()}`
      await supabase.from('projects').update({ thumbnail_url: bustedUrl }).eq('id', id)
    }
  } else if (input.removeThumbnail) {
    await supabase.from('projects').update({ thumbnail_url: null }).eq('id', id)
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id,title,format,genres,logline,thumbnail_url,draft_number,created_at,updated_at')
    .eq('id', id)
    .single()

  if (error) throw error
  return toProject(data)
}

export async function fetchProjectById(id: string): Promise<Project> {
  await requireUser()
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,format,genres,logline,thumbnail_url,draft_number,created_at,updated_at')
    .eq('id', id)
    .single()
  if (error) throw error
  return toProject(data)
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
      const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path)
      await supabase
        .from('projects')
        .update({ thumbnail_url: urlData.publicUrl })
        .eq('id', projectId)
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id,title,format,genres,logline,thumbnail_url,draft_number,created_at,updated_at')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return toProject(data)
}
