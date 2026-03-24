import type { LatLngTuple, Map as LeafletMap } from 'leaflet'

import L from 'leaflet'

export function renderRouteGroups(
  map: LeafletMap,
  routeGroupProxies: Record<number, RouteGroupProxy>,
): void {
  Object.values(routeGroupProxies).forEach(routeGroupProxy => routeGroupProxy.featureGroup.addTo(map))
}

export function renderRoutes(
  map: LeafletMap,
  routeGroupProxies: Record<number, RouteGroupProxy>,
  routes: IAPIRoute[],
): void {
  routes.forEach((route, routeIndex) => {
    const routeGroupProxy = route.routeGroupId ? routeGroupProxies[route.routeGroupId] : undefined

    const coordinates = [[route.anchorLat, route.anchorLng], ...route.waypoints.map(waypoint => [waypoint.lat, waypoint.lng])] as LatLngTuple[]

    const color = getRouteColor(routeGroupProxy?.value, route)

    const polyline = L.polyline(coordinates, {
      color,
      weight: getRouteWeight(routeGroupProxy?.value, route),
      dashArray: route.guideline ? undefined : [10, 10],
    })

    const tooltip = getRouteTooltip(route)

    if (tooltip) {
      if (route.routeGroupId) {
        polyline.bindPopup(tooltip)
      }
      else {
        polyline.bindTooltip(tooltip)
      }
    }

    if (route.routeGroupId) {
      routeGroupProxy?.featureGroup.addLayer(polyline)
    }
    else {
      polyline.addTo(map)
    }

    renderRouteWaypoints(map, color, route.waypoints)

    if (routeIndex === 0) {
      map.fitBounds(polyline.getBounds())
    }
  })
}

export function renderRouteWaypoints(
  map: LeafletMap,
  routeColor: string,
  waypoints: IAPIWaypoint[],
): void {
  waypoints.forEach((waypoint) => {
    const marker = L.circleMarker([waypoint.lat, waypoint.lng], { ...getWaypointCircleMarkerOptions(routeColor, waypoint) })

    const tooltip = getWaypointTooltip(waypoint)

    if (tooltip) {
      marker.bindTooltip(tooltip)
    }

    marker.addTo(map)
  })
}

export function renderSpots(
  map: LeafletMap,
  spots: IAPISpot[],
): void {
  spots.forEach((spot) => {
    const marker = new L.Marker([spot.lat, spot.lng], {
      icon: new L.DivIcon({
        className: 'marker--emoji',
        html: spot.emoji,
      }),
    })

    const tooltip = getSpotTooltip(spot)

    if (tooltip) {
      marker.bindTooltip(tooltip)
    }

    marker.addTo(map)
  })
}
