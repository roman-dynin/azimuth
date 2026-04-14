import type { LatLngTuple, LayerGroup, Map as LeafletMap } from 'leaflet'

import L from 'leaflet'

export function renderRouteGroups(contentLayer: LayerGroup, routeGroupProxies: Record<number, RouteGroupProxy>): void {
  Object.values(routeGroupProxies).forEach((routeGroupProxy) => routeGroupProxy.featureGroup.addTo(contentLayer))
}

export function renderRoutes(
  map: LeafletMap,
  contentLayer: LayerGroup,
  routeGroupProxies: Record<number, RouteGroupProxy>,
  routes: IAPIRoute[],
  fitBounds = false,
): void {
  routes.forEach((route, routeIndex) => {
    const routeGroupProxy = route.routeGroupId ? routeGroupProxies[route.routeGroupId] : undefined

    const coordinates = [
      [route.anchorLat, route.anchorLng],
      ...route.waypoints.map((waypoint) => [waypoint.lat, waypoint.lng]),
    ] as LatLngTuple[]

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
      } else {
        polyline.bindTooltip(tooltip, { permanent: true })
      }
    }

    if (route.routeGroupId) {
      routeGroupProxy?.featureGroup.addLayer(polyline)
    } else {
      polyline.addTo(contentLayer)
    }

    renderRouteWaypoints(contentLayer, color, route.waypoints)

    if (routeIndex === 0 && fitBounds) {
      map.fitBounds(polyline.getBounds())
    }
  })
}

export function renderRouteWaypoints(contentLayer: LayerGroup, routeColor: string, waypoints: IAPIWaypoint[]): void {
  waypoints.forEach((waypoint) => {
    const marker = L.circleMarker([waypoint.lat, waypoint.lng], {
      ...getWaypointCircleMarkerOptions(routeColor, waypoint),
      pane: 'markers',
    })

    const tooltip = getWaypointTooltip(waypoint)

    if (tooltip) {
      marker.bindTooltip(tooltip)
    }

    marker.addTo(contentLayer)
  })
}

export function renderSpots(contentLayer: LayerGroup, spots: IAPISpot[]): void {
  spots.forEach((spot) => {
    const marker = new L.Marker([spot.lat, spot.lng], {
      pane: 'markers',
      icon: new L.DivIcon({
        className: 'marker--emoji',
        html: spot.emoji,
      }),
    })

    const tooltip = getSpotTooltip(spot)

    if (tooltip) {
      marker.bindTooltip(tooltip)
    }

    marker.addTo(contentLayer)
  })
}
