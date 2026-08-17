# MakeFrame — Visual Design System
# Edit the values in each section to change the look of the whole platform.

## ─── ACCESSIBILITY FLOORS (non-negotiable) ────────────────────────────────────
# These three rules exist because the platform previously violated all three,
# which is what produced the "too minimalistic and hard to read" feedback.
#
# 1. TYPE FLOOR — nothing renders below 12px (--text-2xs). Body copy is 16px.
#    The only exception is ModuleMockups.tsx: aria-hidden decorative
#    miniatures, documented in the file itself.
# 2. TEXT CONTRAST — every text colour clears 4.5:1 (WCAG AA) against ALL
#    THREE surface levels, not just `background`. surface-raised (#2a2a2a) is
#    the tightest; check against that one.
# 3. FOCUS — never remove a focus indicator. index.css owns a global
#    :focus-visible amber ring. Do not add `outline: none` without a
#    replacement; the global rule uses !important precisely so an inline style
#    cannot silently defeat it.
#
# Interactive controls (inputs, selects, ghost buttons) need a 3:1 boundary per
# WCAG 1.4.11 — use --color-control-border, NOT --color-border, which is a
# decorative divider at ~1.5:1.

## ─── COLOURS ──────────────────────────────────────────────────────────────────
# These map directly to CSS custom properties in index.css.
# Change a value here and tell Claude to update index.css to match.
# Ratios in comments are measured against surface-raised, the tightest surface.

background:       #141414   # page / app background
surface:          #1e1e1e   # cards, panels, sidebar
surface-raised:   #2a2a2a   # elevated elements, dropdowns
border:           #3a3a3a   # decorative dividers ONLY (~1.5:1, not a control edge)
border-subtle:    #2e2e2e   # faintest hairlines
border-strong:    #585858   # emphasis dividers, hover borders
control-border:   #757575   # inputs / selects / ghost buttons — 3.12:1 ✓ 1.4.11

text-primary:     #f5f2ee   # headings, main content        — 12.86:1 ✓
text-secondary:   #b8b5b0   # labels, descriptions          —  7.02:1 ✓
text-tertiary:    #9a9792   # placeholders, hints           —  4.93:1 ✓ (AA floor;
                            # do not darken this — it is the tightest token)

accent:           #e09a45   # amber — primary CTA, active states, highlights
accent-hover:     #eaa855   # accent on hover
accent-muted:     #e09a4522 # accent at low opacity (backgrounds)
# Amber is ONLY ever used as dark-on-amber (background on accent = 7.79:1).
# Light text on the amber fill measures 2.47:1 — never introduce it.

success:          #8fb894   # sage green — completed, linked, confirmed —  6.46:1 ✓
warning:          #dba94f   # needs review flags                        —  6.70:1 ✓
danger:           #e08585   # delete, error, destructive actions        —  5.37:1 ✓

# Screenplay canvas only — the one light surface, so its ink runs dark.
# Ratios below are against canvas-bg.
canvas-bg:        #faf8f4   # near-white paper feel
canvas-text:      #1a1a1a   # dark ink on paper
canvas-ink-muted: #6b6660   # canvas chrome: labels, meta, page marks — 5.36:1 ✓
canvas-ink-accent:#7a5520   # canvas chrome hover / active            — 6.29:1 ✓
canvas-rule:      #a8a49d   # decorative dashed rules on paper
canvas-desk:      #e8e5e0   # surround the paper page sits on

## ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
# Font roles — do not mix these up

font-display:     "DM Serif Display"   # wordmark, large headings only
font-ui:          "Outfit"             # all body text, buttons, nav, UI copy
font-mono:        "DM Mono"            # scene numbers, tags, metadata, labels, stats
font-screenplay:  "Courier Prime"      # screenplay canvas ONLY — nowhere else

# Scale — base is 16px, the browser default and the floor for body copy.
# Defined as --text-* in index.css and consumed by tailwind.config.ts, so
# `text-sm` and `fontSize: var(--text-sm)` can never drift apart.
# ALWAYS reference a token. Never hardcode a rem value in JSX.
text-2xs:   0.75rem   # 12px — mono uppercase micro-labels. HARD FLOOR.
text-xs:    0.8125rem # 13px — tags, badges, dense metadata, table cells
text-sm:    0.875rem  # 14px — secondary text, captions, dense rows.
                      #        Also the floor for any form control.
text-base:  1rem      # 16px — body, inputs, buttons, nav, card titles
text-lg:    1.125rem  # 18px — prominent labels
text-xl:    1.375rem  # 22px — section headings
text-2xl:   1.75rem   # 28px — page titles
text-3xl:   2.25rem   # 36px — display / wordmark

# Marketing display type may use clamp() above text-3xl for fluid hero sizing.

font-weight-normal:   400
font-weight-medium:   500
font-weight-semibold: 600   # headings and emphasis — 500 is too close to 400
                            # at small sizes to register as a step
font-weight-bold:     700   # use sparingly — display font only

# Tracking: uppercase mono needs 0.08–0.1em, no tighter. Above 0.1em it stops
# reading as a word and becomes a row of glyphs.

## ─── SPACING ──────────────────────────────────────────────────────────────────
# Base unit = 4px. All spacing is multiples of this.
# Philosophy: generous breathing room everywhere. Nothing should feel cramped.

