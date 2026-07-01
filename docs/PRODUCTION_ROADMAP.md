# MakeFrame — Production Deployment Roadmap

This is the living plan for taking MakeFrame from local development to a secure,
scalable, production-grade SaaS deployment. Each phase is completed and checked off
before the next begins.

## Architecture at a glance

MakeFrame is a **static single-page app** (Vite build → static HTML/JS/CSS) that talks
directly to **Supabase Cloud** (managed Postgres + Auth + Storage) over HTTPS. There is
**no custom backend server** to operate.

```
Browser ──HTTPS──> Cloudflare Pages (static SPA, CDN, TLS, security headers)
   │
   └──HTTPS/WSS──> Supabase Cloud
                     ├─ Postgres (source of truth, protected by Row-Level Security)
                     ├─ Auth (email/password, Google OAuth, email verify, reset)
                     └─ Storage (sketches, thumbnails, exports)
```

Why this shape (and why NOT Docker / reverse proxy / a backend host): the app has no
server code of its own, so there is nothing to containerize or put behind Nginx. The CDN
(Cloudflare) *is* the edge/reverse-proxy layer, and Supabase *is* the managed backend.
Adding Docker/VMs here would increase cost, attack surface, and ops burden for zero
benefit. This is the standard modern "JAMstack + managed backend" pattern used by many
startups.

## Chosen stack & why

| Concern | Choice | Why |
| --- | --- | --- |
| Frontend hosting | **Cloudflare Pages** (free) | Global CDN, free unlimited bandwidth, automatic TLS, Git-based deploys, instant rollback, `_headers`/`_redirects` already in repo |
| Backend / DB / Auth / Storage | **Supabase Cloud** (free → Pro $25/mo) | App already built against it; managed Postgres + Auth + Storage + RLS; free tier to start, Pro for daily backups/no-pausing before real users |
| Transactional email | **Resend** (free 3k/mo) | Clean API, generous free tier, easy Supabase SMTP integration for verify/reset emails |
| Error tracking | **Sentry** (free) | Already wired into the app (`src/lib/sentry.ts`); just needs a DSN |
| Analytics | **Cloudflare Web Analytics** (free) | Privacy-friendly, no cookie banner, zero client weight, same dashboard as hosting |
| Uptime monitoring | **Better Stack** or **UptimeRobot** (free) | External health checks + alerting |
| Domain | **Cloudflare Registrar** (at-cost) | No markup, DNS + registrar + hosting in one place |
| CI/CD | **GitHub Actions + Cloudflare Pages Git integration** | CI already present; Pages auto-deploys on push + preview deploys on PRs |

Budget decision: **start free, upgrade Supabase to Pro before onboarding real users**
(daily backups, no 7-day pausing, more capacity).

## Phases

| # | Phase | Status |
| --- | --- | --- |
| 1 | Verify known-good build & merge to `main` | ✅ |
| 2 | Provision hosted Supabase (production database) | ✅ |
| 3 | Google OAuth credentials | ✅ |
| 4 | Production email (SMTP) for verification & reset | ⬜ |
| 5 | Deploy frontend to Cloudflare Pages | ✅ live at makeframe-prod.pages.dev |
| 6 | Custom domain, DNS & HTTPS | ⬜ |
| 7 | CI/CD: automatic deploys, previews & rollback | ✅ |
| 8 | Monitoring, analytics & error tracking | ✅ |
| 9 | Security hardening & production audit | ✅ A+ (see SECURITY_AUDIT.md) |
| 10 | Backups & disaster recovery | ✅ (see BACKUP_DR.md) |
| 11 | Production testing & go-live | 🟡 core flows verified; see GO_LIVE_CHECKLIST.md |

## What's already done in the codebase (no work needed)

- Full auth flows coded: email/password, Google OAuth, email verification, password
  reset, update password (`src/contexts/AuthProvider.tsx`).
- Row-Level Security on every table via `security definer` helpers
  (`has_project_access`, `can_edit_project`) — 18 ordered SQL migrations.
- Security headers + strict CSP (`public/_headers`); SPA routing (`public/_redirects`).
- Sentry error reporting wired into the ErrorBoundary + background sync.
- CI pipeline: lint, typecheck, test, build on every push/PR.
- Fail-fast env validation — a misconfigured production deploy crashes loudly instead
  of silently talking to the wrong database (`src/lib/supabase.ts`).

## Production environment reference (non-secret)

| Item | Value |
| --- | --- |
| Supabase project | `makeframe-prod` (org: MakeFrame, Free plan) |
| Project ref | `tmejdmvlultcasxuejjl` |
| Supabase URL (`VITE_SUPABASE_URL`) | `https://tmejdmvlultcasxuejjl.supabase.co` |
| Region | South Asia (Mumbai) · `ap-south-1` |
| Anon/publishable key (`VITE_SUPABASE_ANON_KEY`) | `sb_publishable_...` (safe to expose; RLS is the security boundary) |
| Storage buckets | `sketches` (private), `exports` (private), `thumbnails` (public) |
| Google Cloud project | `MakeFrame` (`makeframe-501119`), OAuth app published to production |
| Google OAuth Client ID | `589075775679-9467p7a8gvjtdgttsgpart2dr30re32s.apps.googleusercontent.com` |
| Google OAuth redirect URI | `https://tmejdmvlultcasxuejjl.supabase.co/auth/v1/callback` |
| Live app URL | `https://makeframe-prod.pages.dev` |
| Cloudflare account ID | `01d939951a06311abac670d7da5928ed` |
| Cloudflare Pages project | `makeframe-prod` |

## CI/CD (Phase 7)

Deployment is scripted via `.github/workflows/deploy.yml` (no dashboard Git
integration — that handshake was unreliable). On every push to `main` the workflow
builds and deploys to production; on every pull request it deploys a **preview** to a
per-branch `*.makeframe-prod.pages.dev` URL. Required GitHub repo secrets:
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`.

**Rollback:** two options — (a) Cloudflare dashboard → Pages → makeframe-prod →
Deployments → pick a previous successful deployment → *Rollback to this deployment*;
or (b) `git revert <bad-commit> && git push`, which redeploys the prior good state.
Database migrations are forward-only; a schema rollback means a new corrective migration.

## Monitoring (Phase 8)

- **Error tracking:** Sentry (React project "makeframe", EU region). DSN wired via the
  `VITE_SENTRY_DSN` GitHub secret → build → `src/lib/sentry.ts`. CSP `connect-src` allows
  `https://*.sentry.io`.
- **Analytics:** Cloudflare Pages built-in analytics (dashboard → Pages → makeframe-prod →
  Metrics). The CSP also permits `https://static.cloudflareinsights.com` /
  `https://cloudflareinsights.com` so the richer client-side Web Analytics beacon can be
  enabled anytime with no code change.
- **Uptime:** UptimeRobot HTTP(s) monitor on `https://makeframe-prod.pages.dev`, 5-min interval,
  email alerts.
- **Health check:** `public/health.txt` → served at `/health.txt` (returns `ok`).

## Supabase auth URLs (set in Phase 5)

- Site URL: `https://makeframe-prod.pages.dev`
- Redirect allow-list: `https://makeframe-prod.pages.dev/**`,
  `https://*.makeframe-prod.pages.dev/**` (preview deploys), `http://localhost:5173/**` (dev)

Secrets NOT stored here (keep in your password manager): the database password,
the Supabase `service_role`/secret key, and the Google OAuth client secret.

## Human-only actions (everything else is automated/driven for you)

Creating accounts, entering payment info, verifying emails, and clicking final
confirm/authorize buttons. These are called out explicitly at each phase.
