# MakeFrame — Ideas & Backlog

Everything we've discussed but haven't built yet. Add to this freely.

---

## ✅ Shipped (moved out of backlog)
All five core modules — Beat Sheet, Screenplay, Storyboard, Shot List, Character bible — are
functionally complete for MVP and fully Supabase-persisted (see `docs/CLAUDE.md` and
`README.md`). Also shipped: real email/password + Google OAuth (no more anonymous sessions),
Supabase-backed dashboard stats/activity feed, drag-and-drop reordering (beat sheets), CI
(lint/typecheck/test/build), Cloudflare Pages deploy config (`_redirects`, `_headers`), and
Sentry error reporting. Remaining gaps for those modules are called out below (exports, visual
character graphs).

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

## 🎬 Screenplay Module — shipped, gaps remain
Full editor (element cycling, scene list sidebar, scene metadata panel, Supabase-backed
scenes/elements, page count + runtime estimator) is built. Remaining:

- FDX / Fountain export (not implemented)
- Pre-populate scene placeholders from the Beat Sheet → Scene converter (blocked on that
  Phase 2 feature below)

---

## 🖼 Storyboard Module — shipped, gaps remain
Panel grid, sketch canvas (draw/erase), shot type/movement/lens tags, action + dialogue note,
duration estimate, and Supabase-persisted sketch uploads are built. Remaining:

- Auto-generate a panel placeholder per beat (Opening Image / Final Image mandatory) — not
  wired up yet
- Panel sequence export as PDF / image strip

---

## 📋 Shot List Module — shipped, gaps remain
Tabular view (12 columns), scene/location filters, sort by shot number, and Supabase
persistence are built. Remaining:

- Location grouping optimiser (group by location → by lighting setup → wide before coverage)
- Golden hour shot flagging
- Export as CSV / PDF call sheet

---

## 👤 Character Module — shipped, gaps remain
Profile fields (want/need/wound/ghost/voice/backstory etc.), scene-count stat, and Supabase
persistence are built. Relationships and arc are currently free-text, not visualized:

- Character arc graph — emotional state at each beat (X = beat, Y = emotion), visual not text
- Relationship map — network graph of character dynamics, currently a text field per character
- First appearance auto-detected from beat character assignments
- Continuity warnings: character disappears for too many consecutive beats

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

- Project settings page (change title, format, genres, thumbnail, target pages)
- Activity log per project (who changed what, when)
- Keyboard shortcuts map modal (`?` key)
- Onboarding flow for new users (step-by-step first project setup)
- Dark/light theme toggle
- Mobile-responsive layout (tablet at minimum)
- Offline support via Zustand persist + sync on reconnect
