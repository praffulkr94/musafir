import { useId, useRef, useState, type FormEvent } from 'react'
import { AlertCircle, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Memory, MemoryInput, Photo, Place } from '../types'
import { searchPlaces } from '../lib/nominatim'
import { resolveDestinationPhoto } from '../lib/imagery'
import { DateRangePicker } from './DateRangePicker'
import { PlaceMap } from './PlaceMap'
import { WorldMap } from './WorldMap'
import './MemoryForm.css'

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; results: Place[] }
  | { status: 'empty'; query: string }
  | { status: 'failed' }

type Props = {
  /** Existing memory when editing. */
  initial?: Memory
  submitLabel: string
  onSubmit: (input: MemoryInput) => void
  onCancel: () => void
}

const toPlace = (m: Memory): Place => ({
  placeName: m.placeName,
  displayName: m.displayName ?? `${m.placeName}, ${m.country}`,
  country: m.country,
  countryCode: m.countryCode,
  latitude: m.latitude,
  longitude: m.longitude,
})

const toPhoto = (m: Memory): Photo | null =>
  m.imageUrl
    ? {
        imageUrl: m.imageUrl,
        imagePhotographer: m.imagePhotographer ?? '',
        imageSourceUrl: m.imageSourceUrl ?? '',
        imageSource: m.imageSource ?? 'pexels',
        imageLicense: m.imageLicense,
      }
    : null

