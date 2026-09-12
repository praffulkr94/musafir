# Build Musafir — Personal Travel Memory Web App

The specification Musafir was built against: what the product is, what it deliberately is not,
the fixed technical stack, the Phase 1 screens and the boundaries of scope.

The guiding constraints throughout: keep the architecture simple, and do not over-engineer the
product.

---

# 1. Product

The application is called **Musafir**.

Musafir is a personal travel-memory web application that allows a user to create a visual archive of places they have already visited.

The main idea is:

> **See the world you have experienced and revisit the memories connected to those places.**

As the user adds memories, more countries on their personal world map become highlighted.

The emotional product idea is:

> **The more you travel, the more your world fills in.**

This is NOT:

- a travel planner
- a booking application
- an itinerary builder
- a future-trip tracker
- a social network
- an analytics dashboard

Only past travel memories are stored.

---

# 2. Phase 1 Screens

Build exactly these primary experiences:

1. Home — with data
2. Home — empty state
3. Create Memory
4. My Places
5. Edit Memory
6. Place Details

Primary navigation contains only:

- Home
- My Places
- Create Memory

Do NOT add:

- Journey / Timeline
- About
- Settings
- Login
- Authentication
- Profile/avatar


---

# 3. Design Source of Truth

The visual system is an Airbnb-derived `design.md` (https://getdesign.md/airbnb/design-md),
supplied alongside screen designs and reference screenshots.

`design.md` is the source of truth for visual implementation, alongside the reference screen
designs. The application is not to be independently redesigned.

## Font override

The one deliberate override to `design.md` is:

> **Use Poppins throughout the entire Musafir application.**

Do NOT use Airbnb Cereal, Circular, Inter, or another primary font.

---

# 4. Required Technical Stack

Keep the project intentionally lightweight.

## Core

- React
- TypeScript
- Vite
- React Router

## State and persistence

- Zustand
- Zustand persist middleware
- browser localStorage

There is NO backend and NO database in Phase 1.

## Maps

- MapLibre GL JS
- OpenFreeMap

## Geocoding / place search

- OpenStreetMap Nominatim

Do NOT use Google Maps or Google Places.

Do NOT implement request-on-every-keystroke autocomplete against Nominatim.

Use explicit search:

1. enter location;
2. submit Search;
3. display results;
4. select a result.

Respect required attribution and reasonable usage constraints.

## Geographic country data

Use an appropriate lightweight static world-country GeoJSON/TopoJSON dataset containing stable country identifiers such as ISO country codes.

Use this together with MapLibre to highlight visited countries.

Do not introduce another paid geographic API.

## Destination imagery

Use:

- Pexels API

When appropriate, search using combinations such as:

`Tokyo Japan`

Store the selected image URL and required attribution/source metadata with the memory so the app does not refetch a random photograph every render.

Images should be used selectively in:

- My Places
- country/place previews
- Place Details
- other approved designs where imagery appears

Do NOT turn Musafir into a photo gallery.

## Date selection

Use:

- React DayPicker
- date-fns

Use these for:

- start/end date selection
- range validation
- formatting
- parsing/manipulation where necessary

Do not manually reinvent a date-picker.

Only past dates should be valid for travel memories.

The end date must not precede the start date.

## Toast notifications

Use:

- Sonner

Use concise toasts for meaningful operations such as:

- Memory created
- Memory updated
- Memory deleted
- search/API failure where a toast is appropriate
- other important user actions

Do NOT toast every trivial interaction.

## Tooltips

Use:

- Radix UI Tooltip

Use accessible tooltips where they genuinely improve comprehension, particularly for:

- world-map country hover/context
- icon-only controls
- map controls where needed

Do not use tooltips for information that should simply be visible.

## Icons

Use:

- Lucide React

Keep icon treatment consistent across the application.

Avoid mixing multiple icon libraries.

---

# 5. Data Model

Keep persisted state small.

A memory can approximately contain:

```ts
type Memory = {
  id: string;

  placeName: string;
  displayName?: string;

  country: string;
  countryCode: string;

  latitude: number;
  longitude: number;

  startDate: string;
  endDate: string;

  imageUrl?: string;
  imagePhotographer?: string;
  imageSourceUrl?: string;

  createdAt: string;
};
```

Adjust this minimally if the actual APIs require slightly different data.

Do NOT persist derived information such as:

* total number of places
* total countries
* total years
* highlighted countries
* country counts

Derive those values from memories.

Example derived operations:

```ts
getTotalPlaces(memories)
getUniqueCountries(memories)
getYearsVisited(memories)
groupMemoriesByCountry(memories)
getMemoriesForCountry(countryCode)
```

Avoid duplicated state.

---

# 6. Home — With Data

Home is now the primary visual experience of Musafir.

Its main purpose is:

> **Show the user the world they have experienced.**

The hero is a large interactive world map.

There is NO year timeline on Home.

## Summary

Show compact derived information such as:

* 27 Places
* 8 Countries
* 6 Years

Use actual stored data.

Do not store these statistics independently.

## World map

Default state:

* display the entire world;
* visited countries are highlighted;
* countries not visited remain visually muted.

Use MapLibre + static country GeoJSON.

Do NOT use D3 for this unless there is a genuine requirement MapLibre cannot reasonably handle.

Do NOT use:

* heat maps
* travel arcs
* animated airplanes
* 3D globe
* route animations
* visit-frequency color gradients

The visual distinction should initially be simple:

> visited / not visited

## Country hover

Hovering a visited country should:

* subtly emphasize it;
* display a lightweight tooltip.

Example:

**Japan**
5 places

Do NOT zoom on hover.

## Country click

Clicking a visited country should:

1. select that country;
2. use the country's geographic bounds to smoothly zoom/focus the MapLibre camera;
3. reveal markers for the user's saved places within that country;
4. expose contextual country/place information according to the supplied design.

Provide:

**Back to world**

to restore the global view.

## Place markers

Use MapLibre markers or preferably an appropriate GeoJSON point layer.

The coordinates come from the memory data obtained through Nominatim.

Example:

Japan selected:

* Tokyo
* Osaka
* Kyoto

Clicking a marker should reveal a compact place preview.

Example:

**Tokyo, Japan**
12 Mar – 18 Mar 2026

Include imagery if shown in the design.

Provide:

**View Memory**

which opens Place Details.

---

# 7. Home — Empty State

When there are no memories:

* do not show a meaningless populated-map interface;
* display the approved empty-state design;
* clearly communicate what the application does;
* provide a prominent Create Memory CTA.

Example intent:

> Add the places you've visited and watch your world take shape.

The global Create Memory action should also remain available.

---

# 8. Create Memory

Purpose:

> Add a place the user has previously visited.

Basic flow:

1. Navigate to Create Memory.
2. Enter a location.
3. Submit Search.
4. Fetch results using Nominatim.
5. Show matching locations.
6. Select one result.
7. Extract:

   * place
   * country
   * country code
   * coordinates
8. Show the selected location on MapLibre/OpenFreeMap.
9. Select start date.
10. Select end date.
11. Optionally obtain destination imagery from Pexels.
12. Save the memory.
13. Persist through Zustand/localStorage.
14. Show a success toast.
15. Navigate according to the intended UX/design.

Do not make the user manually enter latitude, longitude, or country.

## Date behavior

Use React DayPicker.

Requirements:

* past dates only;
* start/end range;
* end cannot precede start;
* accessible interaction;
* clear formatted output using date-fns.

## Search states

Provide simple states for:

* idle
* loading
* results
* no results
* failure

Do not create complicated search infrastructure.

---

# 9. My Places

Purpose:

> Let the user view and manage all saved memories.

Follow the approved design.

Each memory should communicate:

* destination image where available
* place
* country
* visit dates

Actions:

* View
* Edit
* Delete

Do NOT implement Phase 2 functionality such as:

* search
* filters
* complex sorting
* categories
* tags

## Delete flow

Deleting should require a lightweight confirmation.

After successful deletion:

* update Zustand/localStorage;
* automatically update Home statistics;
* automatically update visited countries;
* close any stale selected state;
* show a success toast.

---

# 10. Edit Memory

Edit Memory should reuse the same overall UX patterns as Create Memory.

Populate:

* current place
* current dates
* current map position
* current image if relevant

Allow changing:

* place
* start date
* end date

If the place changes:

* update coordinates;
* update country/country code;
* update map;
* update destination imagery if appropriate.

After saving:

* persist changes;
* update all derived Home state automatically;
* show a success toast.

Avoid duplicating Create/Edit logic unnecessarily.

---

# 11. Place Details

Purpose:

> Allow the user to revisit one individual travel memory.

Follow the supplied design.

Show the agreed information:

* destination
* country/location
* start/end dates
* coordinates where shown
* one strong destination image where the design calls for it
* MapLibre map focused on the location
* location marker
* Edit
* Delete

Do NOT add:

* photo galleries
* notes
* ratings
* reviews
* weather
* recommendations
* nearby attractions
* journal functionality

The map and destination image should provide the main visual weight.

---

# 12. CRUD Feedback and UX

Operations should give clear but restrained user feedback.

Use Sonner toasts for events such as:

**Create**

> Memory created

**Edit**

> Memory updated

**Delete**

> Memory deleted

**Error**

> Couldn't search for that place. Try again.

Keep messages short.

Use inline form validation for field-level problems rather than relying solely on toasts.

Examples:

* End date must be after start date.
* Select a place before saving.

---

# 13. API Failure Handling

The application uses third-party free services, so failure must not break the interface.

Handle at least:

### Nominatim

* loading
* no results
* network/API failure

### Pexels

If image retrieval fails:

* still allow the memory to be created;
* show a graceful image placeholder;
* do not treat image failure as a failed memory creation.

### Map

If map initialization fails:

* continue showing textual location information;
* provide a restrained fallback state.

The core memory data is more important than optional imagery/map rendering.

---

# 14. Accessibility

Implement sensible baseline accessibility.

Include:

* semantic HTML
* proper form labels
* keyboard-accessible controls
* visible focus indicators
* accessible tooltips
* accessible dialogs
* sufficient color contrast
* adequate touch targets
* keyboard-operable map-related controls where practical
* destructive controls properly labelled

Do not make important functionality dependent exclusively on hover.

---

# 15. Responsive Behavior

Desktop design/reference is the primary source.

Implement sensible adaptation for tablet and mobile based on `design.md`.

General behavior:

* two-column forms may stack;
* map remains prominent;
* My Places becomes stacked cards where needed;
* country information can move below the map;
* navigation should adapt appropriately;
* controls remain usable on touch devices.

Do not invent an entirely different mobile product.

---

# 16. Architecture Guidelines

This is a portfolio application.

Prefer simplicity.

Good candidates for reusable boundaries include:

* App shell/header
* Memory form shared by Create/Edit
* Date range picker
* Map component
* World map
* Country details/preview
* Place preview
* Memory card/list item
* Confirmation dialog
* derived-data helpers

But do not create abstractions before they are useful.

Avoid:

* giant components
* excessive custom hooks
* needless context providers
* design-system architecture beyond what the project needs
* repository/service/adapter layers for localStorage
* unnecessary dependency injection
* premature generalization

---

# 17. Scope Boundaries

Do NOT add these in Phase 1:

* authentication
* backend
* database
* cloud sync
* multiple users
* future trips
* trip planning
* bookings
* itinerary creation
* Journey/year timeline
* social features
* sharing
* About page
* Settings page
* profile/avatar
* My Places search/filter
* ratings
* reviews
* journal entries
* expenses
* weather
* AI recommendations
* route optimization
* image upload/gallery
* complex analytics

Do not implement speculative features simply because they seem useful.

---

# 18. Suggested Implementation Order

Work incrementally.

1. Inspect `design.md`, supplied designs and repository.
2. Initialize/verify React + TypeScript + Vite structure.
3. Configure Poppins.
4. Build shared app shell/navigation.
5. Define Memory types.
6. Build Zustand persisted store.
7. Create derived-data helpers.
8. Build Home empty state.
9. Integrate MapLibre/OpenFreeMap.
10. Add world-country GeoJSON.
11. Implement visited-country highlighting.
12. Implement country hover/click/zoom behavior.
13. Implement country place markers.
14. Build Create Memory.
15. Integrate Nominatim.
16. Implement React DayPicker/date-fns range selection.
17. Integrate Pexels imagery.
18. Build My Places.
19. Build Place Details.
20. Build Edit Memory.
21. Implement delete confirmation.
22. Integrate Sonner toasts.
23. Add Radix tooltips where needed.
24. Validate empty/error/loading states.
25. Validate responsive behavior.
26. Validate accessibility.
27. Compare every screen against the supplied design references.
28. Remove temporary development data.

---

# 19. Definition of Done

Phase 1 is complete when a user can:

1. Open Musafir with no data.
2. See the correct Home empty state.
3. Create their first memory.
4. Search for a place.
5. Select a valid location.
6. Select a past date range.
7. See the selected location on the map.
8. Save the memory.
9. Receive clear success feedback.
10. Reload the browser without losing it.
11. See the corresponding country highlighted on Home.
12. Add memories from additional countries.
13. See the world map gradually fill with visited countries.
14. Hover a visited country and see useful context.
15. Click a visited country and zoom into it.
16. See markers for saved places within that country.
17. Select a place and open its memory.
18. View its Place Details.
19. View all memories in My Places.
20. Edit a memory.
21. Delete a memory with confirmation.
22. See all derived counts/map states update correctly after CRUD operations.
23. See destination imagery where available, with graceful fallbacks where unavailable.
24. Use the application comfortably across reasonable desktop/tablet/mobile sizes.
25. See an implementation that closely matches `design.md` and the approved screen designs.

---

# Final Priority

When making tradeoffs, prioritize in this order:

1. Correct product behavior
2. Fidelity to supplied designs and `design.md`
3. Simple user experience
4. Reliability
5. Accessibility
6. Maintainable/simple code
7. Optional polish

This is a portfolio application, but do not make the architecture sophisticated merely to demonstrate engineering.

The product itself should provide the sophistication.

Keep Musafir focused on one idea:

> **A visual record of the world the user has experienced.**
