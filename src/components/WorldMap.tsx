import { useEffect, useRef, useState } from 'react'
import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  type ErrorEvent,
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
  type MapMouseEvent,
  type MapSourceDataEvent,
} from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE_URL, collapseAttribution, lightenWater, mapAttributionOptions, setBaseLabelsVisible } from '../lib/map'
import { COUNTRIES_URL, countryBoundsFor, toDatasetCode } from '../lib/countries'
import { MapFallback } from './MapFallback'
import './WorldMap.css'

export type WorldMarker = { id: string; name: string; latitude: number; longitude: number }

type Props = {
  /** alpha-2 (lowercase) -> number of memories. */
  visitedCounts: Record<string, number>
  /** English country label for the hover tooltip. */
  countryLabel: (code: string) => string
  selectedCountry: string | null
  onSelectCountry: (code: string) => void
  markers: WorldMarker[]
  selectedMarkerId: string | null
  onSelectMarker: (id: string) => void
  /** Muted, non-interactive rendering (empty state). */
  interactive?: boolean
}

/** The inhabited world (Antarctica excluded) — fitted to whatever size the frame has. */
const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-168, -56],
  [180, 78],
]
const WORLD_FIT = { padding: 8, maxZoom: 3 }
const MARKER_SOURCE = 'memories'
const COUNTRY_SOURCE = 'countries'

/**
 * The hero map. Country polygons come from a static GeoJSON; visited ones are
 * painted Rausch, hover darkens, click zooms to the country and reveals markers.
 */
