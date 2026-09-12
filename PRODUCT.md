# Product

<!-- impeccable:product-schema 1 -->

<!-- Every fact below is taken from docs/PLAN.md (the owner's written brief) and the
     owner's Claude Design reference. No interview was held: the brief instructs the
     agent to work autonomously and not to stop for routine decisions. -->

## Platform

web

## Users

One person, using their own browser, looking back at places they have already travelled to.
The job: keep a small, visual, personal archive of past trips and see, at a glance, how much
of the world they have experienced. No collaborators, no audience, no accounts.

## Product Purpose

Musafir is a personal travel-memory web app. The user adds memories of places they have visited
(place, country, dates, one destination photo). As memories accumulate, more countries on their
personal world map become highlighted. Success is emotional and simple: "the more you travel, the
more your world fills in." The user can revisit any single memory (Place Details), manage them all
(My Places), and edit or delete them.

## Positioning

A visual record of the world the user has experienced, and nothing else. Not a trip planner,
booking tool, itinerary builder, future-trip tracker, social network, journal, or analytics
dashboard. Only past travel is stored; the world map is the product's hero.

## Operating Context

Desktop browser first; tablet and mobile adapt sensibly. All data lives in the browser's
localStorage via a persisted Zustand store. Third-party free services are used at the edges:
OpenStreetMap Nominatim (explicit, submit-to-search geocoding; no per-keystroke autocomplete),
OpenFreeMap tiles rendered by MapLibre GL JS, Wikipedia/Commons (or Pexels) for one destination photo per memory, and a
static world-country GeoJSON for visited-country highlighting. Every one of these may fail; the
memory data must survive and the UI must degrade gracefully.

## Capabilities and Constraints

Phase 1 screens, exactly: Home (with data), Home (empty state), Create Memory, My Places,
Edit Memory, Place Details. Primary navigation contains only Home, My Places, Create Memory.

A memory holds: placeName, displayName, country, countryCode (ISO 3166-1 alpha-2), latitude,
longitude, startDate, endDate, optional imageUrl + photographer + source URL, createdAt. Counts
(places, countries, years), highlighted countries and groupings are always derived, never stored.

Dates: past only; end date never precedes start date; React DayPicker + date-fns.
Feedback: Sonner toasts for create/update/delete and search failure; inline validation for
field errors. Delete requires a lightweight confirmation. Tooltips (Radix) for map country hover
and icon-only controls. Icons: Lucide only.

Explicitly out of scope for Phase 1: authentication, backend, database, sync, multiple users,
future trips, planning, bookings, itineraries, Journey/timeline, social/sharing, About, Settings,
profile/avatar, My Places search/filter/sort/tags, ratings, reviews, notes/journal, expenses,
weather, recommendations, nearby attractions, route optimisation, image upload/galleries,
analytics, heat maps, travel arcs, animated planes, 3D globe, visit-frequency gradients.

Stack (fixed by the brief): React, TypeScript, Vite, React Router, Zustand + persist,
MapLibre GL JS, OpenFreeMap, Nominatim, Wikimedia Commons, Pexels, React DayPicker, date-fns, Sonner,
Radix UI Tooltip, Lucide React.

## Brand Commitments

Name: Musafir (wordmark set in the primary coral). Visual system: the Airbnb-derived
design.md at docs/design.md is the source of truth, with one deliberate override that binds
everywhere: the typeface is Poppins (never Cereal, Circular or Inter). The owner's Claude
Design reference (Musafir.dc.html) fixes the screen compositions; the app should not be
independently redesigned.

## Evidence on Hand

- docs/PLAN.md: the full brief.
- docs/design.md: Airbnb-inspired design system from getdesign.md.
- Claude Design project "Musafir interactive prototype review" (Musafir.dc.html, musafir-map.js):
  screen-by-screen composition reference.
- No real user data exists; the app ships empty. No testimonials, customers or metrics exist and
  none may be invented.

## Product Principles

1. The map is the product: the world filling in is the emotional payoff of every action.
2. Only the past, only the user's own places; resist every feature that points forward or outward.
3. Derive, don't duplicate: one source of truth (memories) and everything else computed.
4. Fragile edges, solid core: third-party failures never lose data or block saving.
5. Simple over clever: no abstraction, layer or dependency before it earns its place.

## Accessibility & Inclusion

Baseline: semantic HTML, labelled form fields, keyboard-operable controls (including map
country selection and markers where practical), visible focus indicators, accessible dialogs and
tooltips, 4.5:1 text contrast, comfortable touch targets, and nothing important gated behind hover.
