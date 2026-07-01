# MakeFrame — Pre-Production Knowledge Base
# Claude reads this before making any decision about screenplay, storyboard,
# shot list, beat sheet, or character bible features.

## ─── WHAT IS PRE-PRODUCTION ───────────────────────────────────────────────────
Pre-production is everything that happens before cameras roll.
Order: Idea → Treatment → Beat Sheet → Screenplay → Character Bible
       → Storyboard → Shot List → Schedule → Production

## ─── SCREENPLAY FORMAT ────────────────────────────────────────────────────────
# Industry standard (WGA / Hollywood spec)

Font:         Courier Prime 12pt — non-negotiable
Page size:    US Letter, ~55 action lines per page
Margins:      Left 1.5in, Right 1in, Top/Bottom 1in
Runtime rule: 1 page ≈ 1 minute of screen time

### Element types and their formatting rules:

SCENE HEADING (slug)
  - ALL CAPS always
  - Format: INT./EXT. LOCATION — TIME OF DAY
  - Time values: DAY | NIGHT | DAWN | DUSK | CONTINUOUS | LATER | MOMENTS LATER
  - Examples: "INT. WAREHOUSE — NIGHT" / "EXT. ROOFTOP — DAY"
  - Left margin: 0 (full width)

ACTION
  - Sentence case
  - Describes only what can be SEEN or HEARD on screen
  - No internal thoughts, no camera directions (in spec scripts)
  - Left margin: 0, full width to right margin
  - Keep paragraphs short — 3 lines max is ideal

