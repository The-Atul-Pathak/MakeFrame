# MakeFrame — Backups & Disaster Recovery

_Live DB: Supabase project `tmejdmvlultcasxuejjl` (region ap-south-1)_

## Current reality (Free plan)

**The Supabase Free plan includes NO automated database backups.** This is confirmed in the
dashboard (Database → Backups). This is acceptable only while there is no real user data
(pre-launch). **Before onboarding real users, do ONE of the following.**

## Option A (recommended) — Supabase Pro

Upgrade the project to **Pro ($25/mo)**. This gives:

- **Daily automated backups**, retained 7 days.
- **Point-in-Time Recovery (PITR)** — restore to any moment within the retention window.
- No project pausing (Free pauses after ~7 days of inactivity).

Restore (Pro): Dashboard → Database → Backups → **Point in time** → choose a timestamp →
restore. Or "Restore to new project" to recover into a fresh project without touching prod.

This is the right choice for a production SaaS — do it before real signups.

## Option B (free-tier stopgap) — scheduled logical backups

`.github/workflows/db-backup.yml` runs a weekly `pg_dump` (and on-demand via "Run workflow")
and stores the dump as a GitHub Actions artifact for 30 days. It is a **no-op until you add
the connection-string secret**:

1. Supabase dashboard → **Connect** (top bar) → **Connection string** → **URI** (use the
   **Session pooler** string). It contains your DB password.
2. GitHub → repo **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `SUPABASE_DB_URL`
   - Value: the URI from step 1.
3. Trigger once manually: **Actions → Database backup → Run workflow** to confirm it produces a
   `makeframe-*.dump` artifact. It then also runs weekly.

Note: artifacts live in GitHub for 30 days. For longer retention, download important dumps, or
extend the workflow to push to object storage (Cloudflare R2 / Backblaze B2).

### Restore from a logical dump

Download the `.dump` artifact, then restore into a target Supabase project (a NEW/empty project
is safest; restoring over prod overwrites data):

```bash
# Recreate schema + data from a custom-format dump
pg_restore --no-owner --no-privileges --clean --if-exists \
  -d "<TARGET_SUPABASE_DB_URL>" makeframe-YYYYMMDD-HHMMSS.dump
```

Then re-point the app's `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (GitHub secrets) at the
target project and redeploy.

## Schema / migrations recovery

Database schema is version-controlled as forward-only SQL migrations in `supabase/migrations/`.
A schema can always be rebuilt on a fresh project with `supabase db push`. A "schema rollback"
is done by writing a new corrective migration — never by editing history.

## What is NOT covered by DB backups

- **Storage buckets** (`sketches`, `exports`, `thumbnails`): objects are not in the Postgres
  dump. On Pro, storage is included in backups. On free tier, if you store important files,
  periodically sync buckets out (e.g., `supabase storage` CLI or the S3-compatible endpoint).
- **Auth users** live in the `auth` schema and ARE included in `pg_dump` of the full database
  and in Supabase's own backups.

## Recovery checklist (if prod is lost)

1. Create/identify a target Supabase project (or use PITR on Pro).
2. Restore data (PITR on Pro, or `pg_restore` of the latest dump on free tier).
3. Verify row counts and that RLS policies exist (Database → Policies).
4. Re-sync storage objects if applicable.
5. Update `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` GitHub secrets if the project ref
   changed; re-run the deploy workflow.
6. Update Supabase Auth URL config + Google OAuth redirect URI if the project ref changed.
7. Smoke-test signup / login / data access.
