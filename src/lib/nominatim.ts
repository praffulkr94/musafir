import type { Place } from '../types'

const ENDPOINT = 'https://nominatim.openstreetmap.org/search'

type NominatimResult = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  name?: string
  type?: string
  addresstype?: string
  address?: Record<string, string | undefined>
}

const PLACE_KEYS = [
  'city', 'town', 'village', 'hamlet', 'municipality', 'tourism', 'attraction',
  'island', 'county', 'state_district', 'state', 'region', 'province',
] as const

const pickPlaceName = (r: NominatimResult) => {
  if (r.name) return r.name
  const a = r.address ?? {}
  for (const k of PLACE_KEYS) if (a[k]) return a[k] as string
  return r.display_name.split(',')[0].trim()
}

/** Shorter, human display label: "Kyoto, Kyoto Prefecture, Japan". */
const pickDisplayName = (r: NominatimResult, placeName: string, country: string) => {
  const a = r.address ?? {}
  const region = a.state ?? a.province ?? a.region ?? a.county
  const parts = [placeName]
  if (region && region !== placeName) parts.push(region)
  if (country && country !== placeName) parts.push(country)
  return parts.join(', ')
}

/**
 * Explicit, user-triggered place search (never per keystroke — Nominatim's usage
 * policy asks for at most one request per second and no autocomplete).
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    'accept-language': 'en',
  })
  const res = await fetch(`${ENDPOINT}?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Nominatim responded ${res.status}`)
  const data = (await res.json()) as NominatimResult[]

  const seen = new Set<string>()
  const places: Place[] = []
  for (const r of data) {
    const countryCode = r.address?.country_code?.toLowerCase()
    const country = r.address?.country
    if (!countryCode || !country) continue // skip oceans, unbound features
    const placeName = pickPlaceName(r)
    const key = `${placeName}|${countryCode}`
    if (seen.has(key)) continue
    seen.add(key)
    places.push({
      placeName,
      displayName: pickDisplayName(r, placeName, country),
      country,
      countryCode,
      latitude: Number(r.lat),
      longitude: Number(r.lon),
    })
  }
  return places
}
