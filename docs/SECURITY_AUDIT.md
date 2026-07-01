# MakeFrame — Production Security Audit

_Last reviewed: 2026-07-02 · Live target: https://makeframe-prod.pages.dev_

This audit reflects the production deployment (Cloudflare Pages + Supabase Cloud). It is a
living document — re-review after major changes.

## Summary

| Area | Status | Notes |
| --- | --- | --- |
| HTTPS / TLS | ✅ | Automatic via Cloudflare; HTTP→HTTPS enforced |
| HSTS | ✅ | `max-age=31536000; includeSubDomains; preload` |
| Security headers | ✅ A+ | External scan (securityheaders.com) = **A+** |
| Content-Security-Policy | ✅ | Strict allow-list; verified not breaking the app |
| XSS protection | ✅ | React auto-escaping + CSP (`object-src 'none'`, no inline scripts) |
| Clickjacking | ✅ | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| SQL injection | ✅ | All DB access via Supabase/PostgREST (parameterized); no raw SQL in client |
| Row-Level Security | ✅ | Enabled on every table; per-row policies via `security definer` helpers |
| Secrets management | ✅ | `.env` git-ignored; only public `VITE_` values in bundle; service-role key never client-side |
| CI/CD secrets | ✅ | Stored as encrypted GitHub Actions secrets |
| Rate limiting (auth) | ✅ | Supabase default auth rate limits active |
| Edge/DDoS protection | ✅ | Cloudflare edge in front of all traffic |
| Error tracking | ✅ | Sentry (`sendDefaultPii: false` — no PII sent) |
| CAPTCHA on auth | ⚠️ future | Available; needs a Turnstile/hCaptcha widget in the auth forms first |
| Leaked-password check | ⚠️ on Pro | Enable in Supabase Attack Protection after upgrading to Pro |
| MFA | ⚠️ optional | Supabase supports TOTP MFA; not yet enabled in-app |

## Verified security headers (live)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://*.supabase.co;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloudflareinsights.com https://*.sentry.io;
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

Managed in `public/_headers`. `style-src` allows `'unsafe-inline'` only for styles (needed by the
current styling approach) — this is low-risk; script execution is fully locked to `'self'` +
Cloudflare's analytics domain.

## Data-layer security

- **RLS is the boundary, not the anon key.** The publishable/anon key is intentionally public
  (shipped in the browser bundle). Every table enforces Row-Level Security so a user can only
  read/write their own project data. This was verified in the dashboard (policies present on all
  tables) and in practice (a signed-in user sees only their own project).
- **API CORS** is managed by Supabase (its REST/Auth endpoints accept the anon key from any
  origin by design; RLS restricts what that key can actually do). The static site's
  `access-control-allow-origin: *` is a Cloudflare Pages default on public assets and exposes
  nothing sensitive.
- **Storage** buckets: `sketches`/`exports` private, `thumbnails` public — each with access
  policies.

## Recommended next hardening (prioritised)

1. **Leaked-password protection** — enable in Supabase → Auth → Attack Protection after moving to
   Pro. No app change required.
2. **CAPTCHA on auth** — add Cloudflare Turnstile to Login/Signup/Reset forms, then enable CAPTCHA
   in Supabase Attack Protection. Blocks credential-stuffing bots.
3. **MFA (TOTP)** — Supabase supports it; add an enrolment flow in account settings for users who
   want it.
4. **Review Supabase auth rate limits** (Auth → Rate Limits) once real traffic patterns are known;
   raise `email_sent` after production SMTP is configured (Phase 4).
5. **Dependency scanning** — enable GitHub Dependabot alerts for the repo.

## Secrets inventory (where each lives)

| Secret | Location | Never in |
| --- | --- | --- |
| Supabase DB password | Your password manager | Repo, bundle |
| Supabase service-role / secret key | Supabase dashboard only | Repo, bundle, client |
| Google OAuth client secret | Supabase Google provider config | Repo, bundle |
| Cloudflare API token | GitHub Actions secret | Repo source, bundle |
| Supabase URL / anon key, Sentry DSN | GitHub Actions secrets + public bundle (safe) | — |
