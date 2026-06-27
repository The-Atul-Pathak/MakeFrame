import type { Framework } from '@/types/framework'

export function autoAssignToFrameworkBeat(
  pageStart: number,
  totalPages: number,
  framework: Framework
): string | undefined {
  const { beats } = framework

  // For Save the Cat and Hero's Journey: match by explicit page targets
  if (framework.visualShape === 'timeline') {
    const beatsWithTargets = beats.filter(
      b => b.targetPageStart !== undefined && b.targetPageEnd !== undefined
    )

    if (beatsWithTargets.length > 0) {
      // Find beat whose target range contains the page
      const inRange = beatsWithTargets.find(
        b => pageStart >= b.targetPageStart! && pageStart <= b.targetPageEnd!
      )
      if (inRange) return inRange.id

      // Fallback: closest beat by midpoint distance
      let closest = beatsWithTargets[0]
      let minDist = Infinity
      for (const b of beatsWithTargets) {
        const mid = (b.targetPageStart! + b.targetPageEnd!) / 2
        const dist = Math.abs(pageStart - mid)
        if (dist < minDist) { minDist = dist; closest = b }
      }
      return closest?.id
    }
  }

  // For all other frameworks: divide total pages equally among beats
  if (totalPages <= 0 || beats.length === 0) return beats[0]?.id
  const segmentSize = totalPages / beats.length
  const idx = Math.min(
    Math.floor(pageStart / segmentSize),
    beats.length - 1
  )
  return beats[idx]?.id
}

export function autoAssignActGroup(
  pageStart: number,
  totalPages: number
): 'I' | 'II' | 'III' {
  const pct = totalPages > 0 ? pageStart / totalPages : 0
  if (pct <= 0.25) return 'I'
  if (pct <= 0.85) return 'II'
  return 'III'
}
