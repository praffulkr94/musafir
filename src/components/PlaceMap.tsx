import { useEffect, useRef, useState } from 'react'
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl, type ErrorEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE_URL, collapseAttribution, mapAttributionOptions } from '../lib/map'
import { MapFallback } from './MapFallback'
import './PlaceMap.css'

type Props = {
  latitude: number
  longitude: number
  zoom?: number
  label: string
  /** Muted preview (no interaction), e.g. inside forms. */
  interactive?: boolean
}

/** Focused map with a single Rausch marker on one place. */
export function PlaceMap({ latitude, longitude, zoom = 9, label, interactive = true }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!container.current || mapRef.current) return
    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container: container.current,
        style: MAP_STYLE_URL,
        center: [longitude, latitude],
        zoom,
        interactive,
        attributionControl: false,
        // Plain wheel scrolls the page; Cmd/Ctrl + wheel (or two fingers on touch) drives the map.
        cooperativeGestures: true,
      })
    } catch {
      setFailed(true)
      return
    }
    map.addControl(new AttributionControl(mapAttributionOptions), 'bottom-right')
    map.once('load', () => collapseAttribution(map.getContainer()))
    if (interactive) {
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    }
    map.on('error', (e: ErrorEvent) => {
      // Tile/style failures: keep the textual info, show the fallback only when the style itself fails.
      if (e?.error && /style/i.test(String(e.error.message ?? ''))) setFailed(true)
    })
    markerRef.current = new Marker({ element: markerElement(label) })
      .setLngLat([longitude, latitude])
      .addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Map is created once; position updates flow through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markerRef.current?.setLngLat([longitude, latitude])
    map.easeTo({ center: [longitude, latitude], zoom, duration: 900 })
  }, [latitude, longitude, zoom])

  if (failed) return <MapFallback label={label} />

  return (
    <div className="place-map">
      <div ref={container} className="place-map-canvas" role="img" aria-label={`Map showing ${label}`} />
    </div>
  )
}

function markerElement(label: string) {
  const el = document.createElement('div')
  el.className = 'place-marker'
  el.setAttribute('aria-label', label)
  el.setAttribute('title', label)
  return el
}
