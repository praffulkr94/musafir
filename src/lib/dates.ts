import { format, isAfter, isValid, parseISO, startOfToday } from 'date-fns'

export const ISO_DATE = 'yyyy-MM-dd'

export const toIsoDate = (d: Date) => format(d, ISO_DATE)
export const fromIsoDate = (s: string) => parseISO(s)

export const isValidIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && isValid(parseISO(s))

export const today = () => startOfToday()
export const isFutureDate = (d: Date) => isAfter(d, today())

/** "12 Mar 2026" */
export const formatDate = (iso: string) => format(fromIsoDate(iso), 'd MMM yyyy')

/**
 * Compact range, collapsing repeated month/year:
 *  same day        -> "12 Mar 2026"
 *  same month      -> "12 – 18 Mar 2026"
 *  same year       -> "27 Dec – 2 Jan 2026"  (falls to full form when years differ)
 *  different years -> "27 Dec 2025 – 2 Jan 2026"
 */
export const formatDateRange = (startIso: string, endIso: string) => {
  const start = fromIsoDate(startIso)
  const end = fromIsoDate(endIso)
  if (startIso === endIso) return format(start, 'd MMM yyyy')
  if (start.getFullYear() !== end.getFullYear())
    return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`
  if (start.getMonth() !== end.getMonth())
    return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`
  return `${format(start, 'd')} – ${format(end, 'd MMM yyyy')}`
}

/** "35.68° N, 139.69° E" */
export const formatCoordinates = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`
