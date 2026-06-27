import type { Project } from '@/types/project'
import BeatSheetComponent from '@/components/beat/BeatSheet'

interface Props {
  project: Project
}

export default function BeatSheet({ project }: Props) {
  return <BeatSheetComponent project={project} />
}
