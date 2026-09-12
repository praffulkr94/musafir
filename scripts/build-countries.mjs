// Generates the static country data used by the world map:
//   public/countries.geojson     MultiPolygon per country, properties { a2, name }
//   public/country-bounds.json   { [A2]: [west, south, east, north] } of the main landmass
//
// Source: Natural Earth 50m via world-atlas (numeric ISO ids) → alpha-2 via i18n-iso-countries.
// Simplified with a per-arc floor so small countries (Luxembourg, Singapore…) keep their shape.
import fs from 'node:fs'
import * as topo from 'topojson-client'
import * as simp from 'topojson-simplify'
import iso from 'i18n-iso-countries'

const T = 1e-2 // simplification threshold (deg²)
const ALPHA = 1e-3 // per-arc floor as a fraction of the smallest feature sharing the arc
const ROUND = 3 // coordinate decimals
const GAP = 3 // degrees: nearby polygons absorbed into a country's bounds

const t = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'))
// Features without a numeric id, mapped by name.
const NAME_A2 = { Kosovo: 'XK', 'N. Cyprus': 'CY', Somaliland: 'SO', 'Indian Ocean Ter.': 'CX+CC' }
const a2Of = (g) => (g.id && iso.numericToAlpha2(g.id)) || NAME_A2[g.properties.name]

const pre = simp.presimplify(structuredClone(t))
const decoded = topo.feature(t, t.objects.countries)
const shoelace = (r) => Math.abs(r.reduce((a, p, i) => (i ? a + (r[i - 1][0] * p[1] - p[0] * r[i - 1][1]) : 0), 0) / 2)
const featArea = (f) =>
  (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).reduce((a, p) => a + shoelace(p[0]), 0)

const arcMin = new Array(pre.arcs.length).fill(Infinity)
t.objects.countries.geometries.forEach((g, i) => {
  const area = featArea(decoded.features[i])
  const walk = (a) => (Array.isArray(a) ? a.forEach(walk) : (arcMin[a < 0 ? ~a : a] = Math.min(arcMin[a < 0 ? ~a : a], area)))
  walk(g.arcs)
})
pre.arcs = pre.arcs.map((arc, i) => arc.filter((p) => p[2] >= Math.min(T, ALPHA * arcMin[i])).map((p) => [p[0], p[1]]))

const geo = topo.feature(pre, pre.objects.countries)
const byA2 = new Map()
const rnd = (c) => (Array.isArray(c[0]) ? c.map(rnd) : [+c[0].toFixed(ROUND), +c[1].toFixed(ROUND)])

// Natural Earth splits countries at the antimeridian, but the pieces on the eastern side
// carry a few vertices written as -180 instead of +180. Left alone, such a ring spans the
// whole world and MapLibre paints a band across the map. Unwrap each ring so consecutive
// points never jump more than 180°, then keep it on the side where most of it lives.
const unwrap = (r) => {
  const o = [r[0]]
  for (let i = 1; i < r.length; i++) {
    let x = r[i][0]
    while (x - o[i - 1][0] > 180) x -= 360
    while (x - o[i - 1][0] < -180) x += 360
    o.push([x, r[i][1]])
  }
  return o
}
const normalizeRing = (r) => {
  const u = unwrap(r)
  const xs = u.map((c) => c[0])
  const mid = (Math.min(...xs) + Math.max(...xs)) / 2
  const shift = mid > 180 ? -360 : mid < -180 ? 360 : 0
  return shift ? u.map(([x, y]) => [x + shift, y]) : u
}
const normalizePolygon = (poly) => poly.map(normalizeRing)

geo.features.forEach((f, i) => {
  const a2 = a2Of(t.objects.countries.geometries[i])
  if (!a2) return
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const p of polys) {
    const key = a2 === 'CX+CC' ? (p[0][0][0] > 100 ? 'CX' : 'CC') : a2
    if (!byA2.has(key)) byA2.set(key, { name: iso.getName(key, 'en') || f.properties.name, polys: [] })
    byA2.get(key).polys.push(rnd(normalizePolygon(p)))
  }
})

const features = [...byA2].map(([a2, { name, polys }]) => ({
  type: 'Feature',
  properties: { a2, name },
  geometry: { type: 'MultiPolygon', coordinates: polys },
}))
fs.writeFileSync('public/countries.geojson', JSON.stringify({ type: 'FeatureCollection', features }))

// Bounds: rings are already unwrapped; start from the largest ring,
// then absorb nearby polygons (islands, Northern Ireland, Zealand…) within GAP degrees.
const bbox = (r) =>
  r.reduce(([w, s, e, n], [x, y]) => [Math.min(w, x), Math.min(s, y), Math.max(e, x), Math.max(n, y)], [Infinity, Infinity, -Infinity, -Infinity])
const gap = (a, b) => Math.max(0, b[0] - a[2], a[0] - b[2], b[1] - a[3], a[1] - b[3])
const bounds = {}
for (const [a2, { polys }] of byA2) {
  if (a2 === 'AQ') continue // Antarctica: the map uses a fixed view instead
  const rings = polys.map((p) => unwrap(p[0])).sort((a, b) => shoelace(b) - shoelace(a))
  let bb = bbox(rings[0])
  if (bb[0] < -180) bb = [bb[0] + 360, bb[1], bb[2] + 360, bb[3]]
  for (const r of rings.slice(1))
    for (const shift of [0, 360, -360]) {
      const b = bbox(r).map((v, i) => (i % 2 ? v : v + shift))
      if (gap(bb, b) <= GAP) bb = [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.max(bb[2], b[2]), Math.max(bb[3], b[3])]
    }
  bounds[a2] = bb.map((v) => +v.toFixed(2))
}
fs.writeFileSync('public/country-bounds.json', JSON.stringify(bounds))
console.log(`countries: ${features.length} features, bounds: ${Object.keys(bounds).length}`)
