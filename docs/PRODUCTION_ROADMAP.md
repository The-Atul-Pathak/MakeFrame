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
| 5 | Deploy frontend to Cloudflare Pages | ⬜ |
| 6 | Custom domain, DNS & HTTPS | ⬜ |
| 7 | CI/CD: automatic deploys, previews & rollback | ⬜ |
| 8 | Monitoring, analytics & error tracking | ⬜ |
| 9 | Security hardening & production audit | ⬜ |
| 10 | Backups & disaster recovery | ⬜ |
| 11 | Production testing & go-live | ⬜ |

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

Secrets NOT stored here (keep in your password manager): the database password,
the Supabase `service_role`/secret key, and the Google OAuth client secret.

## Human-only actions (everything else is automated/driven for you)

Creating accounts, entering payment info, verifying emails, and clicking final
confirm/authorize buttons. These are called out explicitly at each phase.
