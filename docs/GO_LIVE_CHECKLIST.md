# MakeFrame — Go-Live Checklist

_Live: https://makeframe-prod.pages.dev_

## ✅ Verified in production

- [x] App loads over HTTPS with valid TLS
- [x] Security headers present — **A+** (securityheaders.com)
- [x] CSP active and not breaking the app (assets, fonts, Supabase all load)
- [x] Email/password **signup** works
- [x] **Email verification** works (Confirm-email is ON; account was confirmed + logged in)
- [x] **Login** + session persistence works
- [x] **Database** reads/writes work (project created and persisted)
- [x] **Row-Level Security** enforced (user sees only their own data)
- [x] SPA routing works on deep links / refresh
- [x] CI runs lint + typecheck + tests + build on every push
- [x] **Auto-deploy** to production on push to `main`; **preview deploys** on PRs
- [x] Error tracking (Sentry) wired and deployed
- [x] Analytics (Cloudflare Pages) + uptime monitoring (UptimeRobot) active
- [x] DR runbook + weekly logical-backup workflow in place

## 🟡 Remaining interactive tests (quick, need you)

- [ ] **Google OAuth** — click "Continue with Google", complete consent, confirm it returns you
      signed in. (Config is done; just needs a live run. Requires signing out first.)
- [ ] **Password reset** — "Forgot password?" → check email → set new password → log in.
- [ ] Core app flows you care about (screenplay → storyboard → shot list, exports, etc.).

## 🔴 Gates before onboarding REAL users

- [ ] **Custom domain** (Phase 6) — register `makeframe.org`, attach to Pages, update Supabase
      Site/redirect URLs + Google OAuth origins.
- [ ] **Production email** (Phase 4) — Resend + verified domain + Supabase custom SMTP, so
      verification/reset emails scale beyond the built-in sender's low rate limit.
- [ ] **Supabase Pro** — enable daily backups + PITR (and stop free-tier pausing) before real
      data matters. See BACKUP_DR.md.

## Optional hardening (post-launch)

- [ ] Leaked-password protection (Supabase Attack Protection; Pro)
- [ ] CAPTCHA on auth forms (add Turnstile widget, then enable in Supabase)
- [ ] TOTP MFA enrolment flow
- [ ] GitHub Dependabot alerts

## Documentation index (docs/)

- `PRODUCTION_ROADMAP.md` — architecture, phase status, environment reference
- `SECURITY_AUDIT.md` — security posture + recommendations
- `BACKUP_DR.md` — backups & disaster recovery runbook
- `DEPLOYMENT.md` — original deployment notes
- `GO_LIVE_CHECKLIST.md` — this file
