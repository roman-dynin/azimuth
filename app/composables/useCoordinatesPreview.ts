import type { LatLngLiteral, Map as LeafletMap, Marker } from 'leaflet'

import L from 'leaflet'

const latLng = ref<LatLngLiteral | null>(null)

let marker: Marker | undefined

let dragCallback: ((lat: number, lng: number) => void) | undefined

export function useCoordinatesPreview() {
  function show(lat: number | null, lng: number | null) {
    latLng.value = lat !== null && lng !== null ? { lat, lng } : null
  }

  function hide() {
    latLng.value = null

    dragCallback = undefined
  }

  function onDrag(callback: (lat: number, lng: number) => void) {
    dragCallback = callback

    onUnmounted(() => {
      dragCallback = undefined
    })
  }

  function init(map: LeafletMap) {
    watch(latLng, (value) => {
      if (!value) {
        marker?.remove()

        marker = undefined

        return
      }

      if (marker) {
        marker.setLatLng(value)

        return
      }

      marker = new L.Marker(value!, {
        icon: new L.DivIcon({
          className: 'marker--emoji marker--preview',
          html: '📍',
        }),
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(map)

      marker.on('dragend', () => {
        latLng.value = marker!.getLatLng()

        dragCallback?.(latLng.value.lat, latLng.value.lng)
      })
    })
  }

  return { show, hide, onDrag, init }
}
