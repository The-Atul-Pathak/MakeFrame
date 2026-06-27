import type { FrameworkDefinition } from '@/types/beatsheet'

export const FRAMEWORKS: Record<string, FrameworkDefinition> = {
  save_the_cat: {
    id: 'save_the_cat',
    label: 'Save the Cat',
    description: "Blake Snyder's 15-beat Hollywood structure. The industry standard for feature films.",
    acts: [
      { key: 'act1',  label: 'Act 1',  beatOrders: [1,2,3,4,5,6],  pageRange: [1, 25]   },
      { key: 'act2a', label: 'Act 2A', beatOrders: [7,8,9],         pageRange: [25, 55]  },
      { key: 'act2b', label: 'Act 2B', beatOrders: [10,11,12,13],   pageRange: [55, 85]  },
      { key: 'act3',  label: 'Act 3',  beatOrders: [14,15],         pageRange: [85, 110] },
    ],
    defaultBeats: [
      { order: 1,  name: 'Opening Image',           actKey: 'act1',  pageStart: 1,   pageEnd: 1,   hint: 'A visual snapshot of the world before the story begins. Should contrast with the Final Image.' },
      { order: 2,  name: 'Theme Stated',            actKey: 'act1',  pageStart: 5,   pageEnd: 5,   hint: "Someone (not the hero) states what the film is really about — subtly." },
      { order: 3,  name: 'Setup',                   actKey: 'act1',  pageStart: 1,   pageEnd: 10,  hint: "Introduce the protagonist, their world, their flaw, what they want vs. what they need." },
      { order: 4,  name: 'Catalyst',                actKey: 'act1',  pageStart: 12,  pageEnd: 12,  hint: 'The inciting incident. The event that disrupts the status quo. No going back.' },
      { order: 5,  name: 'Debate',                  actKey: 'act1',  pageStart: 12,  pageEnd: 25,  hint: 'Protagonist resists, debates, or questions the call to action. Should they take the leap?' },
      { order: 6,  name: 'Break into Act 2',        actKey: 'act1',  pageStart: 25,  pageEnd: 25,  hint: 'Protagonist makes the choice and commits. The real journey begins.' },
      { order: 7,  name: 'B Story',                 actKey: 'act2a', pageStart: 30,  pageEnd: 30,  hint: 'A secondary story — often a romance or mentor — that carries the theme.' },
      { order: 8,  name: 'Fun & Games',             actKey: 'act2a', pageStart: 30,  pageEnd: 55,  hint: "The promise of the premise. What the trailer shows. Genre entertainment delivered." },
      { order: 9,  name: 'Midpoint',                actKey: 'act2a', pageStart: 55,  pageEnd: 55,  hint: 'False victory or false defeat. Stakes are raised. Everything changes direction.' },
      { order: 10, name: 'Bad Guys Close In',       actKey: 'act2b', pageStart: 55,  pageEnd: 75,  hint: 'External pressure mounts. Internal doubt deepens. The team falls apart.' },
      { order: 11, name: 'All Is Lost',             actKey: 'act2b', pageStart: 75,  pageEnd: 75,  hint: 'The lowest point. Everything the hero wanted is gone. A whiff of death.' },
      { order: 12, name: 'Dark Night of the Soul',  actKey: 'act2b', pageStart: 75,  pageEnd: 85,  hint: 'Grief, reflection. How did it come to this? The hero must dig deeper than ever.' },
      { order: 13, name: 'Break into Act 3',        actKey: 'act2b', pageStart: 85,  pageEnd: 85,  hint: 'The aha moment. The hero finds the answer — often hidden in the B Story.' },
      { order: 14, name: 'Finale',                  actKey: 'act3',  pageStart: 85,  pageEnd: 110, hint: 'Execute the plan. Dig deep. Transform. Defeat the antagonist. Change the world.' },
      { order: 15, name: 'Final Image',             actKey: 'act3',  pageStart: 110, pageEnd: 110, hint: 'Mirror of the Opening Image. Shows undeniably how much has changed.' },
    ],
  },

  three_act: {
    id: 'three_act',
    label: '3-Act Structure',
    description: 'Classic Setup / Confrontation / Resolution. Universal, minimal, flexible.',
    acts: [
      { key: 'act1', label: 'Act 1 — Setup',         beatOrders: [1], pageRange: [1, 30]   },
      { key: 'act2', label: 'Act 2 — Confrontation', beatOrders: [2], pageRange: [30, 85]  },
      { key: 'act3', label: 'Act 3 — Resolution',    beatOrders: [3], pageRange: [85, 110] },
    ],
    defaultBeats: [
      { order: 1, name: 'Setup',         actKey: 'act1', pageStart: 1,  pageEnd: 30,  hint: 'Establish the world, protagonist, relationships, and the central conflict.' },
      { order: 2, name: 'Confrontation', actKey: 'act2', pageStart: 30, pageEnd: 85,  hint: 'Rising stakes. Midpoint reversal. Everything goes wrong. Dark night of the soul.' },
      { order: 3, name: 'Resolution',    actKey: 'act3', pageStart: 85, pageEnd: 110, hint: 'Climax. Consequences. The world is changed. New equilibrium established.' },
    ],
  },

  hero_journey: {
    id: 'hero_journey',
    label: "Hero's Journey",
    description: "Joseph Campbell's 12-stage monomyth. Archetypal, mythological storytelling.",
    acts: [
      { key: 'departure',   label: 'Departure',   beatOrders: [1,2,3,4],     pageRange: [1, 30]   },
      { key: 'initiation',  label: 'Initiation',  beatOrders: [5,6,7,8,9],   pageRange: [30, 85]  },
      { key: 'return',      label: 'Return',      beatOrders: [10,11,12],    pageRange: [85, 110] },
    ],
    defaultBeats: [
      { order: 1,  name: 'Ordinary World',          actKey: 'departure',  pageStart: 1,   pageEnd: 10,  hint: "The hero's everyday life before the adventure — establish what's at stake." },
      { order: 2,  name: 'Call to Adventure',       actKey: 'departure',  pageStart: 10,  pageEnd: 15,  hint: 'A challenge, problem, or quest is presented to the hero.' },
      { order: 3,  name: 'Refusal of the Call',     actKey: 'departure',  pageStart: 15,  pageEnd: 22,  hint: 'The hero hesitates or refuses — fear, insecurity, or duty holds them back.' },
      { order: 4,  name: 'Meeting the Mentor',      actKey: 'departure',  pageStart: 22,  pageEnd: 30,  hint: 'A guide appears with wisdom, training, or a magical gift.' },
      { order: 5,  name: 'Crossing the Threshold',  actKey: 'initiation', pageStart: 30,  pageEnd: 35,  hint: 'The hero commits and enters the special world — no return to the ordinary.' },
      { order: 6,  name: 'Tests, Allies, Enemies',  actKey: 'initiation', pageStart: 35,  pageEnd: 55,  hint: 'Trials test the hero. Allies emerge. Enemies reveal themselves.' },
      { order: 7,  name: 'Approach the Inmost Cave',actKey: 'initiation', pageStart: 55,  pageEnd: 65,  hint: 'Preparation and build-up for the central ordeal.' },
      { order: 8,  name: 'The Ordeal',              actKey: 'initiation', pageStart: 65,  pageEnd: 75,  hint: 'The supreme challenge. Near-death. Transformation through crisis.' },
      { order: 9,  name: 'Reward (Seizing the Sword)', actKey: 'initiation', pageStart: 75, pageEnd: 85, hint: 'The hero seizes the reward — object, knowledge, or reconciliation.' },
      { order: 10, name: 'The Road Back',           actKey: 'return',     pageStart: 85,  pageEnd: 95,  hint: 'Returning to the ordinary world, often chased by the shadow.' },
      { order: 11, name: 'Resurrection',            actKey: 'return',     pageStart: 95,  pageEnd: 105, hint: 'Final test. The hero is purified. Transformation complete.' },
      { order: 12, name: 'Return with the Elixir',  actKey: 'return',     pageStart: 105, pageEnd: 110, hint: 'The hero returns home, changed, bringing something of value to the world.' },
    ],
  },

  story_circle: {
    id: 'story_circle',
    label: "Dan Harmon's Story Circle",
    description: '8-step circular structure. Popular in TV writing (Rick & Morty, Community).',
    acts: [
      { key: 'into',  label: 'Into the Unknown', beatOrders: [1,2,3,4], pageRange: [1, 55]   },
      { key: 'back',  label: 'Back to Normal',   beatOrders: [5,6,7,8], pageRange: [55, 110] },
    ],
    defaultBeats: [
      { order: 1, name: 'You (Zone of Comfort)',     actKey: 'into', pageStart: 1,   pageEnd: 14,  hint: 'Establish the character in their comfort zone.' },
      { order: 2, name: 'Need',                      actKey: 'into', pageStart: 14,  pageEnd: 28,  hint: 'The character wants or needs something.' },
      { order: 3, name: 'Go (Unfamiliar Situation)', actKey: 'into', pageStart: 28,  pageEnd: 42,  hint: 'Character enters an unfamiliar situation to get it.' },
      { order: 4, name: 'Search (Adapt)',            actKey: 'into', pageStart: 42,  pageEnd: 55,  hint: 'Character adapts to the new situation — trials, tests, allies.' },
      { order: 5, name: 'Find (What they wanted)',   actKey: 'back', pageStart: 55,  pageEnd: 69,  hint: 'Character gets what they wanted.' },
      { order: 6, name: 'Take (Pay a price)',        actKey: 'back', pageStart: 69,  pageEnd: 83,  hint: 'But they pay a heavy price for it.' },
      { order: 7, name: 'Return (Changed)',          actKey: 'back', pageStart: 83,  pageEnd: 97,  hint: 'Character returns to the familiar situation, now changed.' },
      { order: 8, name: 'Change (Having Changed)',   actKey: 'back', pageStart: 97,  pageEnd: 110, hint: 'The character has fundamentally changed. New equilibrium.' },
    ],
  },

  seven_point: {
    id: 'seven_point',
    label: '7-Point Structure',
    description: "Dan Wells' plot structure. Works especially well for genre fiction and mystery.",
    acts: [
      { key: 'setup',  label: 'Setup',   beatOrders: [1,2],   pageRange: [1, 30]   },
      { key: 'middle', label: 'Middle',  beatOrders: [3,4,5], pageRange: [30, 75]  },
      { key: 'payoff', label: 'Payoff',  beatOrders: [6,7],   pageRange: [75, 110] },
    ],
    defaultBeats: [
      { order: 1, name: 'Hook',        actKey: 'setup',  pageStart: 1,  pageEnd: 15,  hint: "The starting state — the opposite of where the story will end." },
      { order: 2, name: 'Plot Turn 1', actKey: 'setup',  pageStart: 15, pageEnd: 30,  hint: 'The story truly begins. The hero is pushed into a new situation.' },
      { order: 3, name: 'Pinch 1',     actKey: 'middle', pageStart: 30, pageEnd: 45,  hint: 'Apply pressure. Force the hero to act, not just react.' },
      { order: 4, name: 'Midpoint',    actKey: 'middle', pageStart: 45, pageEnd: 60,  hint: 'The hero shifts from reacting to acting. Takes control of the story.' },
      { order: 5, name: 'Pinch 2',     actKey: 'middle', pageStart: 60, pageEnd: 75,  hint: 'All hope seems lost. The darkest moment before the turn.' },
      { order: 6, name: 'Plot Turn 2', actKey: 'payoff', pageStart: 75, pageEnd: 90,  hint: 'The hero gains the final piece needed to resolve the conflict.' },
      { order: 7, name: 'Resolution',  actKey: 'payoff', pageStart: 90, pageEnd: 110, hint: 'Mirror of the Hook. Show the hero transformed.' },
    ],
  },
}