# The scale REPLACES Tailwind's defaults (theme.spacing, not theme.extend).
# It used to extend them, which left gaps non-monotonic: space-6 was 32px while
# Tailwind's untouched space-7 was 28px, so gap-6 was visually larger than
# gap-7. Every step below is larger than the one before it — keep it that way.
space-0.5: 2px    # hairline gaps
space-1:   4px    # micro gaps (icon to label)
space-1.5: 6px
space-2:   8px    # tight internal padding
space-2.5: 10px
space-3:   12px   # default gap between sibling elements
space-4:   16px   # standard padding inside small components
space-5:   24px   # comfortable padding inside cards
space-6:   32px   # gap between cards in a row
space-7:   40px
space-8:   48px   # section separators
space-9:   56px
space-10:  64px   # page-level top/side padding
space-11:  72px
space-12:  80px   # very large breathing room (hero sections)
space-14:  96px
space-16:  112px

## ─── LAYOUT ───────────────────────────────────────────────────────────────────

# Dashboard
dashboard-padding:             64px 72px   # top/bottom left/right — generous inset
dashboard-section-gap:         56px        # vertical space between sections
dashboard-quote-margin-bottom: 48px

# Topbar
topbar-height:    56px      # taller — feels less cramped, more premium
topbar-padding:   0 40px    # horizontal padding

# Workspace sidebar
sidebar-width:    248px     # widened from 220px for the 16px type scale

# Project cards — bigger and more comfortable
project-card-width:            248px   # widened for the 16px type scale
project-card-height:           184px   # AddProjectCard must match exactly
project-card-padding:          16px    # internal padding
project-card-gap:              20px    # gap between cards in the row
project-card-thumbnail-height: 112px  # preview area inside card

# Section labels (PROJECTS, GETTING STARTED etc.)
section-label-margin-bottom:  20px     # gap between label and content below
section-label-letter-spacing: 0.1em    # eased from 0.12em for legibility

# Recently edited right panel
recently-edited-width:        280px    # right column width
recently-edited-item-padding: 14px 0  # vertical padding per item
recently-edited-gap:          4px      # gap between items

# Getting started shortcuts bar
shortcuts-bar-padding:        32px 0   # top/bottom padding of the whole bar
shortcuts-item-padding:       20px 28px # padding inside each shortcut card

# Radius — slightly softer than before
radius-sm:  4px    # tags, badges, chips
radius-md:  10px   # buttons, inputs, cards
radius-lg:  14px   # main cards, panels
radius-xl:  20px   # large containers, modals

## ─── BORDERS & SHADOWS ────────────────────────────────────────────────────────

border-width:        1px   # 0.5px renders sub-pixel and disappears entirely on
                           # non-retina displays — do not go back to hairlines
border-width-accent: 2px   # active/selected state borders

# Real elevation ladder. Every Tailwind shadow utility used to be hard-coded to
# `none`, which is why nothing in the UI read as sitting above the page.
shadow-sm:   0 1px 2px rgba(0,0,0,0.40)     # resting cards, subtle lift
shadow-md:   0 4px 12px rgba(0,0,0,0.45)    # dropdowns, popovers
shadow-lg:   0 12px 32px rgba(0,0,0,0.55)   # modals
shadow-card: 0 0 0 1px var(--color-border), 0 2px 8px rgba(0,0,0,0.35)
shadow-none: none   # use for elements that should stay flat

## ─── COMPONENT AESTHETICS ─────────────────────────────────────────────────────

aesthetic: >
  Cinematic and editorial — Criterion Collection meets Linear.app.
  Dark, warm, considered. NOT cramped. Every section breathes.
  Think of it like a well-designed filmmaker's notebook: plenty of
  dark space, clear hierarchy, nothing competing for attention.
  Amber accent is rare and intentional — only for things that matter.
  The screenplay canvas is the exception: bright paper-white,
  like a physical script sitting on a dark desk.

dashboard-feel: >
  Open and airy. The quote sits large and proud at the top with a
  generous 48px margin below. Project cards are comfortably sized —
  not tiny thumbnails. Section labels are well-separated from content.
  The Recently Edited column has clear item separation with visible
  type hierarchy. Getting Started shortcuts feel like helpful hints,
  not instructions crammed in. Lots of dark space is a feature, not a bug.

topbar-feel:    refined — 56px tall, not ultra-thin. Logo left, avatar right.
cards-feel:     warm dark surface, subtle shadow for depth, rounded corners.
                On hover: border brightens to accent, card lifts 2px.
buttons-feel:   low contrast default. Amber only on primary CTA.
active-states:  left border 2px amber on sidebar/list items.
hover-states:   surface-raised bg + translateY(-2px) on cards, 200ms ease.

## ─── SCREENPLAY CANVAS ────────────────────────────────────────────────────────
# The canvas is the exception to the dark theme

canvas-width:           680px     # standard screenplay page width
canvas-padding:         48px 64px # top/bottom left/right
canvas-line-height:     1.7
canvas-font-size:       12pt      # industry standard
canvas-element-spacing: 12px      # gap between screenplay blocks

## ─── STORYBOARD ───────────────────────────────────────────────────────────────

panel-aspect-ratio:   16/9
panel-grid-columns:   3          # default grid layout
panel-sketch-style:   line-art   # canvas API drawing — simple geometric

## ─── PREFERENCES (edit freely) ────────────────────────────────────────────────
# Toggle these to change behaviour Claude uses when building UI

use-animations:       true    # subtle entrance animations on view switch
use-monochrome-icons: true    # tabler outline icons only, no filled
show-keyboard-hints:  true    # show kbd shortcuts in tooltips
compact-sidebar:      false   # if true, collapse sidebar labels to icons