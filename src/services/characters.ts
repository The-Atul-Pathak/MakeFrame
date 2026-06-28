import { supabase } from '@/lib/supabase'
import type { Character } from '@/types'

type CharacterRow = {
  id: string
  project_id: string
  name: string
  age: string | null
  occupation: string | null
  physical_description: string | null
  backstory: string | null
  want: string | null
  need: string | null
  wound: string | null
  ghost: string | null
  voice: string | null
  arc: string | null
  relationships: Record<string, string> | null
  first_appearance_scene_id: string | null
  total_scenes: number
  created_at: string
  updated_at: string
}

const CHARACTER_COLUMNS =
  'id,project_id,name,age,occupation,physical_description,backstory,want,need,wound,ghost,voice,arc,relationships,first_appearance_scene_id,total_scenes,created_at,updated_at'

function toCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    age: row.age ?? '',
    occupation: row.occupation ?? '',
    physicalDescription: row.physical_description ?? '',
    backstory: row.backstory ?? '',
    want: row.want ?? '',
    need: row.need ?? '',
    wound: row.wound ?? '',
    ghost: row.ghost ?? '',
    voice: row.voice ?? '',
    arc: row.arc ?? '',
    relationships: row.relationships ?? {},
    firstAppearanceSceneId: row.first_appearance_scene_id,
    totalScenes: row.total_scenes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchCharactersForProject(projectId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select(CHARACTER_COLUMNS)
    .eq('project_id', projectId)
    .order('name')
  if (error) throw error
  return (data ?? []).map(toCharacter)
}

export async function insertCharacter(character: Character): Promise<void> {
  const { error } = await supabase.from('characters').insert({
    id: character.id,
    project_id: character.projectId,
    name: character.name,
    age: character.age,
    occupation: character.occupation,
    physical_description: character.physicalDescription,
    backstory: character.backstory,
    want: character.want,
    need: character.need,
    wound: character.wound,
    ghost: character.ghost,
    voice: character.voice,
    arc: character.arc,
    relationships: character.relationships,
    first_appearance_scene_id: character.firstAppearanceSceneId,
    total_scenes: character.totalScenes,
  })
  if (error) throw error
}

export async function updateCharacterRow(id: string, patch: Partial<Character>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.age !== undefined) row.age = patch.age
  if (patch.occupation !== undefined) row.occupation = patch.occupation
  if (patch.physicalDescription !== undefined) row.physical_description = patch.physicalDescription
  if (patch.backstory !== undefined) row.backstory = patch.backstory
  if (patch.want !== undefined) row.want = patch.want
  if (patch.need !== undefined) row.need = patch.need
  if (patch.wound !== undefined) row.wound = patch.wound
  if (patch.ghost !== undefined) row.ghost = patch.ghost
  if (patch.voice !== undefined) row.voice = patch.voice
  if (patch.arc !== undefined) row.arc = patch.arc
  if (patch.relationships !== undefined) row.relationships = patch.relationships
  if (patch.firstAppearanceSceneId !== undefined) row.first_appearance_scene_id = patch.firstAppearanceSceneId
  if (patch.totalScenes !== undefined) row.total_scenes = patch.totalScenes
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('characters').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteCharacterRow(id: string): Promise<void> {
  const { error } = await supabase.from('characters').delete().eq('id', id)
  if (error) throw error
}
