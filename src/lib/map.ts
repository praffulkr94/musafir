import type { AttributionControlOptions } from 'maplibre-gl'

/** OpenFreeMap's light "Positron" style — muted greys that let Rausch highlights carry. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

/** The OpenFreeMap style already carries its own OSM/OpenMapTiles attribution. */
export const mapAttributionOptions: AttributionControlOptions = { compact: true }

/**
 * MapLibre's compact attribution starts expanded. Collapse it to the (i) control so the
 * credits stay one tap away without a text strip over the map. OpenStreetMap (ODbL) and
 * OpenFreeMap require the attribution, so it is never removed outright.
 */
export function collapseAttribution(container: HTMLElement) {
  const el = container.querySelector('.maplibregl-ctrl-attrib')
  if (!el) return
  el.classList.remove('maplibregl-compact-show')
  el.removeAttribute('open')
}

/**
 * Positron paints water a mid grey. Musafir's world is white with grey land, so
 * lighten the water once the style is in.
 */
export function lightenWater(map: import('maplibre-gl').Map) {
  if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', '#fbfbfb')
  if (map.getLayer('background')) map.setPaintProperty('background', 'background-color', '#ffffff')
}

/** Show or hide the base map's text labels (country names, cities, seas). */
export function setBaseLabelsVisible(map: import('maplibre-gl').Map, visible: boolean) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type === 'symbol') map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none')
  }
}
