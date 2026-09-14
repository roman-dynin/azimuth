import type { CircleMarkerOptions } from 'leaflet'

import L from 'leaflet'

// Leaflet считает anchor от 12×12 по умолчанию, а CSS задаёт 32×32
export function getEmojiIcon(emoji: string, className = ''): L.DivIcon {
  return new L.DivIcon({
    className: `marker--emoji ${className}`.trim(),
    html: escapeHtml(emoji),
    iconSize: [WAYPOINT_EMOJI_SIZE_PX, WAYPOINT_EMOJI_SIZE_PX],
    iconAnchor: [WAYPOINT_EMOJI_SIZE_PX / 2, WAYPOINT_EMOJI_SIZE_PX / 2],
  })
}

export function getWaypointCircleMarkerOptions(routeColor: string, waypoint: IAPIWaypoint): CircleMarkerOptions {
  return {
    color: waypoint.color || routeColor,
    weight: 1,
    radius: waypoint.poi ? 12 : 8,
    fillOpacity: waypoint.poi ? 0.5 : 0.25,
  }
}
