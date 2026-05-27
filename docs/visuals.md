# MakeFrame — Visual Design System
# Edit the values in each section to change the look of the whole platform.

## ─── COLOURS ──────────────────────────────────────────────────────────────────
# These map directly to CSS custom properties in index.css.
# Change a value here and tell Claude to update index.css to match.

background:       #1a1a1a   # page / app background
surface:          #242424   # cards, panels, sidebar
surface-raised:   #2e2e2e   # elevated elements, dropdowns
border:           #383838   # default borders
border-subtle:    #2a2a2a   # very faint dividers

text-primary:     #f5f2ee   # headings, main content
text-secondary:   #a09e9a   # labels, descriptions
text-tertiary:    #6b6966   # placeholders, hints

accent:           #d48c3a   # amber — primary CTA, active states, highlights
accent-hover:     #e09d4a   # accent on hover
accent-muted:     #d48c3a22 # accent at low opacity (backgrounds)

success:          #7a9e7e   # sage green — completed, linked, confirmed
warning:          #c4903a   # needs review flags
danger:           #a85252   # delete, error, destructive actions

# Screenplay canvas only
canvas-bg:        #faf8f4   # near-white paper feel
canvas-text:      #1a1a1a   # dark ink on paper

## ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
# Font roles — do not mix these up

font-display:     "DM Serif Display"   # wordmark, large headings only
font-ui:          "Outfit"             # all body text, buttons, nav, UI copy
font-mono:        "DM Mono"            # scene numbers, tags, metadata, labels, stats
font-screenplay:  "Courier Prime"      # screenplay canvas ONLY — nowhere else

# Scale (rem)
text-xs:    0.7rem    # tags, badges
text-sm:    0.8rem    # secondary labels
text-base:  0.9rem    # default UI text
text-md:    1rem      # prominent labels
text-lg:    1.2rem    # section headings
text-xl:    1.5rem    # page titles
text-2xl:   2rem      # wordmark

font-weight-normal: 400
font-weight-medium: 500
font-weight-bold:   700   # use sparingly — display font only

## ─── SPACING ──────────────────────────────────────────────────────────────────
# Base unit = 4px. All spacing is multiples of this.
# Philosophy: generous breathing room everywhere. Nothing should feel cramped.

space-1:  4px     # micro gaps (icon to label)
space-2:  8px     # tight internal padding
space-3:  12px    # default gap between sibling elements
space-4:  16px    # standard padding inside small components
space-5:  24px    # comfortable padding inside cards
space-6:  32px    # gap between cards in a row
space-8:  48px    # section separators
space-10: 64px    # page-level top/side padding
space-12: 80px    # very large breathing room (hero sections)

## ─── LAYOUT ───────────────────────────────────────────────────────────────────

# Dashboard
dashboard-padding:             64px 72px   # top/bottom left/right — generous inset
dashboard-section-gap:         56px        # vertical space between sections
dashboard-quote-margin-bottom: 48px

# Topbar
topbar-height:    56px      # taller — feels less cramped, more premium
topbar-padding:   0 40px    # horizontal padding

# Project cards — bigger and more comfortable
project-card-width:            220px   # was too small before
project-card-height:           165px   # taller for breathing room
project-card-padding:          16px    # internal padding
project-card-gap:              20px    # gap between cards in the row
project-card-thumbnail-height: 100px  # preview area inside card

# Section labels (PROJECTS, GETTING STARTED etc.)
section-label-margin-bottom:  20px     # gap between label and content below
section-label-letter-spacing: 0.12em

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

border-width:        0.5px   # default — keep thin and refined
border-width-accent: 1.5px   # active/selected state borders

# Cards get a subtle warm shadow for depth — not flat anymore
shadow-card: 0 0 0 0.5px var(--color-border), 0 2px 12px rgba(0,0,0,0.3)
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