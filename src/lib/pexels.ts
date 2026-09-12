import type { Photo, PhotoQuery } from '../types'

const ENDPOINT = 'https://api.pexels.com/v1/search'
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY as string | undefined

export const hasPexelsKey = () => Boolean(API_KEY)

type PexelsPhoto = {
  id: number
  url: string
  photographer: string
  photographer_url: string
  alt: string
  src: { large: string; large2x: string; medium: string; landscape: string }
}

/**
 * Fetches one landscape destination photo for "<place> <country>".
 * Returns null when there is no key, no match, or any failure — imagery is
 * optional and must never block saving a memory.
 */
export async function findPexelsPhoto({ placeName, country }: PhotoQuery, signal?: AbortSignal): Promise<Photo | null> {
  if (!API_KEY) return null
  const params = new URLSearchParams({
    query: `${placeName} ${country}`,
    orientation: 'landscape',
    per_page: '3',
  })
  try {
    const res = await fetch(`${ENDPOINT}?${params}`, { signal, headers: { Authorization: API_KEY } })
    if (!res.ok) return null
    const data = (await res.json()) as { photos: PexelsPhoto[] }
    const photo = data.photos?.[0]
    if (!photo) return null
    return {
      imageUrl: photo.src.large2x || photo.src.large,
      imagePhotographer: photo.photographer,
      imageSourceUrl: photo.url,
      imageSource: 'pexels',
    }
  } catch {
    return null
  }
}
