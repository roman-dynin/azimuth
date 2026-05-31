import type { FeatureGroup, LatLngTuple, LayerGroup, Map as LeafletMap } from 'leaflet'

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
      map.fitBounds(polyline.getBounds(), { maxZoom: DEFAULT_MAP_ZOOM })
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

    if (waypoint.emoji) {
      const [emojiLat, emojiLng] = forwardOffset(
        waypoint.lat,
        waypoint.lng,
        WAYPOINT_EMOJI_ANGLE_DEG,
        WAYPOINT_EMOJI_OFFSET_METERS,
      )

      const emojiMarker = new L.Marker([emojiLat, emojiLng], {
        pane: 'markers',
        icon: new L.DivIcon({
          className: 'marker--emoji',
          html: waypoint.emoji,
          iconSize: [WAYPOINT_EMOJI_SIZE_PX, WAYPOINT_EMOJI_SIZE_PX],
          iconAnchor: [WAYPOINT_EMOJI_SIZE_PX / 2, WAYPOINT_EMOJI_SIZE_PX / 2],
        }),
      })

      if (tooltip) {
        emojiMarker.bindTooltip(tooltip)
      }

      emojiMarker.addTo(contentLayer)
    }
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

export function renderDepthHalos(depthLayer: FeatureGroup, waypoints: IAPIWaypoint[], spots: IAPISpot[]): void {
  depthLayer.clearLayers()

  function drawHalo(lat: number, lng: number, depth: number): void {
    const color = getDepthColor(depth)

    DEPTH_HALO_RINGS.forEach((ring) => {
      L.circle([lat, lng], {
        radius: DEPTH_HALO_RADIUS_METERS * ring.scale,
        color,
        fillColor: color,
        fillOpacity: ring.opacity,
        stroke: false,
        pane: 'depth',
        interactive: false,
      }).addTo(depthLayer)
    })
  }

  const halos: { lat: number; lng: number; depth: number }[] = []

  halos.push(
    ...waypoints
      .filter((waypoint) => waypoint.depth !== null)
      .map((waypoint) => ({ lat: waypoint.lat, lng: waypoint.lng, depth: waypoint.depth! })),
  )

  halos.push(
    ...spots
      .filter((spot) => spot.depth !== null)
      .map((spot) => ({ lat: spot.lat, lng: spot.lng, depth: spot.depth! })),
  )

  halos
    .sort((a, b) => b.depth - a.depth)
    .reverse()
    .forEach((halo) => drawHalo(halo.lat, halo.lng, halo.depth))
}

export function renderPhotos(contentLayer: LayerGroup, photos: IAPIPhoto[]): void {
  const { open } = useLightbox()

  photos.forEach((photo) => {
    const marker = new L.Marker([photo.lat, photo.lng], {
      pane: 'markers',
      icon: new L.DivIcon({
        className: 'marker--emoji',
        html: '📷',
      }),
    })

    const tooltip = getPhotoTooltip(photo)

    if (tooltip) {
      marker.bindTooltip(tooltip)
    }

    marker.on('click', () => open(`/uploads/photos/${photo.filename}`))

    marker.addTo(contentLayer)
  })
}
