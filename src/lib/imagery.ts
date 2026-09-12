import type { Photo, PhotoQuery } from '../types'
import { findPexelsPhoto, hasPexelsKey } from './pexels'
import { findWikimediaPhoto } from './wikimedia'

/**
 * One place → one photo. Pexels is preferred when a key is configured, with
 * Wikipedia/Commons as the keyless fallback so imagery works out of the box.
 *
 * Lookups are cached across sessions and de-duplicated in flight: the same
 * place can be on screen several times (marker preview, country panel, list)
 * and must only ever cost one request.
 */

const CACHE_KEY = 'musafir.photos'
/** Retry a place that had no photo after a day, not on every render. */
const MISS_TTL = 24 * 60 * 60 * 1000

type Entry = { photo: Photo | null; at: number }

// Coordinates keep two places that share a name apart.
const keyOf = ({ placeName, country, latitude, longitude }: PhotoQuery) =>
  `${placeName}, ${country} @${latitude.toFixed(3)},${longitude.toFixed(3)}`.toLowerCase()

let cache: Record<string, Entry> | null = null

const readCache = (): Record<string, Entry> => {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Record<string, Entry>
  } catch {
    cache = {}
  }
  return cache
}

const writeCache = (key: string, entry: Entry) => {
  const store = readCache()
  store[key] = entry
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store))
  } catch {
    // A full or unavailable localStorage only costs us the cache, not the photo.
  }
}

const inFlight = new Map<string, Promise<Photo | null>>()

async function lookup(place: PhotoQuery): Promise<Photo | null> {
  const pexels = hasPexelsKey() ? await findPexelsPhoto(place) : null
  return pexels ?? (await findWikimediaPhoto(place))
}

/** Resolves the destination photo for a place, using the cache where possible. */
export function resolveDestinationPhoto(place: PhotoQuery): Promise<Photo | null> {
  const key = keyOf(place)

  const cached = readCache()[key]
  if (cached && (cached.photo || Date.now() - cached.at < MISS_TTL)) return Promise.resolve(cached.photo)

  const pending = inFlight.get(key)
  if (pending) return pending

  const request = lookup(place)
    .catch(() => null)
    .then((photo) => {
      writeCache(key, { photo, at: Date.now() })
      inFlight.delete(key)
      return photo
    })

  inFlight.set(key, request)
  return request
}

/** Drops a photo that failed to load so the next lookup can find another. */
export function forgetDestinationPhoto(place: PhotoQuery) {
  const store = readCache()
  delete store[keyOf(place)]
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store))
  } catch {
    // Ignored: see writeCache.
  }
}
