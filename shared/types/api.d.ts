import type { FeatureGroup } from 'leaflet'

import type { RouteGroup } from '~~/prisma/generated/client'

export interface RouteGroupWrapper {
  value: RouteGroup
  featureGroup: FeatureGroup
}

export interface IAPIRoute {
  id: number
  routeGroupId: number | null
  title: string | null
  description: string | null
  isGuideline: boolean
  anchorLat: number
  anchorLng: number
  waypoints: IAPIWaypoint[]
}

export interface IAPIWaypoint {
  id: number
  title: string | null
  description: string | null
  isNotable: boolean
  azimuth: number | null
  seconds: number | null
  lat: number
  lng: number
}
