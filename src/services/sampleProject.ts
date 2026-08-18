import type { Project } from '@/types/project'
import type { Scene, ScreenplayElement, Panel, Shot, Character } from '@/types'
import type { Beat, BeatSheet } from '@/types/beatsheet'
import { saveProject } from '@/services/projects'
import { insertScene, replaceElementsForScene } from '@/services/scenes'
import { insertCharacter } from '@/services/characters'
import { insertPanel } from '@/services/panels'
import { insertShot } from '@/services/shots'
import { insertBeatSheet, insertBeat } from '@/services/beatSheets'

/**
 * Seeds a worked example across all five modules.
 *
 * The point is not the story — it is that the same three character names, three
 * scenes and their panels reappear downstream, so the Screenplay → Storyboard →
 * Shot List relationship is something a new user can see rather than be told.
 * It is a real project: fully editable, and deletable like any other.
 */

export const SAMPLE_PROJECT_TITLE = 'Signal Hill'

const el = (type: ScreenplayElement['type'], text: string): ScreenplayElement => ({
  id: crypto.randomUUID(),
  type,
  text,
})

export async function createSampleProject(): Promise<Project> {
  const project = await saveProject({
    title: SAMPLE_PROJECT_TITLE,
    format: 'Short Film',
    logline:
      'On her last night shift before the station closes, a radio operator answers a distress call from a frequency that was decommissioned thirty years ago.',
    genres: ['Drama', 'Mystery'],
    thumbnailFile: null,
  })

  const now = new Date().toISOString()
  const stamps = { createdAt: now, updatedAt: now }

  // ── Scenes ─────────────────────────────────────────────────────────────────
  // Seeded first: panels and shots both hang off scene ids.

  const scene1Id = crypto.randomUUID()
  const scene2Id = crypto.randomUUID()
  const scene3Id = crypto.randomUUID()

  const scenes: Scene[] = [
    {
      id: scene1Id,
      projectId: project.id,
      number: 1,
      intExt: 'INT',
      location: 'SIGNAL HILL STATION — CONTROL ROOM',
      timeOfDay: 'NIGHT',
      act: 1,
      pageStart: 1,
      pageLength: '2 4/8',
      characters: ['MAYA REYES'],
      props: ['Headphones', 'Logbook', 'Thermos'],
      specialRequirements: ['Practical console lighting', 'Rain exterior'],
      emotionalTone: 'contemplative',
      elements: [],
      needsReview: false,
      ...stamps,
    },
    {
      id: scene2Id,
      projectId: project.id,
      number: 2,
      intExt: 'INT',
      location: 'SIGNAL HILL STATION — CONTROL ROOM',
      timeOfDay: 'LATER',
      act: 2,
      pageStart: 4,
      pageLength: '4 2/8',
      characters: ['MAYA REYES', 'ELI TANNER'],
      props: ['Inventory clipboard', 'Decommission tag', 'Reel tape'],
      specialRequirements: ['Radio static playback on set'],
      emotionalTone: 'tense',
      elements: [],
      needsReview: false,
      ...stamps,
    },
    {
      id: scene3Id,
      projectId: project.id,
      number: 3,
      intExt: 'EXT',
      location: 'SIGNAL HILL — ACCESS ROAD',
      timeOfDay: 'DAWN',
      act: 3,
      pageStart: 9,
      pageLength: '1 6/8',
      characters: ['MAYA REYES', 'ELI TANNER'],
      props: ['Station keys'],
      specialRequirements: ['Dawn light — one shot only'],
      emotionalTone: 'hopeful',
      elements: [],
      needsReview: false,
      ...stamps,
    },
  ]

  for (const scene of scenes) await insertScene(scene)

  const sceneElements: Record<string, ScreenplayElement[]> = {
    [scene1Id]: [
      el('scene-heading', 'INT. SIGNAL HILL STATION — CONTROL ROOM — NIGHT'),
      el('action', 'Banks of dark equipment. One console still lit. MAYA REYES, 34, sits with her headphones around her neck, filling in a logbook by hand.'),
      el('action', 'The clock reads 02:14. Outside, rain moves across the hill in sheets.'),
      el('character', 'MAYA'),
      el('parenthetical', '(into mic)'),
      el('dialogue', 'Signal Hill, standing by. Nothing to report.'),
      el('action', 'She sets down the pen and listens to nothing for a while. It is the part of the job she is best at.'),
    ],
    [scene2Id]: [
      el('scene-heading', 'INT. SIGNAL HILL STATION — CONTROL ROOM — LATER'),
      el('action', 'ELI TANNER, 61, works down an inventory list, tagging equipment for removal. He does not look up.'),
      el('character', 'ELI'),
      el('dialogue', "Every band's cleared. You can go home early, Reyes."),
      el('action', 'A tone cuts through the static. Low, patterned, deliberate. Maya sits forward.'),
      el('character', 'MAYA'),
      el('dialogue', "That's the emergency band."),
      el('character', 'ELI'),
      el('dialogue', "That band's been dead since ninety-four. It's an echo. It's weather."),
      el('action', 'Maya pulls the headphones on. The tone resolves into a voice — a woman, reading coordinates.'),
      el('character', 'MAYA'),
      el('parenthetical', '(into mic)'),
      el('dialogue', "Station receiving. Say again your position."),
      el('action', "Eli stops writing. For the first time all night, he looks at the console."),
    ],
    [scene3Id]: [
      el('scene-heading', 'EXT. SIGNAL HILL — ACCESS ROAD — DAWN'),
      el('action', 'The station behind them, dark now. Eli holds the keys but does not lock the door.'),
      el('character', 'ELI'),
      el('dialogue', 'You logged it under your own name.'),
      el('character', 'MAYA'),
      el('dialogue', 'Somebody should have.'),
      el('action', 'She walks down the road into the light. Behind her, the console stays lit — one channel, still open.'),
      el('transition', 'CUT TO BLACK.'),
    ],
  }

  for (const [sceneId, elements] of Object.entries(sceneElements)) {
    await replaceElementsForScene(project.id, sceneId, elements)
  }

  // ── Characters ─────────────────────────────────────────────────────────────
  // firstAppearanceSceneId is what links a bible entry back to the screenplay.

  const mayaId = crypto.randomUUID()
  const eliId  = crypto.randomUUID()

  const characters: Character[] = [
    {
      id: mayaId,
      projectId: project.id,
      name: 'MAYA REYES',
      age: '34',
      occupation: 'Overnight radio operator',
      physicalDescription: 'Compact, deliberate. Headphones permanently around her neck like a collar she chose.',
      backstory: 'Took the night shift at Signal Hill six years ago because it was the only job where nobody asked her to explain herself.',
      want: 'To finish the last shift cleanly and hand back the keys.',
      need: 'To stop mistaking silence for safety.',
      wound: 'Her brother went missing on a hiking trip. The search was called off after nine days.',
      ghost: 'A transmission at 3 a.m. she logged as noise, because protocol said it was noise.',
      voice: "Short sentences. Answers questions with questions. Says 'copy' when she means yes.",
      arc: 'From keeping the frequency clear to finally answering it.',
      relationships: { [eliId]: 'He trained her. He has never once used her first name.' },
      firstAppearanceSceneId: scene1Id,
      totalScenes: 3,
      ...stamps,
    },
    {
      id: eliId,
      projectId: project.id,
      name: 'ELI TANNER',
      age: '61',
      occupation: 'Retired station chief, back to close the building',
      physicalDescription: 'Tall, stooped at the shoulders. Still wears the old service jacket with the patch removed.',
      backstory: 'Ran Signal Hill for twenty-two years. Signed the order that took the emergency band out of service.',
      want: 'To close the station without incident.',
      need: 'To admit what he shut down, and what it cost.',
      wound: 'He was told the band was clear. He did not check twice.',
      ghost: 'The 1994 decommission file, which he has never reopened.',
      voice: 'Talks like a maintenance manual. Warms only when he is being corrected.',
      arc: 'From gatekeeper to witness.',
      relationships: { [mayaId]: 'The only operator he trusted with nights. He has never told her so.' },
      firstAppearanceSceneId: scene2Id,
      totalScenes: 2,
      ...stamps,
    },
  ]

  for (const character of characters) await insertCharacter(character)

  // ── Beat sheet ─────────────────────────────────────────────────────────────

  const beatSheet: BeatSheet = {
    id: crypto.randomUUID(),
    projectId: project.id,
    framework: 'three_act',
    totalPages: 12,
    genre: 'Drama',
    beats: [],
    ...stamps,
  }
  await insertBeatSheet(beatSheet)

  const beats: Beat[] = [
    {
      id: crypto.randomUUID(),
      order: 1,
      name: 'Setup',
      description: 'Maya works her final overnight. Eli arrives to inventory the room. The station closes at dawn.',
      pageStart: 1,
      pageEnd: 4,
      actKey: 'act1',
      frameworkBeatId: 'setup',
      percentage: 1 / 12,
      emotionalTone: 'contemplative',
      characters: ['MAYA REYES'],
      location: 'SIGNAL HILL STATION — CONTROL ROOM',
      notes: 'Establish the ritual of the shift before anything breaks it.',
      status: 'draft',
    },
    {
      id: crypto.randomUUID(),
      order: 2,
      name: 'Confrontation',
      description: 'A distress call arrives on the decommissioned band. Eli calls it an echo. Maya answers it anyway.',
      pageStart: 4,
      pageEnd: 9,
      actKey: 'act2',
      frameworkBeatId: 'confrontation',
      percentage: 4 / 12,
      emotionalTone: 'tense',
      characters: ['MAYA REYES', 'ELI TANNER'],
      location: 'SIGNAL HILL STATION — CONTROL ROOM',
      notes: 'The turn is Maya keying the mic, not the call itself.',
      status: 'draft',
    },
    {
      id: crypto.randomUUID(),
      order: 3,
      name: 'Resolution',
      description: 'Maya logs the call under her own name. The channel is left open.',
      pageStart: 9,
      pageEnd: 12,
      actKey: 'act3',
      frameworkBeatId: 'resolution',
      percentage: 9 / 12,
      emotionalTone: 'hopeful',
      characters: ['MAYA REYES', 'ELI TANNER'],
      location: 'SIGNAL HILL — ACCESS ROAD',
      notes: 'Resolve the wound, not the mystery. The coordinates are never explained.',
      status: 'draft',
    },
  ]

  for (const beat of beats) await insertBeat(beatSheet.id, beat)

  // ── Storyboard panels ──────────────────────────────────────────────────────

  const panel1Id = crypto.randomUUID()
  const panel2Id = crypto.randomUUID()
  const panel3Id = crypto.randomUUID()
  const panel4Id = crypto.randomUUID()

  const panels: Panel[] = [
    {
      id: panel1Id, sceneId: scene1Id, number: 1,
      shotType: 'EWS', movement: 'Static', lens: 24,
      actionDescription: 'The hill from the access road. One lit window in a dark building, rain crossing the frame.',
      dialogueNote: '', durationEstimate: 6,
      sketchDataUrl: null, needsReview: false, ...stamps,
    },
    {
      id: panel2Id, sceneId: scene1Id, number: 2,
      shotType: 'MCU', movement: 'Static', lens: 50,
      actionDescription: 'Maya at the console, filling in the logbook. Headphones around her neck.',
      dialogueNote: 'Signal Hill, standing by.', durationEstimate: 8,
      sketchDataUrl: null, needsReview: false, ...stamps,
    },
    {
      id: panel3Id, sceneId: scene2Id, number: 1,
      shotType: 'OTS', movement: 'Static', lens: 85,
      actionDescription: 'Over Eli’s shoulder to the inventory clipboard as the tone begins under the scene.',
      dialogueNote: "Every band's cleared.", durationEstimate: 5,
      sketchDataUrl: null, needsReview: false, ...stamps,
    },
    {
      id: panel4Id, sceneId: scene2Id, number: 2,
      shotType: 'CU', movement: 'Dolly', lens: 85,
      actionDescription: 'Slow push on Maya as she pulls the headphones on and the voice resolves.',
      dialogueNote: 'Station receiving. Say again your position.', durationEstimate: 12,
      sketchDataUrl: null, needsReview: false, ...stamps,
    },
  ]

  for (const panel of panels) await insertPanel(panel)

  // ── Shot list ──────────────────────────────────────────────────────────────
  // Grouped by location so the shooting order reads the way a 1st AD would want
  // it, and carrying panelId so each row traces back to a storyboard frame.

  const shots: Shot[] = [
    {
      id: crypto.randomUUID(), projectId: project.id, sceneId: scene1Id, panelId: panel1Id,
      shotNumber: 1, intExt: 'EXT', location: 'SIGNAL HILL — ACCESS ROAD',
      shotType: 'EWS', movement: 'Static', lens: 24,
      description: 'Establisher — lit window, rain crossing frame.',
      cast: [], specialEquipment: 'Rain tower, 24mm', estimatedSetupMinutes: 45,
      notes: 'Shoot with the dawn scene — same unit move.', needsReview: false, ...stamps,
    },
    {
      id: crypto.randomUUID(), projectId: project.id, sceneId: scene3Id, panelId: null,
      shotNumber: 2, intExt: 'EXT', location: 'SIGNAL HILL — ACCESS ROAD',
      shotType: 'WS', movement: 'Static', lens: 35,
      description: 'Maya walks down the road into the light. Station dark behind her.',
      cast: ['MAYA REYES', 'ELI TANNER'], specialEquipment: '', estimatedSetupMinutes: 30,
      notes: 'Dawn — one window only. Rehearse before light.', needsReview: false, ...stamps,
    },
    {
      id: crypto.randomUUID(), projectId: project.id, sceneId: scene1Id, panelId: panel2Id,
      shotNumber: 3, intExt: 'INT', location: 'SIGNAL HILL STATION — CONTROL ROOM',
      shotType: 'MCU', movement: 'Static', lens: 50,
      description: 'Maya at the console, logbook, headphones at the neck.',
      cast: ['MAYA REYES'], specialEquipment: 'Practical console lighting', estimatedSetupMinutes: 40,
      notes: '', needsReview: false, ...stamps,
    },
    {
      id: crypto.randomUUID(), projectId: project.id, sceneId: scene2Id, panelId: panel3Id,
      shotNumber: 4, intExt: 'INT', location: 'SIGNAL HILL STATION — CONTROL ROOM',
      shotType: 'OTS', movement: 'Static', lens: 85,
      description: "Over Eli's shoulder to the clipboard as the tone starts.",
      cast: ['ELI TANNER'], specialEquipment: '', estimatedSetupMinutes: 25,
      notes: 'Playback static on set for eyelines.', needsReview: false, ...stamps,
    },
    {
      id: crypto.randomUUID(), projectId: project.id, sceneId: scene2Id, panelId: panel4Id,
      shotNumber: 5, intExt: 'INT', location: 'SIGNAL HILL STATION — CONTROL ROOM',
      shotType: 'CU', movement: 'Dolly', lens: 85,
      description: 'Slow push on Maya as the voice resolves. The turn of the film.',
      cast: ['MAYA REYES'], specialEquipment: 'Dolly + short track', estimatedSetupMinutes: 60,
      notes: 'Protect time for this one. Shoot last, when the room is quiet.', needsReview: false, ...stamps,
    },
  ]

  for (const shot of shots) await insertShot(shot)

  // Counts come back from the projects table on the next fetch; return the
  // freshly-seeded totals so the card is correct without a round trip.
  return {
    ...project,
    sceneCount: scenes.length,
    panelCount: panels.length,
    shotCount: shots.length,
  }
}
