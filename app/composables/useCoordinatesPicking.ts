import type { LatLngLiteral } from 'leaflet'

export function useCoordinatesPicking(
  getLatLng: () => LatLngLiteral | undefined,
  onPick: (lat: number, lng: number) => void,
  onPickingChange: (value: boolean) => void,
) {
  const picking = ref(false)

  function toggle() {
    picking.value = !picking.value

    onPickingChange(picking.value)
  }

  watch(getLatLng, (latlng) => {
    if (!latlng || !picking.value) return

    onPick(latlng.lat, latlng.lng)

    picking.value = false

    onPickingChange(false)
  })

  return { picking, toggle }
}
