import type { CircleMarkerOptions } from 'leaflet'

export function getWaypointMarkerOptions(routeColor: string, waypoint: IAPIWaypoint): CircleMarkerOptions {
  return {
    color: waypoint.color || routeColor,
    radius: waypoint.poi ? 3 : 2,
    fillOpacity: waypoint.poi ? 0.75 : 0.25,
  }
}
