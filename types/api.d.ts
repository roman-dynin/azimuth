import type { LatLngTuple } from 'leaflet'

export interface EnrichedRoute {
  id: number
  title: string
  guideline: boolean
  latLng: LatLngTuple
  waypoints: EnrichedWaypoint[]
}

export interface EnrichedWaypoint {
  id: number
  azimuth: number
  seconds: number
  latLng: LatLngTuple
}
