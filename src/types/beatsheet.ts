export type BeatFramework =
  | 'save_the_cat'
  | 'three_act'
  | 'hero_journey'
  | 'story_circle'
  | 'seven_point'

export type EmotionalTone =
  | 'hopeful'
  | 'melancholic'
  | 'tense'
  | 'triumphant'
  | 'comedic'
  | 'tragic'
  | 'mysterious'
  | 'romantic'
  | 'action'
  | 'contemplative'
  | 'dark'
  | 'neutral'

export const EMOTIONAL_TONES: EmotionalTone[] = [
  'hopeful', 'melancholic', 'tense', 'triumphant', 'comedic',
  'tragic', 'mysterious', 'romantic', 'action', 'contemplative', 'dark', 'neutral',
]

export const TONE_COLOR_VAR: Record<EmotionalTone, string> = {
  hopeful:       'var(--color-success)',
  melancholic:   'var(--color-text-secondary)',
  tense:         'var(--color-warning)',
  triumphant:    'var(--color-accent)',
  comedic:       'var(--color-success)',
  tragic:        'var(--color-danger)',
  mysterious:    'var(--color-text-tertiary)',
  romantic:      'var(--color-warning)',
  action:        'var(--color-accent)',
  contemplative: 'var(--color-text-secondary)',
  dark:          'var(--color-danger)',
  neutral:       'var(--color-text-tertiary)',
}

export type BeatStatus = 'draft' | 'approved' | 'locked'

export interface Beat {
  id: string
  order: number
  name: string
  description: string
  pageStart: number
  pageEnd: number
  actKey: string
  frameworkBeatId?: string   // links to a specific slot in the active framework
  needsReview?: boolean      // flagged after an ambiguous framework conversion
  percentage: number
  emotionalTone: EmotionalTone | null
  characters: string[]
  location: string | null
  notes: string
  status: BeatStatus
}

export interface ActDefinition {
  key: string
  label: string
  beatOrders: number[]
  pageRange: [number, number]
}

export interface DefaultBeatTemplate {
  order: number
  name: string
  actKey: string
  pageStart: number
  pageEnd: number
  hint: string
}

export interface FrameworkDefinition {
  id: BeatFramework
  label: string
  description: string
  acts: ActDefinition[]
  defaultBeats: DefaultBeatTemplate[]
}

export interface BeatSheet {
  id: string
  projectId: string
  framework: BeatFramework
  totalPages: number
  genre: string | null
  beats: Beat[]
  createdAt: string
  updatedAt: string
}

export type ValidationSeverity = 'error' | 'warning'

export interface BeatValidationIssue {
  id: string
  beatId: string | null
  message: string
  severity: ValidationSeverity
}
