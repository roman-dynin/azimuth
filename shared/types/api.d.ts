import type { FeatureGroup } from 'leaflet'

import type { RouteGroup, Spot } from '~~/prisma/generated/client'

export interface IAPIRouteGroup extends RouteGroup {}

export interface RouteGroupProxy {
  value: IAPIRouteGroup
  featureGroup: FeatureGroup
}

export interface IAPIRoute {
  id: number
  routeGroupId: number | null
  guideline: boolean
  title: string | null
  description: string | null
  color: string | null
  weight: number | null
  anchorLat: number
  anchorLng: number
  waypoints: IAPIWaypoint[]
}

export interface IAPIWaypoint {
  id: number
  poi: boolean
  title: string | null
  description: string | null
  color: string | null
  azimuth: number | null
  seconds: number | null
  lat: number
  lng: number
}

export interface IAPISpot extends Spot {}
