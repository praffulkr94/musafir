---
name: Musafir
description: A white world that fills in with Rausch as memories are added; everything else is quiet Airbnb-style chrome set in Poppins.
colors:
  rausch: "#ff385c"
  rausch-active: "#e00b41"
  rausch-disabled: "#ffd1da"
  rausch-tint: "#ffe3e9"
  error: "#c13515"
  error-hover: "#b32505"
  ink: "#222222"
  body: "#3f3f3f"
  muted: "#6a6a6a"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  surface-strong: "#f2f2f2"
  hairline: "#dddddd"
  hairline-soft: "#ebebeb"
  map-water: "#fbfbfb"
  scrim: "rgba(0, 0, 0, 0.5)"
typography:
  display:
    fontFamily: "Poppins, -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.43
  headline:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title-lg:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.29
  caption:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label-xs:
    fontFamily: "Poppins, -apple-system, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  xs: "4px"
  sm: "8px"
  thumb: "12px"
  md: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.rausch}"
    textColor: "{colors.canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.rausch-active}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 24px"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 24px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    height: "40px"
    padding: "0 14px"
  icon-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "40px"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: "56px"
    padding: "0 16px"
  chip-visited:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "36px"
    padding: "0 6px 0 14px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 16px"
  tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card-preview:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "12px"
    width: "280px"
  map-frame:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
---

# Design System: Musafir

## Overview

**Creative North Star: "The World Filling In"**

Musafir is a white world that colours itself in. The hero is a flat grey silhouette map on a white canvas; every visited country turns Rausch, and nothing else on the screen competes with that. The chrome around it is quiet Airbnb-derived furniture (`docs/design.md`) with one binding override: the typeface is Poppins everywhere, at modest weights, so photography and the map carry the heft. Depth is almost absent: a single soft float shadow for things that hover over the map, one dialog shadow, hairlines for everything else. No gradients, no dark mode, no decorative ornament.

**Key Characteristics:**
- One accent (Rausch) meaning exactly one thing: "you were here".
- White canvas, `#ebebeb` land, near-white water; the map is the only saturated field.
- Poppins 400/500/600/700 only; display tops out at 28px.
- Hairline borders (`#ebebeb` / `#dddddd`) do the work shadows would do elsewhere.
- 8px spacing grid, 8/12/14px radius family, pills for chips and floating controls.

## Colors

Restrained: white and ink, one brand voltage, and a grey silhouette world.

### Primary
- **Rausch** (`{colors.rausch}`): visited countries, map markers, the primary button, the wordmark, the legend's visited dot, `accent-color`. Everything Rausch on a screen should be traceable to "a memory exists".
- **Rausch Active** (`{colors.rausch-active}`): primary-button hover/active and the map's country hover fill.
- **Rausch Disabled** (`{colors.rausch-disabled}`): disabled primary buttons only.
- **Rausch Tint** (`{colors.rausch-tint}`): focused-country fill in country mode (at 0.85 opacity, with a 1.5px Rausch outline), text selection, and the count pill inside visited chips.

### Neutral
- **Ink** (`{colors.ink}`): headings, body text default, secondary-button outline, focus rings, tooltip and toast backgrounds, DayPicker selection, map marker labels.
- **Body** (`{colors.body}`): long-form paragraph text and the photo-credit pill.
- **Muted** (`{colors.muted}`): subtitles, dates, placeholders, inactive nav links, legend, field sub-labels (5.7:1 on white).
- **Canvas** (`{colors.canvas}`): page, header, cards, inputs, map background; also text-on-Rausch and text-on-ink.
- **Surface Soft** (`{colors.surface-soft}`): hover rows, selected list items, the selected-place chip, map loading/fallback fills, soft icon buttons.
- **Surface Strong** (`{colors.surface-strong}`): second-step hover (text buttons, soft icon buttons), skeletons, DayPicker range middle.
- **Hairline** (`{colors.hairline}`): input, chip and outline-button borders; dashed empty-state border.
- **Hairline Soft** (`{colors.hairline-soft}`): header rule, dividers, map frames, search-result lists, and unvisited land on the map.
- **Map Water** (`{colors.map-water}`): applied to the Positron `water` layer so oceans read as barely-off-white.
- **Error** (`{colors.error}`, hover `{colors.error-hover}`): invalid input borders, field errors, delete actions.
- **Scrim** (`{colors.scrim}`): dialog backdrop.

### Named Rules
**The One Voltage Rule.** Rausch is the only chromatic colour in the chrome. It marks presence (visited, marker, primary action, wordmark) and never decoration; there is no secondary or tertiary accent.
**The Silhouette Rule.** In world mode the map is a silhouette: white background, `#fbfbfb` water, `#ebebeb` land with 0.6px white borders, base-map labels hidden. Labels and the Positron base show through only once a country is focused (focused fill 0.85, neighbours 0.7).

