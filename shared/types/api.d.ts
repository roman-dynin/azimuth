import type { FeatureGroup } from 'leaflet'

import type { Photo, RouteGroup, Spot } from '~~/prisma/generated/client'

export type IAPIRouteGroup = RouteGroup

export interface RouteGroupProxy {
  value: IAPIRouteGroup
  featureGroup: FeatureGroup
}

export interface IAPIRoute {
  id: number
  routeGroupId: number | null
  guideline: boolean
  anchorWaypointId: number | null
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
  emoji: string | null
  targetWaypointId: number | null
  azimuth: number | null
  seconds: number | null
  distance: number | null
  depth: number | null
  order: number | null
  lat: number
  lng: number
}

export type IAPISpot = Spot

export type IAPIPhoto = Photo