CHARACTER NAME
  - ALL CAPS, centred on page (approx 2.5in from left)
  - First appearance: add brief description in action before dialogue
  - Suffixes: (V.O.) = voiceover, (O.S.) = off screen, (CONT'D) = continues

PARENTHETICAL
  - In parentheses, below character name, above dialogue
  - Centred, italic in display
  - Use sparingly — only when tone is not obvious from context
  - Bad: (sadly) / Good: (almost to himself)

DIALOGUE
  - Centred block, approx 3.5in wide (1.5in left margin, 2.5in right margin)
  - Sentence case, natural speech
  - Each character's speech = one dialogue block

TRANSITION
  - Flush right, ALL CAPS
  - Common: CUT TO: / DISSOLVE TO: / SMASH CUT TO: / MATCH CUT TO: / FADE OUT.
  - Use sparingly — modern screenplays rarely use them

### Keyboard cycling (Tab key):
Action → Character → Dialogue → Action (loop)
Shift+Tab reverses. Ctrl+Enter = new scene heading.

### Page count calculation:
totalLines = sum of all element line counts
estimatedPages = totalLines / 55
runtime = estimatedPages minutes (round to nearest 0.5)

## ─── STORY STRUCTURE ──────────────────────────────────────────────────────────

### Three-Act Structure (standard feature film)
Act I   (pages 1–25):    Setup. Introduce world, protagonist, stakes.
                          Ends at: Inciting incident / plot point 1
Act II  (pages 26–85):   Confrontation. Rising stakes, midpoint reversal,
                          dark night of the soul. Longest act.
                          Midpoint at ~page 55: major shift or reversal
                          Ends at: plot point 2 / all-is-lost moment
Act III (pages 86–110):  Resolution. Climax, consequences, new equilibrium.

### Beat Sheet frameworks
The app supports five interchangeable beat-sheet frameworks (`src/data/frameworks.ts`). A
project's beat sheet is built against one framework at a time; switching frameworks remaps
existing beats via `FrameworkSwitchModal`.

#### Save the Cat (Blake Snyder — 15 beats, default/primary framework)
1.  Opening image        — visual statement of the theme
2.  Theme stated         — someone says what the film is about (subtly)
3.  Setup                — introduce world, characters, what needs to change
4.  Catalyst             — the inciting incident (p.12)
5.  Debate               — protagonist resists the change
6.  Break into Two       — protagonist chooses to act (end of Act I)
7.  B Story              — love story or mentor subplot begins
8.  Fun and Games        — the "promise of the premise" — genre entertainment
9.  Midpoint             — false victory or false defeat (p.55)
10. Bad Guys Close In    — opposition tightens, internal conflict worsens
11. All Is Lost          — the lowest point (p.75)
12. Dark Night of the Soul — protagonist reflects, finds inner resolve
13. Break into Three     — solution discovered, Act III begins
14. Finale               — execute the solution, climax, world transformed
15. Final Image          — mirror of opening image, shows change

#### 3-Act Structure (Aristotle — 3 beats)
Act I — Setup / Act II — Confrontation / Act III — Resolution. Minimal and flexible; no
target pages, just the three act groups.

#### Hero's Journey (Joseph Campbell — 12 beats)
Ordinary World → Call to Adventure → Refusal of the Call → Meeting the Mentor →
Crossing the Threshold → Tests, Allies, Enemies → Approach the Inmost Cave → The Ordeal →
Reward → The Road Back → Resurrection → Return with the Elixir

#### Dan Harmon's Story Circle (8 beats, circular)
You → Need → Go → Search → Find → Take → Return → Change

#### 7-Point Structure (Dan Wells — 7 beats, genre/mystery-friendly)
Hook → Plot Turn 1 → Pinch Point 1 → Midpoint → Pinch Point 2 → Plot Turn 2 → Resolution

## ─── STORYBOARDING ────────────────────────────────────────────────────────────
Storyboarding is the visual translation of the screenplay into sequential panels.
Each panel = one shot. Panels are rough sketches, not finished art.

### Shot types (shot-type tag on each panel)
EWS   Extreme Wide Shot      — vast environment, character tiny or absent
WS    Wide Shot              — full character visible, environment prominent
MS    Medium Shot            — waist up. Standard conversation shot.
MCU   Medium Close-Up        — chest/shoulder up. Most common dialogue shot.
CU    Close-Up               — face fills frame. Emotion, reaction.
ECU   Extreme Close-Up       — eyes, mouth, hands — extreme detail
OTS   Over The Shoulder      — shooting past one character at another
POV   Point of View          — camera = character's eyes
INSERT Cut to detail         — object, text, detail (clock, letter, wound)
TWO   Two-Shot               — both characters visible in frame

### Camera movements (movement tag)
Static    — camera doesn't move
Pan       — camera rotates left/right on fixed axis
Tilt      — camera rotates up/down on fixed axis
Dolly     — camera physically moves toward/away from subject
Track     — camera moves parallel to subject
Crane/Jib — camera moves vertically, often sweeping
Handheld  — intentional shake, documentary feel, urgency
Steadicam — smooth moving shot, follows action fluidly
Rack Focus— focus shifts between foreground and background subjects
Zoom      — lens changes focal length (rarely used in modern film)

### Lens guide (focal length = emotional feel)
14–24mm   Ultra wide   — distortion, claustrophobia, scale, disorientation
28–35mm   Wide         — environmental, naturalistic, reportage feel
40–50mm   Normal       — closest to human eye, neutral, invisible
85mm      Portrait     — flattering compression, subject pops from background
100–135mm Telephoto    — emotional compression, intimate without intrusion
200mm+    Long tele    — surveillance feel, characters feel watched/isolated

### Storyboard panel anatomy
Each panel contains:
- Panel number (sequential within scene)
- Sketch area (16:9, line art)
- Shot type tag
- Camera movement tag
- Lens (mm)
- Action description (1–2 sentences max)
- Dialogue/sound note (optional)
- Duration estimate (seconds)

### Coverage strategy
Master shot  — wide shot of full scene, establishes geography
Coverage     — MCU/CU on each character for cutting options
Insert shots — details that emphasize story points
Reaction shots — cut-aways to listening characters

## ─── SHOT LIST ────────────────────────────────────────────────────────────────
The shot list is the operational translation of the storyboard for the crew.
Each row = one camera setup. Rows are in SHOOT ORDER, not scene order.

### Shot list columns
Shot #       — sequential number for the shoot day
Scene #      — which screenplay scene
Panel ref    — which storyboard panel it came from
INT/EXT      — interior or exterior
Location     — specific set or location name
Shot type    — WS / MS / MCU / CU etc.
Movement     — static / dolly / handheld etc.
Lens         — focal length in mm
Description  — what the shot captures (1 sentence)
Cast         — character names in the shot
Special equip— crane, gimbal, underwater rig, etc.
Est. setup   — time estimate for crew to set up this shot
Notes        — director/DP notes

### Shoot order optimisation rules
1. Group by location — never move between locations unnecessarily
2. Group by lighting setup within location (day scenes together, night together)
3. Shoot wide/master shots first, then coverage
4. Schedule difficult/complex shots when crew is freshest (morning)
5. Schedule actor-heavy scenes to respect cast call times
6. Reserve golden hour shots — they last only ~20 minutes

## ─── CHARACTER BIBLE ──────────────────────────────────────────────────────────
A character bible documents everything about each character for consistency.

### Character profile fields
Name, Age, Occupation, Physical description
Backstory (what shaped them before page 1)
Want (external goal — what they're consciously pursuing)
Need (internal truth — what they actually need to change/learn)
Wound (past trauma driving their behaviour)
Ghost (specific past event that haunts them)
Voice (how they speak — vocabulary, rhythm, verbal tics)
Arc (where they start → where they end)
Relationships (dynamic with each other character)
First appearance (scene number)
Total scenes (count)

## ─── SCENE METADATA ───────────────────────────────────────────────────────────
Each scene should track:
- INT or EXT
- Location name
- Time of day (DAY/NIGHT/DAWN/DUSK/CONTINUOUS)
- Act number (1/2/3)
- Page number (start)
- Page length (to nearest 1/8th page: 1/8, 2/8... 8/8)
- Characters present
- Props required
- Special requirements (stunts, VFX, animals, children)
- Emotional tone (optional: tense / warm / comic / tragic etc.)

### Page length notation (industry standard)
1/8 page = ~7 lines. Used in breakdown sheets.
Notation: 1/8, 2/8, 3/8, 4/8, 5/8, 6/8, 7/8, 1, 1 1/8 etc.

## ─── INDUSTRY TERMS GLOSSARY ─────────────────────────────────────────────────
ADR      — Automated Dialogue Replacement (re-recorded dialogue in post)
B-roll   — supplementary/cutaway footage
Call sheet — daily production schedule distributed to crew
Coverage — shooting multiple angles of one scene for editing options
Dailies  — raw footage reviewed each day during production
DP       — Director of Photography (Cinematographer)
FDX      — Final Draft file format (.fdx)
Fountain — plain-text screenplay markup format (.fountain)
PA       — Production Assistant
Prelap   — audio from next scene starts before cut
Spec script — screenplay written on speculation, not commissioned
Treatment — prose summary of a screenplay (1–10 pages)
Turnaround — minimum rest time between crew wrap and next call time
WGA      — Writers Guild of America (sets formatting standards)