## Typography

**Display Font:** Poppins (with -apple-system, system-ui, Segoe UI, Roboto, Helvetica Neue, sans-serif)
**Body Font:** Poppins (same stack)

**Character:** Geometric and friendly at restrained weights. Only 400/500/600/700 are loaded (Google Fonts); 700 appears solely on the 28px page title.

### Hierarchy
- **Display** (700, 28px, 1.43): page titles ("My World", "My Places", place names on details).
- **Headline** (600, 22px, 1.3, -0.01em): the wordmark and the Home stat values (tabular numerals).
- **Title Large** (600, 20px, 1.4): country-panel and dialog titles.
- **Title** (600, 16px, 1.4): row titles, preview-card titles, section headings in the form.
- **Body** (400, 16px, 1.5): default text and input text.
- **Body Small** (400, 14px, 1.43): subtitles, dates, search sub-lines, messages.
- **Label** (500, 14px, 1.29): field labels, nav links (16px variant), chips, back-link, text buttons.
- **Caption** (400, 13px, 1.4): tooltips, map legend, marker labels (rendered by MapLibre in Noto Sans, the tile font, not Poppins).
- **Label XS** (500, 12px, 1.2): date-chip labels, photo credit, DayPicker weekdays, chip count pill.

### Named Rules
**The Modest Weight Rule.** Headings are balanced (`text-wrap: balance`), paragraphs pretty, and no text is uppercase, letter-spaced, or heavier than 700. Emphasis comes from size and Ink vs Muted, not from tracking or caps.

## Layout

Single centred container, max 1280px with 24px gutters (16px below 744px). Sticky 80px header (64px on mobile) with a soft hairline underneath: wordmark left, pill nav centred, primary Create button right (icon-only 44px circle on mobile). Pages open with 40px top padding and close with 64px (24/48 on mobile); page headers align a display title + muted subtitle against right-hand actions or stats.

Spacing sits on an 8px grid with 4 and 12 as half-steps: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Grids: Home is one column until a country is focused, then `1fr 340px` (300px below 1128px); the memory form is `1fr 1.15fr` with a 64px gap (32px below 1128px); details are two equal columns. All grids stack below 744px, with the map moved above the form on mobile. Breakpoints: 744px and 1128px (written as `max-width: 743px` / `1127px`).

Map frames are the dominant element: Home `clamp(420px, 62vh, 660px)`, form `clamp(360px, 56vh, 560px)`, details `clamp(320px, 52vh, 520px)`; on mobile 240-460px. Overlays inside a frame sit 16px from its edges.

## Elevation & Depth

Flat by default. Depth is drawn with hairlines and Surface Soft tints, not shadows. Two shadow tokens exist and only two: `--shadow-float` for anything that sits over the map (Back-to-world pill, preview card, map hint, MapLibre controls, photo credit, tooltip) and `--shadow-dialog` for the confirm dialog. The active nav link uses an inset 2px Ink line as an underline, not as elevation.

### Shadow Vocabulary
- **Float** (`box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0`): overlays on the map and small floating pills.
- **Dialog** (`box-shadow: 0 12px 32px rgba(0,0,0,0.16)`): the modal, over a 50% black scrim.

### Named Rules
**The Over-the-Map Rule.** A shadow means "this floats above the map". Cards, rows, panels and inputs in the page flow get a hairline or a soft tint, never a shadow.

## Shapes

Softly rounded, never pill-shaped except where the object is a control: 8px for buttons and inputs, 12px for thumbnails, rows and photo panels, 14px for map frames, cards, dialogs, search-result lists and the date picker, 4px for focus rings and the attribution corner. Pills (`9999px`) are reserved for chips, nav links, icon buttons, the Back-to-world control, the legend, the map hint and the photo credit. Map markers are 14/18px Rausch circles with a 2.5px white stroke and an 18%-opacity Rausch halo. Borders are 1px hairlines; the empty state on My Places uses a 1px dashed hairline.

## Components

### Buttons
- **Shape:** softly rounded (8px), 48px tall, 16px/500, 24px side padding, 8px icon gap; `btn-sm` is 40px / 14px; `btn-pill` for floating controls.
- **Primary:** Rausch on white text; hover and active go Rausch Active; disabled goes Rausch Disabled with `not-allowed`.
- **Secondary:** white with a 1px Ink outline; hover fills Surface Soft. **Outline:** same with a Hairline border, for neutral actions. **Danger outline:** Hairline border, Error text; hover border turns Error. **Danger:** Error fill, white text.
- **Text:** 40px, 14px, underlined (1px, 3px offset), hover Surface Strong; `.is-danger` colours it Error.
- **Icon buttons:** 40px Hairline circle inverting to Ink on hover; the 32px `soft` variant is Surface Soft with no border.
- **Focus:** global 2px Ink outline, 2px offset, 4px radius. Transitions 150ms `cubic-bezier(0.16, 1, 0.3, 1)` on colour only.