export function WorldMap({
  visitedCounts,
  countryLabel,
  selectedCountry,
  onSelectCountry,
  markers,
  selectedMarkerId,
  onSelectMarker,
  interactive = true,
}: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [tip, setTip] = useState<{ x: number; y: number; code: string } | null>(null)

  // Latest props for map event handlers (created once).
  const latest = useRef({ visitedCounts, selectedCountry, onSelectCountry, onSelectMarker, interactive })
  latest.current = { visitedCounts, selectedCountry, onSelectCountry, onSelectMarker, interactive }

  useEffect(() => {
    if (!container.current || mapRef.current) return
    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container: container.current,
        style: MAP_STYLE_URL,
        bounds: WORLD_BOUNDS,
        fitBoundsOptions: WORLD_FIT,
        minZoom: -1,
        maxZoom: 12,
        interactive,
        attributionControl: false,
        renderWorldCopies: false,
        dragRotate: false,
        // Plain wheel scrolls the page; Cmd/Ctrl + wheel (or two fingers on touch) drives the map.
        cooperativeGestures: true,
        pitchWithRotate: false,
      })
    } catch {
      setFailed(true)
      return
    }
    map.touchZoomRotate.disableRotation()
    map.addControl(new AttributionControl(mapAttributionOptions), 'bottom-right')
    if (interactive) {
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    }
    map.on('error', (e: ErrorEvent) => {
      if (e?.error && /style/i.test(String(e.error.message ?? ''))) setFailed(true)
    })

    map.on('load', () => {
      lightenWater(map)
      setBaseLabelsVisible(map, false)
      collapseAttribution(map.getContainer())
      map.addSource(COUNTRY_SOURCE, { type: 'geojson', data: COUNTRIES_URL, promoteId: 'a2' })
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: COUNTRY_SOURCE,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'focused'], false],
            '#ffe3e9',
            ['boolean', ['feature-state', 'hover'], false],
            '#e00b41',
            ['boolean', ['feature-state', 'visited'], false],
            '#ff385c',
            '#ebebeb',
          ],
          'fill-opacity': 1,
          'fill-color-transition': { duration: 150 },
        },
      })
      map.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: COUNTRY_SOURCE,
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'focused'], false], '#ff385c', '#ffffff'],
          'line-width': ['case', ['boolean', ['feature-state', 'focused'], false], 1.5, 0.6],
        },
      })
      map.addSource(MARKER_SOURCE, { type: 'geojson', data: emptyCollection(), promoteId: 'id' })
      map.addLayer({
        id: 'memories-halo',
        type: 'circle',
        source: MARKER_SOURCE,
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 18, 14],
          'circle-color': '#ff385c',
          'circle-opacity': 0.18,
        },
      })
      map.addLayer({
        id: 'memories-dot',
        type: 'circle',
        source: MARKER_SOURCE,
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 9, 7],
          'circle-color': '#ff385c',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2.5,
        },
      })
      map.addLayer({
        id: 'memories-label',
        type: 'symbol',
        source: MARKER_SOURCE,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Medium', 'Noto Sans Regular'],
          'text-size': 13,
          'text-offset': [1.1, 0],
          'text-anchor': 'left',
          'text-max-width': 12,
        },
        paint: {
          'text-color': '#222222',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      })
      setReady(true)
    })

    if (interactive) {
      let hovered: string | null = null
      const clearHover = () => {
        if (hovered) map.setFeatureState({ source: COUNTRY_SOURCE, id: hovered }, { hover: false })
        hovered = null
        map.getCanvas().style.cursor = ''
        setTip(null)
      }
      const onMove = (e: MapMouseEvent) => {
        if (latest.current.selectedCountry) return clearHover()
        const f = map.queryRenderedFeatures(e.point, { layers: ['countries-fill'] })[0] as MapGeoJSONFeature | undefined
        const code = f?.id != null ? String(f.id) : null
        const visitedCode = code && visitedLookup(latest.current.visitedCounts, code)
        if (!visitedCode) return clearHover()
        if (hovered !== code) {
          if (hovered) map.setFeatureState({ source: COUNTRY_SOURCE, id: hovered }, { hover: false })
          hovered = code
          map.setFeatureState({ source: COUNTRY_SOURCE, id: code }, { hover: true })
        }
        map.getCanvas().style.cursor = 'pointer'
        setTip({ x: e.point.x, y: e.point.y, code: visitedCode })
      }
      map.on('mousemove', 'countries-fill', onMove)
      map.on('mouseleave', 'countries-fill', clearHover)
      map.on('click', 'countries-fill', (e: MapLayerMouseEvent) => {
        if (latest.current.selectedCountry) return
        const f = e.features?.[0]
        const code = f?.id != null ? visitedLookup(latest.current.visitedCounts, String(f.id)) : null
        if (code) {
          clearHover()
          latest.current.onSelectCountry(code)
        }
      })
      map.on('mouseenter', 'memories-dot', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'memories-dot', () => (map.getCanvas().style.cursor = ''))
      map.on('click', 'memories-dot', (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id
        if (id) latest.current.onSelectMarker(String(id))
      })
    }

    if (import.meta.env.DEV) (window as unknown as { __musafirMap?: MapLibreMap }).__musafirMap = map
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Visited + focused feature state.
  const paintedRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const apply = () => {
      for (const id of paintedRef.current) map.setFeatureState({ source: COUNTRY_SOURCE, id }, { visited: false, focused: false })
      paintedRef.current.clear()
      const focus = selectedCountry ? toDatasetCode(selectedCountry) : null
      for (const code of Object.keys(visitedCounts)) {
        const id = toDatasetCode(code)
        if (!id) continue
        map.setFeatureState({ source: COUNTRY_SOURCE, id }, { visited: !focus, focused: id === focus })
        paintedRef.current.add(id)
      }
    }
    if (map.isSourceLoaded(COUNTRY_SOURCE)) apply()
    const onData = (e: MapSourceDataEvent) => {
      if (e.sourceId === COUNTRY_SOURCE && e.isSourceLoaded) apply()
    }
    map.on('sourcedata', onData)
    return () => {
      map.off('sourcedata', onData)
    }
  }, [visitedCounts, selectedCountry, ready])

  // Camera: world view or country bounds. Zoomed in, let the base map show through.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setPaintProperty(
      'countries-fill',
      'fill-opacity',
      selectedCountry ? ['case', ['boolean', ['feature-state', 'focused'], false], 0.85, 0.7] : 1,
    )
    // The flat world is a silhouette; place names only help once zoomed into a country.
    setBaseLabelsVisible(map, Boolean(selectedCountry))
    if (map.getLayer('memories-label')) map.setLayoutProperty('memories-label', 'visibility', 'visible')
    if (!selectedCountry) {
      map.fitBounds(WORLD_BOUNDS, { ...WORLD_FIT, duration: 900, essential: true })
      return
    }
    let cancelled = false
    void countryBoundsFor(selectedCountry).then((bounds) => {
      if (cancelled) return
      if (bounds) map.fitBounds(bounds, { padding: 56, maxZoom: 6.5, duration: 900, essential: true })
      else if (markers.length) {
        const b = new LngLatBounds()
        markers.forEach((m) => b.extend([m.longitude, m.latitude]))
        map.fitBounds(b, { padding: 80, maxZoom: 6.5, duration: 900, essential: true })
      }
    })
    return () => {
      cancelled = true
    }
    // Markers only matter as a fallback when the country has no polygon.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, ready])

  // Markers for the selected country.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const src = map.getSource(MARKER_SOURCE) as GeoJSONSource | undefined
    src?.setData({
      type: 'FeatureCollection',
      features: selectedCountry
        ? markers.map((m) => ({
            type: 'Feature',
            id: m.id,
            properties: { id: m.id, name: m.name },
            geometry: { type: 'Point', coordinates: [m.longitude, m.latitude] },
          }))
        : [],
    })
  }, [markers, selectedCountry, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const m of markers) map.setFeatureState({ source: MARKER_SOURCE, id: m.id }, { selected: m.id === selectedMarkerId })
  }, [selectedMarkerId, markers, ready])

  if (failed) return <MapFallback label="your world" />

  const tipCount = tip ? visitedCounts[tip.code] : 0
  return (
    <div className={`world-map${interactive ? '' : ' is-static'}`}>
      <div ref={container} className="world-map-canvas" role="img" aria-label="World map of the countries you have visited" />
      {tip && (
        <div className="tooltip world-map-tip" role="tooltip" style={{ left: tip.x, top: tip.y }}>
          <div className="world-map-tip-title">{countryLabel(tip.code)}</div>
          <div className="world-map-tip-sub">
            {tipCount} {tipCount === 1 ? 'place' : 'places'}
          </div>
        </div>
      )}
    </div>
  )
}

const emptyCollection = (): FeatureCollection => ({ type: 'FeatureCollection', features: [] })

/** Given a dataset feature id, return the memory country code it represents (if visited). */
function visitedLookup(visited: Record<string, number>, datasetId: string) {
  for (const code of Object.keys(visited)) if (toDatasetCode(code) === datasetId) return code
  return null
}
