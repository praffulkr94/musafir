import type { Photo, PhotoQuery } from '../types'

const WIKIPEDIA = 'https://en.wikipedia.org/w/api.php'
const COMMONS = 'https://commons.wikimedia.org/w/api.php'
/** How far from the memory's coordinates a landmark article may sit. */
const NEARBY_RADIUS_M = 10_000

/**
 * Wikipedia/Commons is the keyless imagery source: every place worth
 * remembering has an article, and its lead image is a photo of that exact
 * place rather than generic stock. Requests are plain CORS GETs — Wikimedia's
 * preflight rejects custom headers, so never add any.
 */

type Article = {
  title: string
  index: number
  pageimage?: string
  fullurl?: string
  thumbnail?: { source: string; width: number; height: number }
}

type ExtValue = { value: string }

const IMAGE_PROPS = {
  prop: 'pageimages|info',
  inprop: 'url',
  piprop: 'thumbnail|name',
  pithumbsize: '1200',
}

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/**
 * True when an article is *about* the place rather than merely near it or
 * sharing a word with it: "Dhaka" or "Sanchi, Madhya Pradesh" for Sanchi, but
 * not "Shanti Stupa, Ladakh" for Stupa 2.
 */
const isAbout = (title: string, placeName: string) => {
  const t = normalize(title)
  const p = normalize(placeName)
  return t === p || t.startsWith(`${p},`) || t.startsWith(`${p} (`)
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** Articles with a lead image, in the order the API ranked them. */
async function queryArticles(params: Record<string, string>, signal?: AbortSignal): Promise<Article[]> {
  const query = new URLSearchParams({ action: 'query', format: 'json', origin: '*', ...IMAGE_PROPS, ...params })
  const data = await getJson<{ query?: { pages?: Record<string, Article> } }>(`${WIKIPEDIA}?${query}`, signal)
  return Object.values(data?.query?.pages ?? {})
    .filter((p) => p.thumbnail?.source)
    .sort((a, b) => a.index - b.index)
}

/** Articles matching a free-text search, best match first. */
const searchArticles = (search: string, signal?: AbortSignal) =>
  queryArticles({ generator: 'search', gsrsearch: search, gsrlimit: '5', gsrnamespace: '0' }, signal)

/** Articles with coordinates near a point, nearest first. */
const nearbyArticles = (latitude: number, longitude: number, signal?: AbortSignal) =>
  queryArticles(
    { generator: 'geosearch', ggscoord: `${latitude}|${longitude}`, ggsradius: String(NEARBY_RADIUS_M), ggslimit: '20' },
    signal,
  )

/** Author and licence for a Commons file, so the credit line is honest. */
async function getCredit(file: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: `File:${file}`,
    prop: 'imageinfo',
    iiprop: 'extmetadata|url',
    iiextmetadatafilter: 'Artist|LicenseShortName',
  })
  const data = await getJson<{
    query?: { pages?: Record<string, { imageinfo?: [{ descriptionurl?: string; extmetadata?: Record<string, ExtValue> }] }> }
  }>(`${COMMONS}?${params}`, signal)
  const info = Object.values(data?.query?.pages ?? {})[0]?.imageinfo?.[0]
  if (!info) return null
  const artist = info.extmetadata?.Artist?.value
  return {
    photographer: artist ? stripHtml(artist) : '',
    license: info.extmetadata?.LicenseShortName?.value ?? '',
    sourceUrl: info.descriptionurl ?? '',
  }
}

async function toPhoto(article: Article, signal?: AbortSignal): Promise<Photo | null> {
  if (!article.thumbnail) return null
  const credit = article.pageimage ? await getCredit(article.pageimage, signal) : null
  return {
    imageUrl: article.thumbnail.source,
    imagePhotographer: credit?.photographer ?? '',
    imageSourceUrl: credit?.sourceUrl || article.fullurl || '',
    imageSource: 'wikimedia',
    imageLicense: credit?.license,
  }
}

/**
 * Finds a photo of a place.
 *
 * Named search and geosearch are good at opposite things, so both are used:
 * a search for "Udaipur India" lands on the city article, while a landmark
 * like "Stupa 2" only ever matches by its coordinates. An article is trusted
 * by name only when it is actually about the place; otherwise the nearest
 * article to the memory's own coordinates wins.
 */
export async function findWikimediaPhoto(
  { placeName, country, latitude, longitude }: PhotoQuery,
  signal?: AbortSignal,
): Promise<Photo | null> {
  const named = await searchArticles(`${placeName} ${country}`.trim(), signal)
  if (signal?.aborted) return null

  const byName = named.find((a) => isAbout(a.title, placeName))
  if (byName) return toPhoto(byName, signal)

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const nearby = await nearbyArticles(latitude, longitude, signal)
    if (signal?.aborted) return null
    const best = nearby.find((a) => isAbout(a.title, placeName)) ?? nearby[0]
    if (best) return toPhoto(best, signal)
  }

  // Nothing matched the place itself: settle for the best photo of the region.
  const fallback = named[0] ?? (await searchArticles(country, signal))[0]
  return fallback ? toPhoto(fallback, signal) : null
}
