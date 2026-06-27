# MakeFrame — Ideas & Backlog

Everything we've discussed but haven't built yet. Add to this freely.

---

## 🎓 Learn Platform
A guided learning mode that ships curated example content so new users aren't staring at blank slates.

- Pre-populated beat sheets for famous films (e.g. Die Hard, Parasite, Mad Max) as study references
- Act/scene scaffold examples with annotated descriptions
- "Learn mode" toggle on beat cards that shows tooltips and hints inline
- Framework comparison view — same story shown in STC vs Hero's Journey side by side
- Short video/text walkthroughs per beat (what is "All Is Lost"? why does it matter?)
- Possibly a separate `/learn` route with its own navigation, isolated from user projects

---

## 🔁 Beat Sheet → Act/Scene Converter (Phase 2)
After the writer finishes their beat sheet, convert it into a scene scaffold the Screenplay module can use.

- **Auto mode** — derives scene count from page range ÷ avgPagesPerScene (configurable per genre)
- **Manual mode** — writer drags beats between acts, splits beats into scene groups, merges adjacent beats
- Override delta model — track manual changes on top of the auto base so re-runs don't clobber user edits
- Sync engine — when a beat changes after conversion, flag affected scenes with a conflict banner (keep manual / accept auto / merge)
- Validation before finalising: orphaned beats, page overflow, act imbalance, midpoint % check
- "Convert to Scenes" button in Beat Sheet header (currently disabled/greyed out)
- Output feeds directly into Screenplay module as pre-built act + scene placeholders

---

## 🔗 Cross-Module Sync (Phase 3)
Make beatId a first-class foreign key across every downstream module.

- Every Scene, Storyboard Panel, Character Arc Point carries a `beatId` reference
- Change to a beat propagates `needsReview: true` on linked entities
- "Coverage view" — which beats have scenes? which beats have storyboard panels? visualised as a matrix
- Beat deletion warns if linked scenes exist downstream
- Character arc graph — X = beat order, Y = emotional state, auto-built from beat character assignments

---

## 🎬 Screenplay Module
Full screenplay editor inside the workspace.

- Scene headings, action, character, parenthetical, dialogue, transition elements
- Tab-key cycling between element types (keyboard spec in knowledge.md)
- Courier Prime canvas at 680px, paper-white background
- Page count + runtime estimator (1 page ≈ 1 minute)
- FDX / Fountain export
- Scene metadata panel (INT/EXT, location, time of day, characters, props, special requirements)
- Pre-populated with scene placeholders from the Beat Sheet converter
- Scene list sidebar with drag-to-reorder

---

## 🖼 Storyboard Module
Visual panel editor for translating scenes into shots.

- 16:9 panel grid (3 columns default)
- Sketch area per panel (canvas API, line-art drawing tools)
- Shot type tag (EWS / WS / MS / MCU / CU / ECU / OTS / POV / INSERT / TWO)
- Camera movement tag + lens (mm)
- Action description (1–2 sentences) + dialogue/sound note
- Duration estimate per panel
- Each beat → at least 1 panel placeholder (Opening Image and Final Image mandatory)
- Panel thumbnail generation / upload
- Panel sequence export as PDF / image strip

---

## 📋 Shot List Module
Operational translation of storyboard for the crew.

- Tabular view: shot#, scene#, panel ref, INT/EXT, location, shot type, movement, lens, description, cast, special equipment, setup time estimate, notes
- Sorted by shoot order (not scene order)
- Location grouping optimiser (group by location → by lighting setup → wide before coverage)
- Golden hour shot flagging
- Export as CSV / PDF call sheet

---

## 👤 Character Module
Character bible builder.

- Profile fields: name, age, occupation, physical description, backstory, want, need, wound, ghost, voice, arc, relationships
- Character arc graph — emotional state at each beat (X = beat, Y = emotion)
- Relationship map — network graph of character dynamics
- Scene frequency counter (which scenes does each character appear in?)
- First appearance auto-detected from beat character assignments
- Continuity warnings: character disappears for too many consecutive beats

---

## 🗃 Backend / Supabase Integration for Beat Sheets
Currently Beat Sheets are localStorage only — needs Supabase persistence.

- `beat_sheets` table: `id, project_id, framework, total_pages, genre, created_at, updated_at`
- `beats` table: `id, beat_sheet_id, order, name, description, page_start, page_end, act_key, percentage, emotional_tone, characters (text[]), location, notes, status`
- RLS policies scoped by `project_id → owner_id`
- `src/services/beatSheets.ts` service file (matching projects.ts pattern)
- Zustand slice becomes a cache + optimistic write buffer, not the source of truth

---

## 📤 Export & Sharing
Output the work in useful formats.

- Beat sheet → PDF (styled, printable)
- Beat sheet → Final Draft outline format
- Screenplay → FDX / Fountain / PDF
- Storyboard → PDF panel strip
- Shot list → CSV / Excel / PDF
- Share link (read-only URL for a project or specific module)
- Collaboration (multi-user editing) — longer term

---

## 🧠 AI-Assisted Features (longer term)
Use Claude API to help writers when they're stuck.

- "Suggest a beat description" based on genre, tone, adjacent beats
- Beat sheet health check — AI reads the whole sheet and flags structural problems in plain English
- Character arc suggestions based on beat emotional tones
- Scene idea generation from a beat description
- Logline ↔ beat sheet consistency checker

---

## 🔧 Platform Polish & Infrastructure
Things that need doing once core modules exist.

- Auth upgrade: anon → real email/Google auth with account persistence
- Project settings page (change title, format, genres, thumbnail, target pages)
- Activity log per project (who changed what, when)
- Keyboard shortcuts map modal (`?` key)
- Onboarding flow for new users (step-by-step first project setup)
- Dark/light theme toggle
- Mobile-responsive layout (tablet at minimum)
- Offline support via Zustand persist + sync on reconnect