/** Shared by Create and Edit: search a place, pick dates, save. */
export function MemoryForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [place, setPlace] = useState<Place | null>(initial ? toPlace(initial) : null)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<SearchState>({ status: 'idle' })
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [errors, setErrors] = useState<{ place?: string; dates?: string }>({})
  const [saving, setSaving] = useState(false)

  const photoRef = useRef<Promise<Photo | null>>(Promise.resolve(initial ? toPhoto(initial) : null))
  const abortRef = useRef<AbortController | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const ids = { search: useId(), placeError: useId(), status: useId() }

  const runSearch = async () => {
    const q = query.trim()
    if (!q) {
      searchInputRef.current?.focus()
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setSearch({ status: 'loading' })
    try {
      const results = await searchPlaces(q, controller.signal)
      if (controller.signal.aborted) return
      setSearch(results.length ? { status: 'results', results } : { status: 'empty', query: q })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setSearch({ status: 'failed' })
      toast.error("Couldn't search for that place. Try again.")
    }
  }

  const choosePlace = (next: Place) => {
    setPlace(next)
    setSearch({ status: 'idle' })
    setQuery('')
    setErrors((e) => ({ ...e, place: undefined }))
    const samePlace = initial && initial.latitude === next.latitude && initial.longitude === next.longitude
    photoRef.current = samePlace
      ? Promise.resolve(initial ? toPhoto(initial) : null)
      : resolveDestinationPhoto(next)
  }

  const clearPlace = () => {
    setPlace(null)
    setSearch({ status: 'idle' })
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  const validate = () => {
    const next: typeof errors = {}
    if (!place) next.place = 'Select a place before saving.'
    if (!startDate) next.dates = 'Pick the dates of your visit.'
    else if (endDate && endDate < startDate) next.dates = 'End date must be after start date.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !place) return
    setSaving(true)
    // Imagery is optional: wait briefly, never block the save on it. A lookup
    // that misses the deadline is still cached, so the photo appears anyway.
    const photo = await Promise.race([photoRef.current, new Promise<null>((r) => setTimeout(() => r(null), 2000))])
    onSubmit({
      placeName: place.placeName,
      displayName: place.displayName,
      country: place.country,
      countryCode: place.countryCode,
      latitude: place.latitude,
      longitude: place.longitude,
      startDate,
      endDate: endDate || startDate,
      imageUrl: photo?.imageUrl,
      imagePhotographer: photo?.imagePhotographer,
      imageSourceUrl: photo?.imageSourceUrl,
      imageSource: photo?.imageSource,
      imageLicense: photo?.imageLicense,
    })
  }

  return (
    <div className="memory-form-layout">
      <form className="memory-form" onSubmit={handleSubmit} noValidate>
        <section className="memory-form-section" aria-labelledby={`${ids.search}-title`}>
          <h2 id={`${ids.search}-title`} className="display-sm">
            {place ? 'Place' : 'Search for a place'}
          </h2>

          {place ? (
            <div className="selected-place">
              <span className="selected-place-dot" aria-hidden="true" />
              <div className="selected-place-text">
                <div className="title-md">{place.placeName}</div>
                <div className="body-sm text-muted">{secondaryLabel(place)}</div>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={clearPlace}>
                Change
              </button>
            </div>
          ) : (
            <>
              <label htmlFor={ids.search} className="visually-hidden">
                Search for a city, place, or landmark
              </label>
              <div className="search-row">
                <div className="search-input-wrap">
                  <Search size={18} strokeWidth={2} aria-hidden="true" className="search-input-icon" />
                  <input
                    ref={searchInputRef}
                    id={ids.search}
                    className="input search-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void runSearch()
                      }
                    }}
                    placeholder="Search for a city, place, or landmark"
                    autoComplete="off"
                    aria-invalid={errors.place ? 'true' : undefined}
                    aria-describedby={errors.place ? ids.placeError : ids.status}
                  />
                </div>
                <button type="button" className="btn btn-secondary search-button" onClick={() => void runSearch()} disabled={search.status === 'loading'}>
                  {search.status === 'loading' ? 'Searching…' : 'Search'}
                </button>
              </div>
              {errors.place && (
                <p id={ids.placeError} className="field-error" role="alert">
                  <AlertCircle size={16} strokeWidth={2} aria-hidden="true" />
                  {errors.place}
                </p>
              )}
              <div id={ids.status} className="search-status" aria-live="polite">
                <SearchResults state={search} onPick={choosePlace} />
              </div>
            </>
          )}
        </section>

        <section className="memory-form-section" aria-labelledby="dates-title">
          <h2 id="dates-title" className="display-sm">
            Visit dates
          </h2>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: s, endDate: e }) => {
              setStartDate(s)
              setEndDate(e)
              if (s) setErrors((prev) => ({ ...prev, dates: undefined }))
            }}
            error={errors.dates}
          />
        </section>

        <div className="memory-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>

      <div className="memory-form-map" aria-live="polite">
        {place ? (
          <PlaceMap latitude={place.latitude} longitude={place.longitude} zoom={8} label={`${place.placeName}, ${place.country}`} />
        ) : (
          <>
            <WorldMap
              visitedCounts={{}}
              countryLabel={() => ''}
              selectedCountry={null}
              onSelectCountry={() => {}}
              markers={[]}
              selectedMarkerId={null}
              onSelectMarker={() => {}}
              interactive={false}
            />
            <div className="memory-form-map-empty">
              <span className="map-hint">
                <MapPin size={16} strokeWidth={2} aria-hidden="true" />
                Select a place to see it on the map
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SearchResults({ state, onPick }: { state: SearchState; onPick: (p: Place) => void }) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return (
        <ul className="search-results is-loading" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="search-result-skeleton" />
          ))}
        </ul>
      )
    case 'empty':
      return <p className="search-message">No places match “{state.query}”. Try adding the country name.</p>
    case 'failed':
      return <p className="search-message">Couldn't reach the place search. Check your connection and try again.</p>
    case 'results':
      return (
        <ul className="search-results">
          {state.results.map((r) => (
            <li key={`${r.latitude},${r.longitude}`}>
              <button type="button" className="search-result" onClick={() => onPick(r)}>
                <span className="search-result-name">{r.placeName}</span>
                <span className="search-result-sub">{secondaryLabel(r)}</span>
              </button>
            </li>
          ))}
        </ul>
      )
  }
}

/** "Kyoto Prefecture, Japan" — everything after the place name. */
function secondaryLabel(p: Place) {
  const rest = p.displayName.startsWith(p.placeName) ? p.displayName.slice(p.placeName.length).replace(/^,\s*/, '') : p.displayName
  return rest || p.country
}
