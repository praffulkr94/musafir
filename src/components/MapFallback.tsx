import { MapPinOff } from 'lucide-react'
import './MapFallback.css'

/** Shown when MapLibre cannot initialise; the surrounding text keeps the location legible. */
export function MapFallback({ label }: { label: string }) {
  return (
    <div className="map-fallback" role="status">
      <MapPinOff size={24} strokeWidth={1.75} aria-hidden="true" />
      <p className="body-sm">The map couldn't load. {label} is still saved.</p>
    </div>
  )
}
