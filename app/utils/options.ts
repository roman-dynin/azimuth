import type { CircleMarkerOptions } from 'leaflet'

export function getWaypointCircleMarkerOptions(
  routeColor: string,
  waypoint: IAPIWaypoint,
): CircleMarkerOptions {
  return {
    color: waypoint.color || routeColor,
    weight: 1,
    radius: waypoint.poi ? 8 : 6,
    fillOpacity: waypoint.poi ? 0.5 : 0.25,
  }
}
