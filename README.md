# MakeFrame

A pre-production suite for filmmakers — screenplay, beat sheet, storyboard, shot list, and
character tools in one place. Built as a single-page app backed by Supabase (Postgres + Auth +
Storage), enforcing a one-way data flow: **Screenplay → Storyboard → Shot List**, where upstream
changes flag downstream items for review.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 (design tokens via CSS custom properties) |
| State | Zustand (client cache / optimistic buffer) |
| Backend | Supabase — Postgres (source of truth), Auth, Storage |
| Routing | React Router v7 |
| Tests | Vitest + Testing Library |
| Hosting | Cloudflare Pages (frontend) + Supabase Cloud (backend) |

## Prerequisites

- Node.js 20+ (the repo is developed on Node 25)
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for the local backend)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Then start the local backend and copy its credentials into .env:
supabase start          # prints API URL + anon key
supabase db reset       # applies migrations in supabase/migrations

# 3. Run the app
npm run dev             # http://localhost:5173
```

`.env` is git-ignored and **required** — the app fails fast at startup if
`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing (it will not silently fall back to a
default database). See [Environment variables](#environment-variables).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (flat config) |
| `npm run lint:fix` | ESLint with autofix |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Verify formatting (used in CI) |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report |

## Environment variables

All browser-exposed variables must be prefixed with `VITE_`. Never put a service-role key or any
server-only secret in a `VITE_` variable — Vite inlines them into the public bundle. See
[`.env.example`](.env.example) for the full annotated list.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | Supabase API URL (local or hosted) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key (safe to expose; RLS protects data) |
| `VITE_APP_ENV` | — | `development` \| `staging` \| `production` |
| `VITE_SENTRY_DSN` | — | Error reporting DSN. Sentry is wired into `ErrorBoundary` and background sync failures (`src/lib/sentry.ts`) but no-ops until this is set |

## Project structure

```
src/
  components/   Feature-scoped UI (beat/, beatsheet/, screenplay/, storyboard/, shotlist/,
                characters/, workspace/, shared/, …)
  pages/        Route-level screens (Dashboard, BeatSheet, Screenplay, Storyboard, ShotList,
                Characters, Login/Signup/ForgotPassword/ResetPassword, ProjectWorkspace)
  contexts/     AuthContext / AuthProvider (Supabase email+password + Google OAuth)
  store/        Zustand slices (client cache / optimistic writes)
  services/     Supabase data-access layer (projects, scenes, panels, shots, characters, beatSheets)
  data/         Static reference data (beat-sheet frameworks, framework conversions)
  lib/          Cross-cutting clients (supabase.ts, sentry.ts)
  types/        Shared TypeScript types
  utils/        Pure helpers (validation, conversions, formatters)
  test/         Test setup
supabase/
  migrations/   Ordered, forward-only SQL migrations (schema, RLS, functions, storage)
docs/           Internal design + domain knowledge notes
```

## Architecture notes

- **Supabase Postgres is the source of truth.** Identity lives in `auth.users`; access is enforced
  by Row-Level Security (RLS), not application code. Storage holds sketches, thumbnails, and exports.
- **Zustand is a client-side cache / optimistic write buffer** — durable persistence belongs in
  Supabase, not `localStorage`.
- **Security:** every table has RLS policies keyed on project ownership/membership via
  `security definer` helper functions (`has_project_access`, `can_edit_project`). The anon key is
  intentionally public; RLS is the security boundary.

## Database

Migrations are plain SQL under `supabase/migrations/`, applied in filename order and forward-only.

```bash
supabase db reset                       # rebuild local DB from all migrations
supabase migration new <name>           # scaffold a new migration
supabase db push                        # apply to the linked hosted project
```

## Deployment

The frontend deploys as static assets to **Cloudflare Pages**; the backend is **Supabase Cloud**.
CI/CD and full deployment steps are documented in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## License

Proprietary — all rights reserved (update if this changes).
