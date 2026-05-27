export type ProjectFormat =
  | 'Feature Film'
  | 'Short Film'
  | 'TV Episode'
  | 'TV Pilot'
  | 'Web Series'
  | 'Documentary'

export const PROJECT_FORMATS: ProjectFormat[] = [
  'Feature Film',
  'Short Film',
  'TV Episode',
  'TV Pilot',
  'Web Series',
  'Documentary',
]

export const GENRE_OPTIONS = [
  'Drama', 'Thriller', 'Sci-Fi', 'Comedy', 'Horror',
  'Action', 'Romance', 'Mystery', 'Fantasy', 'Animation',
  'Crime', 'Documentary',
]

export interface Project {
  id: string
  title: string
  format: ProjectFormat | null
  genres: string[]
  logline: string | null
  thumbnailUrl: string | null
  sceneCount: number
  draftNumber: number
  createdAt: string
  lastEditedAt: string
}
