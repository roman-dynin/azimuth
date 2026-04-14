import type { Map as LeafletMap } from 'leaflet'

let map: LeafletMap | undefined

export function useMapFocus() {
  function init(leafletMap: LeafletMap) {
    map = leafletMap
  }

  function focusOn(lat: number | null, lng: number | null) {
    if (map && lat !== null && lng !== null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 16))
    }
  }

  return { init, focusOn }
}
