import { create } from 'zustand'
import type { Character } from '@/types'
import * as charactersService from '@/services/characters'
import { useSyncStatusStore } from '@/store/syncStatusSlice'
import { debouncedPatch } from '@/utils/debouncedPersist'

interface CharacterState {
  characters: Character[]
  loadForProject: (projectId: string) => Promise<void>
  createCharacter: (projectId: string) => Character
  updateCharacter: (id: string, patch: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  getCharactersForProject: (projectId: string) => Character[]
}

function reportError(err: unknown) {
  useSyncStatusStore.getState().setError(err instanceof Error ? err.message : 'Failed to save changes.')
}

const defaultCharacter = (projectId: string): Character => ({
  id: crypto.randomUUID(),
  projectId,
  name: 'New Character',
  age: '',
  occupation: '',
  physicalDescription: '',
  backstory: '',
  want: '',
  need: '',
  wound: '',
  ghost: '',
  voice: '',
  arc: '',
  relationships: {},
  firstAppearanceSceneId: null,
  totalScenes: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const useCharacterStore = create<CharacterState>()((set, get) => ({
  characters: [],

  loadForProject: async (projectId) => {
    const fetched = await charactersService.fetchCharactersForProject(projectId)
    set((s) => ({ characters: [...s.characters.filter((c) => c.projectId !== projectId), ...fetched] }))
  },

  createCharacter: (projectId) => {
    const character = defaultCharacter(projectId)
    set(s => ({ characters: [...s.characters, character] }))
    charactersService.insertCharacter(character).catch(reportError)
    return character
  },

  updateCharacter: (id, patch) => {
    set(s => ({
      characters: s.characters.map(c =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      ),
    }))
    debouncedPatch(`character:${id}`, patch, (merged) => charactersService.updateCharacterRow(id, merged), reportError)
  },

  deleteCharacter: (id) => {
    set(s => ({ characters: s.characters.filter(c => c.id !== id) }))
    charactersService.deleteCharacterRow(id).catch(reportError)
  },

  getCharactersForProject: (projectId) =>
    get().characters.filter(c => c.projectId === projectId),
}))
