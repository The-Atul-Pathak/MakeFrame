# Marketing Audit: MakeFrame
**URL:** https://makeframe-prod.pages.dev/
**Date:** 2026-07-14
**Business Type:** SaaS/Software — film pre-production suite (screenplay, beat sheets, storyboard, shot list, characters). Currently **pre-launch from a marketing standpoint**: the product exists and works, but no public marketing site exists yet.
**Overall Marketing Score: 10/100 (Grade: F)**

---

## Executive Summary

MakeFrame's production URL does not lead to a marketing site — it leads directly to a login form. There is no headline, no value proposition, no pricing, no feature explanation, no screenshots, no testimonials, and no way for a visitor to learn what the product does before being asked to create an account. Every category in this audit scores near zero not because the execution is poor, but because the marketing layer has not been built yet. This is the single finding that matters most: **MakeFrame is a finished product with no funnel in front of it.**

The good news is that this is the best kind of low score to have. Nothing here requires fixing bad copy or rebuilding a broken funnel — it requires building a funnel for the first time, on top of a product that (per the signup flow, Supabase auth, and the module set described in the site's own meta tag: screenplay, storyboards, beat sheets, shot lists, plus a characters module) is already functionally real. The one bright spot uncovered in this audit: MakeFrame's scope — going from beat sheet through shot list in one continuous tool — is a genuinely defensible angle that neither of the two closest competitors (Celtx, StudioBinder) leads with in their own marketing.

The three highest-leverage actions, in order: (1) ship a minimal public landing page with a headline, a value prop, and screenshots before the login wall — right now there is literally nothing for a first-time visitor to read; (2) fix a routing bug where any unregistered URL (e.g. a link to `/pricing` or `/features`) renders a completely blank page, which will silently kill any paid or referral traffic sent to those URLs; (3) publish a transparent pricing page with a free or low-cost indie tier, since every named competitor (Celtx, StudioBinder, Studiovity) publishes pricing and MakeFrame currently does not.

Because there is no landing page and no analytics-visible traffic today, this audit cannot model revenue impact from MakeFrame's own numbers — there is no baseline to lift from. The Revenue Impact section below instead sizes the opportunity using named-competitor benchmarks and should be read as directional, not a data-driven projection.

---

## Score Breakdown

| Category | Score | Weight | Weighted Score | Key Finding |
|----------|-------|--------|---------------|-------------|
| Content & Messaging | 10/100 | 25% | 2.5 | No headline, value prop, or body copy exists anywhere on the public site |
| Conversion Optimization | 15/100 | 20% | 3.0 | Signup form itself is lean and mobile-clean, but there is no top-of-funnel and a routing bug renders unknown URLs blank |
| SEO & Discoverability | 5/100 | 20% | 1.0 | No robots.txt, sitemap, per-page titles, OG tags, or crawlable content; pure client-rendered SPA with a single generic title site-wide |
| Competitive Positioning | 8/100 | 15% | 1.2 | Product scope matches proven demand (Celtx, Studiovity) but MakeFrame is invisible in every public comparison |
| Brand & Trust | 8/100 | 10% | 0.8 | No About/team page, no Privacy/Terms links, no social proof — nothing to verify the company is real before handing over credentials |
| Growth & Strategy | 12/100 | 10% | 1.2 | No acquisition channel exists yet; niche has well-worn, low-cost playbooks (Reddit, Product Hunt, template SEO) sitting unused |
| **TOTAL** | | **100%** | **9.7 ≈ 10/100** | |

---

## Quick Wins (This Week)

1. **Ship a minimal public landing page before the login wall.** Right now, `https://makeframe-prod.pages.dev/` renders straight to "Welcome back / Sign in to continue to your projects." A first-time visitor has zero way to learn what MakeFrame is. Add: a one-line headline, a one-sentence value prop, 3-4 product screenshots (Screenplay, Storyboard, Shot List views), and a single clear CTA into signup. *Why it matters: this single change unlocks every other category — content, conversion, and SEO are all currently blocked by its absence.*

2. **Fix the blank-page routing bug.** Direct navigation to any unregistered route (`/pricing`, `/about`, `/features` all tested) renders a fully blank dark screen — no 404, no redirect, no content. Any marketing link, ad, or shared URL pointed at a page that doesn't exist yet will silently look broken. Add a catch-all redirect to the homepage or a real 404 state.

3. **Add per-page `<title>` and meta description tags, plus Open Graph/Twitter Card tags with an image.** Currently every route serves the identical static title ("MakeFrame") and description regardless of what's on screen, and there are zero OG tags — meaning any link to MakeFrame shared in Slack, iMessage, or X shows no preview image and generic text.

4. **Add a real `robots.txt` and `sitemap.xml`.** Both currently exist as URLs but silently return the SPA's HTML shell instead of actual directives — there is nothing telling search engines what to crawl or index.

5. **Add Privacy Policy and Terms of Service links to the login/signup screen**, plus a one-line reassurance near the password field (e.g., "your scripts stay private"). Writers are being asked to hand over unproduced creative work to an entity with zero visible identity or policy — this is a real hesitation point, not a formality.

6. **Draft a Product Hunt launch post** built around the Screenplay → Storyboard → Shot List workflow. Recent comparable launches in this space (dr.aft, Porcupine, Melies) confirm Product Hunt is still an active, low-cost discovery channel for screenwriting/filmmaking tools.

## Strategic Recommendations (This Month)

7. **Publish a transparent pricing page with a generous free or low-cost indie tier.** Every named competitor publishes pricing: Celtx ($14.99–$59.95/mo, 7-day trial), StudioBinder ($42–$340/mo, limited free plan), Studiovity (from $2.50/mo, explicitly undercutting to win solo/student filmmakers). MakeFrame currently has no pricing page at all, which is a hard blocker for anyone comparison-shopping.

8. **Launch a community space and post directly in the niche's default discovery communities** — r/screenwriting and r/filmmakers on Reddit are the first-stop validation communities for tool discovery here; a Discord server is the community-led-growth model Sudowrite (18,000+ member Discord) credits as its primary distribution engine.

9. **Build 2-3 free SEO template/tool pages** (e.g., "free shot list template," "free beat sheet template") — this is a proven playbook in this exact niche: Boords' founder built a single storyboard-template page that generated an estimated $200K in organic traffic value over three years (~$6K/month). MakeFrame currently has zero indexed content to compete on.

10. **Center hero messaging on the beat-sheet-to-shot-list pipeline, not feature bullets.** Of the three closest competitors, none foreground beat sheets in their own marketing. MakeFrame's own meta description already lists it. A message like "the only suite that starts at the beat sheet, not the blank page" is a differentiator none of them currently own.

11. **Wedge positioning explicitly against StudioBinder on scope, not features.** StudioBinder markets to full production teams (call sheets, crew, budgets, scheduling). MakeFrame should position as *creative pre-production only* — for writer-directors who want script-to-shot-list without adopting a full production-management suite they don't need.

## Long-Term Initiatives (This Quarter)

12. **Full brand/trust buildout:** an About/team page with a real founder story, a security/privacy statement, and testimonials as the first cohort of users comes on board. Right now there is nothing on the public site to verify the company is a real, ongoing concern.

13. **Affiliate/creator-partnership program** targeting screenwriting-adjacent YouTube channels (e.g., Film Courage, Lessons from the Screenplay) and film schools, following the affiliate model Sudowrite uses to drive a large share of its acquisition.

14. **Build comparison pages** ("MakeFrame vs. StudioBinder," "MakeFrame vs. Celtx") once the core marketing site exists. These are proven bottom-of-funnel search terms the competitors already rank for and MakeFrame currently has zero presence on.

15. **Move off pure client-side rendering for marketing pages** (static prerendering or SSR for the landing/pricing/comparison pages). MakeFrame is currently a 100% client-rendered SPA with an empty `<div id="root">` in the raw HTML — even after quick-win #1 ships, search engines and link-preview crawlers may not reliably see the content without prerendering, capping the ceiling on everything else in this plan.

---

## Detailed Analysis by Category

### Content & Messaging Analysis — 10/100

Verified directly by rendering the site: the entire public-facing content consists of two screens. The login screen reads "Welcome back / Sign in to continue to your projects." The signup screen reads "Create your account / Start pre-producing your next film." That second line is the only trace of brand voice anywhere in the product — a small, genuinely on-brand touch ("pre-producing," not the generic "get started") buried on a screen most visitors will never reach without already knowing what MakeFrame is.

There is no headline explaining the product, no value proposition, no body copy, no feature descriptions, no testimonials or social proof, no case studies, no blog, and no images anywhere (zero `<img>` tags site-wide). The only description of what MakeFrame actually does — "a film pre-production suite for screenplays, storyboards, beat sheets, and shot lists" — exists solely in an invisible HTML `<meta name="description">` tag; no human visitor ever sees it.

### Conversion Optimization Analysis — 15/100

The signup form itself is well-built: three fields (email, password, confirm password), a working "Continue with Google" OAuth option to reduce friction, and a clean, single-CTA-per-screen layout with no competing actions. Tested at a 375×812 mobile viewport, the layout reflows cleanly with no overlap or horizontal scroll — this is a genuinely solid piece of UI.

The problems are structural, not cosmetic. There is no top-of-funnel: a visitor lands on a credential-entry form with zero context for why they should sign up, which is an unusually high-friction ask (no free-trial framing, no "no credit card required," no value reinforcement). And direct navigation to any unregistered route — `/pricing`, `/about`, `/features` were all tested — renders a completely blank page with no error state or redirect. Any marketing campaign, paid ad, or shared link pointed at a page that doesn't exist in the router yet will look silently broken to the visitor.

### SEO & Discoverability Analysis — 5/100

Every route serves an identical static `<title>MakeFrame</title>` and the same single meta description, regardless of what's actually on screen — there is no per-page metadata. There are no Open Graph or Twitter Card tags of any kind, so shared links show no preview image and generic fallback text. There is no canonical tag and no structured data (`application/ld+json`) anywhere. `robots.txt` and `sitemap.xml` both resolve with HTTP 200, but both silently serve the SPA's HTML shell instead of real directives — functionally identical to not having them.

The site is a 100% client-rendered React SPA (`<div id="root"></div>` in the raw HTML with all content injected by JavaScript at runtime, no server-side rendering or prerendering detected). Combined with there being no actual content to index yet, there is currently nothing here for a search engine to rank. On the positive side, the page is lightweight and the `viewport` meta tag is correctly configured, so the mobile-friendliness baseline is in place once content exists.

### Competitive Positioning Analysis — 8/100

*(Full findings from research subagent)*

The "all-in-one film pre-production suite" niche is real but already contested. **StudioBinder** is the market leader, bundling screenplay import, storyboards, shot lists, call sheets, and scheduling — but skews toward full production management, not just pre-production ($42–$340/mo, 5 tiers, limited free plan). **Celtx** is the closest direct analog to MakeFrame's stated scope — screenplay, story development, storyboard, shot list, and production planning in one app, with 7M+ claimed users and G2 "Leader" badges ($14.99–$59.95/mo, 7-day free trial, transparent pricing). **Studiovity** is a smaller, newer AI-leaning competitor explicitly undercutting Final Draft/StudioBinder on price for solo indie filmmakers and students (from $2.50/mo). Single-stage specialists (Final Draft, WriterDuet, Arc Studio Pro for screenwriting; Boords, Milanote for storyboarding) remain strong in their individual lanes.

**Verdict:** "All-in-one pre-production" is not white space — Celtx and Studiovity already occupy it. MakeFrame's differentiation will have to come from focus, price, and specific module depth (beat sheets in particular), not from being first to bundle.

| Factor | MakeFrame | StudioBinder | Celtx | Studiovity |
|--------|-----------|--------------|-------|------------|
| Headline Clarity | 0/10 | 9/10 | 8/10 | 6/10 |
| Value Prop Strength | 0/10 | 9/10 | 8/10 | 7/10 |
| Trust Signals | 0/10 | 9/10 | 8/10 | 4/10 |
| CTA Effectiveness | 1/10 | 8/10 | 7/10 | 6/10 |
| Pricing Clarity | 0/10 | 7/10 | 8/10 | 7/10 |
| Content Depth | 0/10 | 9/10 | 7/10 | 6/10 |

### Brand & Trust Analysis — 8/100

*(Full findings from research subagent)*

A prospective user currently cannot answer basic pre-signup questions: who built this, is my script safe here, is this company still active? There is no About/team page, no founder name, and nothing to verify the company's legitimacy — WriterDuet, by contrast, built trust partly through named endorsements from working screenwriters. There is no visible Privacy Policy or Terms of Service link on the login or signup screen — industry scans of SaaS tools found this missing in roughly 15% of cases, and buyers actively distrust sites where a policy isn't discoverable near the signup form. There is no social proof, no security/compliance messaging, and no community presence, despite community links being close to standard for creative SaaS (Sudowrite's Discord has 18,000+ members and is its primary trust and discovery engine). For a tool asking writers to upload unproduced, IP-sensitive creative work, this is close to the floor — the score reflects that the product itself is clearly real and functional (working Supabase-backed auth), but none of the credibility scaffolding this audience expects is present yet.

### Growth & Strategy Analysis — 12/100

*(Full findings from research subagent)*

There is currently no acquisition channel of any kind — no SEO surface, no community presence, no findable launch history. Comparable niche tools built distribution through a small, repeatable set of channels: **content/SEO** (Boords' single storyboard-template page reportedly generated ~$200K in organic value over three years); **community-led growth** (Sudowrite attributes most new users to word-of-mouth inside Discords, Slacks, and subreddits); **Reddit** (r/screenwriting and r/filmmakers as default discovery/validation communities); **Product Hunt** (an active, low-cost channel per recent comparable launches like dr.aft and Porcupine); and **YouTube/creator partnerships** (channels like Film Courage and Lessons from the Screenplay, and film-school sponsorship deals). On pricing, competitors converge on tiered-by-project/seat pricing with a free or low-cost entry tier — an explicit "indie" tier, as StudioBinder offers, is now a category norm MakeFrame does not yet meet.

---

## Revenue Impact Summary

**A note on methodology:** standard revenue-impact modeling (traffic × conversion-rate lift × ARPU) requires a current traffic and conversion baseline. MakeFrame has neither — there is no landing page to measure and no visible analytics surface. The estimates below are therefore **directional, drawn from named-competitor and comparable-tool benchmarks**, not projections from MakeFrame's own data. Treat them as sizing the opportunity, not as a forecast.

| Recommendation | Est. Impact | Confidence | Timeline |
|---|---|---|---|
| Ship public landing page | Unlocks the entire top of funnel — currently $0 of marketing-driven revenue is structurally possible without it | High (structural, not a benchmark estimate) | 1 week |
| Fix blank-page routing bug | Prevents near-total loss of any paid, referral, or shared-link traffic sent to non-root URLs | High | 1 day |
| Transparent pricing + free/indie tier | Directionally +15–30% signup conversion vs. gating pricing entirely (industry pattern, not MakeFrame-specific data) | Medium | 2–4 weeks |
| SEO template pages (Boords-style playbook) | ~$2,000–6,000/mo in organic traffic value at 12+ month maturity, based on Boords' reported comparable result | Medium | 1 quarter |
| Community + Product Hunt launch | 200–1,000 signups in launch week (one-time), based on comparable niche launches | Medium | 1–2 weeks |
| **Total potential** | **Not quantifiable as a single number without a traffic baseline — see note above** | | |

---

## Next Steps

1. Ship the minimal public landing page and fix the blank-page routing bug — both are one-week-or-less fixes that unblock every other recommendation in this report.
2. Publish a transparent pricing page with a free or low-cost indie tier, and add Privacy/Terms links and basic trust signals to the signup flow.
3. Launch in the niche's proven low-cost channels (r/screenwriting, r/filmmakers, Product Hunt) once the landing page exists, centered on the beat-sheet-to-shot-list pipeline as the core differentiator.

*Generated by AI Marketing Suite — `/market audit`*
