import type { Memory } from '../types'

export const getTotalPlaces = (memories: Memory[]) => memories.length

export const getUniqueCountries = (memories: Memory[]) =>
  Array.from(new Set(memories.map((m) => m.countryCode)))

export const getYearsVisited = (memories: Memory[]) => {
  const years = new Set<number>()
  for (const m of memories) {
    const start = Number(m.startDate.slice(0, 4))
    const end = Number(m.endDate.slice(0, 4))
    for (let y = start; y <= end; y++) years.add(y)
  }
  return Array.from(years).sort()
}

/** countryCode -> number of memories, for map highlighting and hover tooltips. */
export const countMemoriesByCountry = (memories: Memory[]) => {
  const counts: Record<string, number> = {}
  for (const m of memories) counts[m.countryCode] = (counts[m.countryCode] ?? 0) + 1
  return counts
}

export const groupMemoriesByCountry = (memories: Memory[]) => {
  const groups: Record<string, Memory[]> = {}
  for (const m of memories) (groups[m.countryCode] ??= []).push(m)
  return groups
}

export const getMemoriesForCountry = (memories: Memory[], countryCode: string) =>
  memories.filter((m) => m.countryCode === countryCode).sort(byStartDateAsc)

/** Newest trip first — the default order for lists. */
export const sortByMostRecent = (memories: Memory[]) => [...memories].sort(byStartDateDesc)

const byStartDateAsc = (a: Memory, b: Memory) => a.startDate.localeCompare(b.startDate)
const byStartDateDesc = (a: Memory, b: Memory) => b.startDate.localeCompare(a.startDate)
