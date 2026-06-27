import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from '@/types'

interface CharacterState {
  characters: Character[]
  createCharacter: (projectId: string) => Character
  updateCharacter: (id: string, patch: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  getCharactersForProject: (projectId: string) => Character[]
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

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],

      createCharacter: (projectId) => {
        const character = defaultCharacter(projectId)
        set(s => ({ characters: [...s.characters, character] }))
        return character
      },

      updateCharacter: (id, patch) =>
        set(s => ({
          characters: s.characters.map(c =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCharacter: (id) =>
        set(s => ({ characters: s.characters.filter(c => c.id !== id) })),

      getCharactersForProject: (projectId) =>
        get().characters.filter(c => c.projectId === projectId),
    }),
    { name: 'makeframe-characters' }
  )
)
