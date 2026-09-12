export type Memory = {
  id: string

  /** Short place name, e.g. "Tokyo". */
  placeName: string
  /** Longer disambiguating label from Nominatim, e.g. "Tokyo, Japan". */
  displayName?: string

  country: string
  /** ISO 3166-1 alpha-2, lowercase, e.g. "jp". */
  countryCode: string

  latitude: number
  longitude: number

  /** ISO date (yyyy-MM-dd). */
  startDate: string
  /** ISO date (yyyy-MM-dd). */
  endDate: string

  imageUrl?: string
  imagePhotographer?: string
  imageSourceUrl?: string
  imageSource?: PhotoSource
  /** Short licence name, e.g. "CC BY-SA 2.0" (Wikimedia photos only). */
  imageLicense?: string

  createdAt: string
}

export type MemoryInput = Omit<Memory, 'id' | 'createdAt'>

/** A geocoded place picked from Nominatim search results. */
export type Place = {
  placeName: string
  displayName: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
}

/** What we know about a place when looking for a photo of it. */
export type PhotoQuery = Pick<Memory, 'placeName' | 'country' | 'latitude' | 'longitude'>

/** Where a destination photo came from, so it can be credited correctly. */
export type PhotoSource = 'pexels' | 'wikimedia'

/** A destination photo found for a place. */
export type Photo = {
  imageUrl: string
  imagePhotographer: string
  imageSourceUrl: string
  imageSource: PhotoSource
  imageLicense?: string
}
