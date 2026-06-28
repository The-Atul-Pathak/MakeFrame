# MakeFrame — Pre-Production Suite

## Stack
Vite + React 18 + TypeScript + Tailwind CSS + Zustand + Supabase Auth/Postgres/Storage + Shadcn/ui

## Skills to load before any task
- For any UI/component work: read `visuals.md` first
- For any screenplay/storyboard/shot list logic: read `knowledge.md` first
- For both: read both

## Project structure
src/components/{screenplay|storyboard|shotlist|shared}/
src/store/ → Zustand slices (sceneSlice, panelSlice, shotSlice, characterSlice, beatSheetSlice, syncStatusSlice)
src/types/ → all TypeScript interfaces
src/utils/ → formatters, calculators

## Data flow (one-way, enforced)
Screenplay → Storyboard → Shot List
Upstream changes flag downstream items { needsReview: true }

## Important
Everytime we add something to the frontend you will tell me in the chat the backend/database
requirements for it to make it functional

## Backend and persistence
Supabase Postgres is the source of truth. Supabase Auth owns identity through
`auth.users`, project access is enforced with RLS, and Supabase Storage holds
panel sketches, thumbnails, and generated exports.

Zustand is a client-side cache and offline write buffer. It may queue optimistic
writes locally, but durable persistence belongs in Supabase, not localStorage.

## Hard rules
- All colour values via CSS custom properties only — never raw hex in JSX
- Courier Prime font ONLY on the screenplay canvas element
- DM Mono ONLY for labels, tags, scene numbers, metadata

## Conventions
- Files: PascalCase components, camelCase hooks (useSceneStore.ts), camelCase utils
- Every new component: check visuals.md for tokens before writing a single className
- Every new feature touching screenplay format: check knowledge.md for rules

## .gitignore maintenance
Whenever you add a tool, generate a new file type, or introduce a config that produces
artifacts (build outputs, caches, temp files, secrets), add the relevant pattern to
.gitignore before committing. Common additions to watch for:
- New package managers → their lock files / cache dirs (e.g. .pnpm-store/, .yarn/)
- New build tools → their output dirs (e.g. .turbo/, .next/, .svelte-kit/)
- New env files → .env.*, *.pem, *.key
- Supabase local/temp files → supabase/.temp/
- New editor configs → .cursor/, .windsurf/
- Sketch / export files → *.sketch, *.fig
