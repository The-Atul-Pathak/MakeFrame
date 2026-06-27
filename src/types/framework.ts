export type FrameworkId =
  | 'save_the_cat'
  | 'three_act'
  | 'hero_journey'
  | 'story_circle'
  | 'seven_point'

export interface FrameworkBeat {
  id: string
  label: string
  description: string
  example: string
  targetPageStart?: number
  targetPageEnd?: number
  actGroup: 'I' | 'II' | 'III'
}

export interface Framework {
  id: FrameworkId
  name: string
  description: string
  author: string
  beats: FrameworkBeat[]
  visualShape: 'timeline' | 'columns' | 'circle' | 'diamond'
  totalBeats: number
}

export interface SceneBeatAssignment {
  sceneId: string
  frameworkId: FrameworkId
  beatId: string
  isManualOverride: boolean
  needsReview: boolean
}

export interface BeatRemapping {
  userBeatId: string
  currentFrameworkBeatId: string | undefined
  proposedFrameworkBeatId: string
  isAmbiguous: boolean
  possibleTargetIds: string[]
  confirmedTargetId: string
}
