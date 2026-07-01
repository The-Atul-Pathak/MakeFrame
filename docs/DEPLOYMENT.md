# Deployment

MakeFrame is a static SPA (Vite build output) backed by Supabase Cloud. There is no
server to operate — the frontend deploys to **Cloudflare Pages** and talks directly to
Supabase's hosted Postgres/Auth/Storage APIs over HTTPS.

## One-time hosted Supabase setup

These steps happen once, in the Supabase Dashboard for your hosted project (not in
`supabase/config.toml`, which only drives the local CLI emulator).

### 1. Apply database migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 2. Configure Google OAuth

The app calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
(`src/contexts/AuthProvider.tsx`). Supabase needs real Google OAuth credentials to
complete that flow — these can't be generated from this repo, so create them manually:

1. **Google Cloud Console** → [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
   - Create an OAuth 2.0 Client ID, application type **Web application**.
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     (find the exact value on the Supabase Dashboard's Google provider page — it
     prefills this for you).
   - Authorized JavaScript origin: your production domain (and `http://localhost:5173`
     for local dev, if you want to test Google sign-in locally).
2. **Supabase Dashboard** → Authentication → Providers → Google.
   - Enable the provider, paste the Client ID and Client Secret from step 1.
3. Confirm `enable_anonymous_sign_ins` is **off** under Authentication → Settings — the
   app no longer uses anonymous sessions (see `supabase/config.toml`).

### 3. Configure a production SMTP provider

By default, Supabase's built-in email sender is rate-limited to a handful of emails per
hour (`auth.rate_limit.email_sent` in `supabase/config.toml`) — fine for local
development, **not enough for real signup confirmations or password resets**. Before
inviting real users:

1. Pick a free-tier transactional email provider (e.g. Resend, Mailgun, Brevo — all
   have free tiers suitable for early-stage volume).
2. Supabase Dashboard → Authentication → Settings → SMTP Settings → enable a custom
   SMTP server with that provider's credentials.
3. Raise `auth.rate_limit.email_sent` to a value appropriate for your expected signup
   volume.

This is a deliberate manual step: it requires picking a provider and creating an
account, which isn't something that can be decided or provisioned automatically.

## Frontend deployment (Cloudflare Pages)

1. Push this repo to GitHub (if not already) and connect the repo in the Cloudflare
   Pages dashboard, or deploy via the `wrangler` CLI / GitHub Actions (see
   `.github/workflows/`).
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20 or later
3. Environment variables (Cloudflare Pages → Settings → Environment variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (optional) `VITE_SENTRY_DSN`, `VITE_APP_ENV` — Sentry is already wired into
     `ErrorBoundary` and background sync failures; it no-ops until `VITE_SENTRY_DSN` is set
4. SPA routing: Cloudflare Pages needs a fallback so client-side routes
   (`/login`, `/project/:id`, etc.) don't 404 on direct load or refresh. Handled by
   `public/_redirects` (already in the repo).
5. Security headers (CSP, HSTS, X-Frame-Options, etc.) are set via `public/_headers`
   (already in the repo) — Cloudflare Pages applies these automatically on deploy, no
   dashboard configuration needed. The CSP's `connect-src`/`img-src` allow
   `https://*.supabase.co`; if you self-host Supabase instead, update those directives
   to match your Supabase URL's domain.

## CI/CD

GitHub Actions runs lint, typecheck, tests, and a production build on every push and
pull request (see `.github/workflows/ci.yml`). Cloudflare Pages deploys automatically
from the connected branch once CI passes.

## Rollback

Cloudflare Pages keeps every previous deployment. To roll back, open the Pages project
→ Deployments → pick a prior successful deployment → **Rollback to this deployment**.
Database migrations are forward-only; a schema rollback means writing and applying a
new corrective migration, not reverting a deploy.