### Chips
- **Visited chip:** 36px white pill, Hairline border, 14px/500 label with a 24px Rausch Tint count pill (12px/600 tabular) on the right; hover fills Surface Soft and darkens the border to Ink.
- **Selected-place chip (form):** 12px-radius Surface Soft block with a 12px Rausch dot ringed in white.

### Cards / Containers
- **Map frame:** 14px radius, 1px Hairline Soft border, white fill, `overflow: hidden`; 70% opacity when empty.
- **Preview card (marker click):** 280px, 14px radius, 12px padding, white, Float shadow, 150px photo at 10px radius, Title + Body Small + full-width primary button; enters with a 240ms 6px rise.
- **Country panel:** 340px column, 180px photo at 12px radius, list rows 10px/8px padding with Hairline Soft dividers and Surface Soft hover/selected.
- **Place row (My Places):** grid `132px 1fr auto`, 96px thumbnail at 12px radius, 24px gap, Hairline Soft divider, Surface Soft hover; the title link covers the whole row.
- **Confirm dialog:** `min(440px, 100vw - 48px)`, 14px radius, 24px padding, Dialog shadow, right-aligned actions (stacked full-width on mobile), 240ms rise-and-scale entrance.

### Inputs / Fields
- **Style:** 56px tall, 8px radius, 1px Hairline border, white, 16px text, Muted placeholder; label above at 14px/500 with an 8px gap; search input carries a 16px Muted icon with 44px left padding.
- **Focus:** border to Ink plus a 1px inset Ink ring; no glow, no colour change.
- **Error:** border to Error; 14px Error message with icon below.
- **Date range:** two 56px Hairline "date chips" (12px Muted label, 15px value turning Ink when set) above a DayPicker themed Ink-selection / Surface Soft range / Rausch today, inside a 14px Hairline Soft frame.

### Navigation
- 44px pill links, 16px/500 Muted; hover Surface Soft + Ink; active is Ink 600 with an inset 2px Ink underline and square corners. Mobile: 15px links, 12px padding, header 64px, Create collapses to a 44px Rausch circle with a screen-reader label.

### World Map (signature)
OpenFreeMap Positron tiles rendered by MapLibre with the paint rules in the Silhouette Rule: visited `#ff385c`, hover `#e00b41`, unvisited `#ebebeb`, focused `#ffe3e9` with a 1.5px `#ff385c` outline, other borders 0.6px white. Markers: 7px (9px selected) Rausch circle, 2.5px white stroke, 14px (18px) 18% halo; labels 13px Ink with a 1.6px white halo. Camera moves are the one authored motion: `fitBounds` at 900ms into a country (padding 56, maxZoom 6.5) and back to the world (padding 8, maxZoom 3). Fill colour transitions 150ms. Overlay furniture: Back-to-world pill top-left, legend pill bottom-left (top-left on mobile), zoom controls top-right at 8px radius with Float shadow, attribution collapsed to (i) under 744px. Place maps use a Surface Soft canvas, an 18px DOM marker, and 900ms `easeTo`.

### Tooltips and Toasts
Tooltips are Ink, 13px white text, 8px radius, 8/12px padding, Float shadow, 240px max, 150ms fade-up. Toasts (Sonner, bottom-centre, 24px offset) are Ink with white 500 titles, 72% white descriptions, Rausch icon, 8px radius, 3.2s.

## Do's and Don'ts

### Do:
- **Do** reserve Rausch for presence: visited land, markers, the primary action, the wordmark. Ask "does this colour mean a memory exists or the one main action?" before using it.
- **Do** put the map frame at 14px radius with a 1px `#ebebeb` border and let it fill the container width.
- **Do** use `--shadow-float` only for things layered over the map; use hairlines and `#f7f7f7` for everything in the page flow.
- **Do** keep Poppins at 400-700 and display at 28px; balance headings, tabular numerals for counts.
- **Do** respect `prefers-reduced-motion` (all transitions collapse to 0.01ms) and keep colour transitions at 150ms `--ease-out`, entrances at 240ms.

### Don't:
- **Don't** add gradients, a dark mode, a second accent, or tinted backgrounds beyond `#f7f7f7` / `#f2f2f2`.
- **Don't** show base-map labels or the Positron detail in world mode; the flat world is a silhouette until a country is focused.
- **Don't** use emoji or glyph icons; icons are Lucide, stroke 2 (1.75 for large empty-state marks), 16-24px.
- **Don't** use uppercase, letter-spaced labels or heavier-than-700 type for emphasis.
