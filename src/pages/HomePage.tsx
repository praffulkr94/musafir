import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useMemories } from '../store/memories'
import { countMemoriesByCountry, getMemoriesForCountry, getTotalPlaces, getUniqueCountries, getYearsVisited } from '../lib/derived'
import { formatDateRange } from '../lib/dates'
import { WorldMap } from '../components/WorldMap'
import { DestinationImage } from '../components/DestinationImage'
import { Tip } from '../components/Tip'
import './HomePage.css'

export function HomePage() {
  const memories = useMemories((s) => s.memories)
  return memories.length === 0 ? <EmptyHome /> : <PopulatedHome />
}

function EmptyHome() {
  return (
    <div className="container page home">
      <section className="home-empty">
        <h1 className="display-xl">Your world starts here</h1>
        <p className="text-muted">Add the places you've visited and watch your world take shape.</p>
        <Link to="/create" className="btn btn-primary">
          <Plus size={20} strokeWidth={2} aria-hidden="true" />
          Create Memory
        </Link>
      </section>
      <div className="home-map-frame is-empty" aria-hidden="true">
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
      </div>
    </div>
  )
}

function PopulatedHome() {
  const memories = useMemories((s) => s.memories)
  const navigate = useNavigate()
  const [chosenCountry, setSelectedCountry] = useState<string | null>(null)
  const [chosenMarkerId, setSelectedMarkerId] = useState<string | null>(null)

  const visitedCounts = useMemo(() => countMemoriesByCountry(memories), [memories])
  const countryNames = useMemo(() => {
    const names: Record<string, string> = {}
    for (const m of memories) names[m.countryCode] ??= m.country
    return names
  }, [memories])
  const stats = {
    places: getTotalPlaces(memories),
    countries: getUniqueCountries(memories).length,
    years: getYearsVisited(memories).length,
  }

  // Selection is derived so it can never point at a country or memory that was deleted.
  const selectedCountry = chosenCountry && visitedCounts[chosenCountry] ? chosenCountry : null
  const countryMemories = selectedCountry ? getMemoriesForCountry(memories, selectedCountry) : []
  const preview = chosenMarkerId ? countryMemories.find((m) => m.id === chosenMarkerId) ?? null : null
  const selectedMarkerId = preview?.id ?? null

  const markers = countryMemories.map((m) => ({ id: m.id, name: m.placeName, latitude: m.latitude, longitude: m.longitude }))
  const visitedList = Object.keys(visitedCounts).sort((a, b) => countryNames[a].localeCompare(countryNames[b]))

  const selectCountry = (code: string | null) => {
    setSelectedCountry(code)
    setSelectedMarkerId(null)
  }

  return (
    <div className="container page home">
      <div className="page-header">
        <div>
          <h1 className="display-xl">My World</h1>
          <p>A visual record of the places you've experienced.</p>
        </div>
        <dl className="home-stats">
          <Stat value={stats.places} label={stats.places === 1 ? 'Place' : 'Places'} />
          <Stat value={stats.countries} label={stats.countries === 1 ? 'Country' : 'Countries'} />
          <Stat value={stats.years} label={stats.years === 1 ? 'Year' : 'Years'} />
        </dl>
      </div>

      <div className={`home-grid${selectedCountry ? ' has-country' : ''}`}>
        <div className="home-map-frame">
          <WorldMap
            visitedCounts={visitedCounts}
            countryLabel={(code) => countryNames[code] ?? code.toUpperCase()}
            selectedCountry={selectedCountry}
            onSelectCountry={selectCountry}
            markers={markers}
            selectedMarkerId={selectedMarkerId}
            onSelectMarker={setSelectedMarkerId}
          />

          {selectedCountry ? (
            <button type="button" className="btn btn-outline btn-sm btn-pill home-back" onClick={() => selectCountry(null)}>
              <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
              Back to world
            </button>
          ) : (
            <div className="home-legend" aria-hidden="true">
              <span>
                <i className="home-legend-dot is-visited" /> Visited
              </span>
              <span>
                <i className="home-legend-dot" /> Not visited
              </span>
            </div>
          )}

          {preview && (
            <div className="place-preview" role="dialog" aria-label={`${preview.placeName}, ${preview.country}`}>
              <div className="place-preview-image">
                <DestinationImage memory={preview} />
              </div>
              <div className="place-preview-row">
                <div className="place-preview-text">
                  <div className="title-md">
                    {preview.placeName}, {preview.country}
                  </div>
                  <div className="body-sm text-muted">{formatDateRange(preview.startDate, preview.endDate)}</div>
                </div>
                <Tip label="Close">
                  <button type="button" className="icon-btn icon-btn-soft" onClick={() => setSelectedMarkerId(null)} aria-label="Close preview">
                    <X size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                </Tip>
              </div>
              <Link to={`/places/${preview.id}`} className="btn btn-primary btn-block">
                View Memory
              </Link>
            </div>
          )}
        </div>

        {selectedCountry ? (
          <aside className="country-panel" aria-label={`${countryNames[selectedCountry]} details`}>
            <div>
              <h2 className="display-lg">{countryNames[selectedCountry]}</h2>
              <div className="body-sm text-muted">
                {countryMemories.length} {countryMemories.length === 1 ? 'place' : 'places'}
              </div>
            </div>
            <ul className="country-places">
              {countryMemories.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`country-place${m.id === selectedMarkerId ? ' is-selected' : ''}`}
                    onClick={() => setSelectedMarkerId(m.id)}
                    onDoubleClick={() => navigate(`/places/${m.id}`)}
                    aria-pressed={m.id === selectedMarkerId}
                  >
                    <span className="country-place-dot" aria-hidden="true" />
                    <span className="country-place-text">
                      <span className="title-md">{m.placeName}</span>
                      <span className="body-sm text-muted">{formatDateRange(m.startDate, m.endDate)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        ) : (
          <nav className="visited-chips" aria-label="Countries you've visited">
            {visitedList.map((code) => (
              <button key={code} type="button" className="visited-chip" onClick={() => selectCountry(code)}>
                {countryNames[code]}
                <span className="visited-chip-count">{visitedCounts[code]}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="home-stat">
      <dt className="body-sm text-muted">{label}</dt>
      <dd className="home-stat-value">{value}</dd>
    </div>
  )
}
