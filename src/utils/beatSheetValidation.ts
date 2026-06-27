import type { BeatSheet, BeatValidationIssue } from '@/types/beatsheet'

export function validateBeatSheet(sheet: BeatSheet): BeatValidationIssue[] {
  const issues: BeatValidationIssue[] = []
  const { beats, totalPages, framework } = sheet

  if (beats.length === 0) return issues

  // ── Save the Cat specific checks ──────────────────────────────────────────
  if (framework === 'save_the_cat') {
    const catalyst = beats.find(b => b.name === 'Catalyst')
    if (catalyst && catalyst.pageStart > 15) {
      issues.push({
        id: 'catalyst_late',
        beatId: catalyst.id,
        message: `Catalyst lands on page ${catalyst.pageStart} — inciting incidents after page 15 risk losing the audience early.`,
        severity: 'warning',
      })
    }

    const allIsLost = beats.find(b => b.name === 'All Is Lost')
    if (allIsLost) {
      const pct = allIsLost.pageStart / totalPages
      if (pct < 0.68 || pct > 0.82) {
        issues.push({
          id: 'all_is_lost_position',
          beatId: allIsLost.id,
          message: `"All Is Lost" at ${Math.round(pct * 100)}% — should be close to 75% for correct third-act timing.`,
          severity: 'warning',
        })
      }
    }

    const bStory = beats.find(b => b.name === 'B Story')
    if (bStory && !bStory.description.trim()) {
      issues.push({
        id: 'no_b_story',
        beatId: bStory.id,
        message: 'B Story has no description — the theme may feel unearned at the resolution.',
        severity: 'warning',
      })
    }

    const openingImage = beats.find(b => b.name === 'Opening Image')
    const finalImage   = beats.find(b => b.name === 'Final Image')
    if (
      openingImage?.emotionalTone &&
      finalImage?.emotionalTone &&
      openingImage.emotionalTone === finalImage.emotionalTone
    ) {
      issues.push({
        id: 'no_transformation',
        beatId: null,
        message: `Opening Image and Final Image share the same tone (${openingImage.emotionalTone}) — no transformation is shown.`,
        severity: 'warning',
      })
    }

    const midpoint = beats.find(b => b.name === 'Midpoint')
    if (midpoint) {
      const pct = midpoint.pageStart / totalPages
      if (pct < 0.45 || pct > 0.58) {
        issues.push({
          id: 'midpoint_position',
          beatId: midpoint.id,
          message: `Midpoint at ${Math.round(pct * 100)}% — optimal range is 45–58% for balanced pacing.`,
          severity: 'warning',
        })
      }
    }
  }

  // ── Generic checks ────────────────────────────────────────────────────────
  const allCharacters = beats.flatMap(b => b.characters)
  const uniqueChars   = new Set(allCharacters)
  if (uniqueChars.size < 3 && uniqueChars.size > 0) {
    issues.push({
      id: 'underpopulated',
      beatId: null,
      message: `Only ${uniqueChars.size} unique character(s) across all beats — story may feel underpopulated.`,
      severity: 'warning',
    })
  }

  // Consecutive beats with the same emotional tone
  const sorted = [...beats].sort((a, b) => a.order - b.order)
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1]
    if (a.emotionalTone && b.emotionalTone && a.emotionalTone === b.emotionalTone) {
      issues.push({
        id: `pacing_${a.id}_${b.id}`,
        beatId: a.id,
        message: `"${a.name}" and "${b.name}" share the same tone (${a.emotionalTone}) — consider varying the emotional contrast.`,
        severity: 'warning',
      })
    }
  }

  // Page overflow
  const maxPage = Math.max(...beats.map(b => b.pageEnd))
  if (maxPage > totalPages) {
    issues.push({
      id: 'page_overflow',
      beatId: null,
      message: `A beat extends to page ${maxPage}, which exceeds the screenplay total of ${totalPages} pages.`,
      severity: 'error',
    })
  }

  return issues
}
