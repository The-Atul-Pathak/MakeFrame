// ── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

// ── Screenplay ───────────────────────────────────────────────────────────────

export type ScreenplayElementType =
  | 'scene-heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'

export interface ScreenplayElement {
  id: string
  type: ScreenplayElementType
  text: string
}

export type TimeOfDay = 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK' | 'CONTINUOUS' | 'LATER' | 'MOMENTS LATER'
export type IntExt = 'INT' | 'EXT' | 'INT/EXT'
export type ActNumber = 1 | 2 | 3

export interface Scene {
  id: string
  projectId: string
  number: number
  intExt: IntExt
  location: string
  timeOfDay: TimeOfDay
  act: ActNumber
  pageStart: number
  pageLength: string            // e.g. "1/8", "4/8", "1", "1 2/8"
  characters: string[]
  props: string[]
  specialRequirements: string[]
  emotionalTone: string
  elements: ScreenplayElement[]
  needsReview: boolean
  createdAt: string
  updatedAt: string
}

// ── Storyboard ───────────────────────────────────────────────────────────────

export type ShotType = 'EWS' | 'WS' | 'MS' | 'MCU' | 'CU' | 'ECU' | 'OTS' | 'POV' | 'INSERT' | 'TWO'

export type CameraMovement =
  | 'Static'
  | 'Pan'
  | 'Tilt'
  | 'Dolly'
  | 'Track'
  | 'Crane/Jib'
  | 'Handheld'
  | 'Steadicam'
  | 'Rack Focus'
  | 'Zoom'

export interface Panel {
  id: string
  sceneId: string
  number: number              // sequential within scene
  shotType: ShotType
  movement: CameraMovement
  lens: number                // focal length in mm
  actionDescription: string   // 1–2 sentences
  dialogueNote: string
  durationEstimate: number    // seconds
  sketchDataUrl: string | null
  needsReview: boolean
  createdAt: string
  updatedAt: string
}

// ── Shot List ────────────────────────────────────────────────────────────────

export interface Shot {
  id: string
  projectId: string
  sceneId: string
  panelId: string | null
  shotNumber: number          // sequential for the shoot day
  intExt: IntExt
  location: string
  shotType: ShotType
  movement: CameraMovement
  lens: number
  description: string
  cast: string[]
  specialEquipment: string
  estimatedSetupMinutes: number
  notes: string
  needsReview: boolean
  createdAt: string
  updatedAt: string
}

// ── Character ────────────────────────────────────────────────────────────────

export interface Character {
  id: string
  projectId: string
  name: string
  age: string
  occupation: string
  physicalDescription: string
  backstory: string
  want: string
  need: string
  wound: string
  ghost: string
  voice: string
  arc: string
  relationships: Record<string, string>  // characterId → dynamic description
  firstAppearanceSceneId: string | null
  totalScenes: number
  createdAt: string
  updatedAt: string
}

// ── UI state (not persisted) ─────────────────────────────────────────────────

export type ActiveView = 'screenplay' | 'storyboard' | 'shotlist' | 'characters'

export interface UIState {
  activeView: ActiveView
  activeSceneId: string | null
  activePanelId: string | null
}
