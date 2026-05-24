import type { Route, Waypoint } from '~~/prisma/generated/client'

export function buildRoutes(rawRoutes: Route[], waypointsByRouteId: Map<number, Waypoint[]>): IAPIRoute[] {
  const routes: IAPIRoute[] = []

  const handled = new Set<number>()

  const waypointsLatLng: Record<number, [number, number]> = {}

  while (handled.size < rawRoutes.length) {
    let progress = false

    for (const route of rawRoutes) {
      if (handled.has(route.id)) continue

      const built = buildRoute(route, waypointsByRouteId.get(route.id) ?? [], waypointsLatLng)

      if (!built) continue

      routes.push(built)

      handled.add(route.id)

      progress = true
    }

    if (!progress) {
      const unresolved = rawRoutes.filter((r) => !handled.has(r.id)).map((r) => r.id)

      throw createError({
        statusCode: 422,
        message: `Неразрешимая ссылка (цикл или несуществующий ID) anchorWaypointId/targetWaypointId. Маршруты: ${unresolved.join(', ')}`,
      })
    }
  }

  return routes
}

function buildRoute(
  route: Route,
  rawWaypoints: Waypoint[],
  waypointsLatLng: Record<number, [number, number]>,
): IAPIRoute | null {
  let previousLat: number

  let previousLng: number

  if (route.anchorWaypointId) {
    const anchor = waypointsLatLng[route.anchorWaypointId]

    if (!anchor) {
      return null
    }

    ;[previousLat, previousLng] = anchor
  } else {
    previousLat = route.anchorLat!

    previousLng = route.anchorLng!
  }

  const anchorLat = previousLat

  const anchorLng = previousLng

  const waypoints: IAPIWaypoint[] = []

  for (const { routeId: _routeId, ...waypoint } of rawWaypoints) {
    let seconds: number | null = waypoint.seconds

    let distance: number | null = waypoint.distance

    let azimuth: number | null = waypoint.azimuth

    if (waypoint.targetWaypointId) {
      const target = waypointsLatLng[waypoint.targetWaypointId]

      if (!target) return null

      const [targetLat, targetLng] = target

      ;({ azimuth, distance } = inverseOffset(previousLat, previousLng, targetLat, targetLng))

      seconds = distance / DIVER_SPEED_MULTIPLIER

      previousLat = targetLat

      previousLng = targetLng
    } else {
      // distance приоритетнее seconds: если задано distance, seconds пересчитывается из него
      distance = distance ?? seconds! * DIVER_SPEED_MULTIPLIER

      seconds = distance / DIVER_SPEED_MULTIPLIER

      ;[previousLat, previousLng] = forwardOffset(previousLat, previousLng, waypoint.azimuth!, distance)
    }

    waypointsLatLng[waypoint.id] = [previousLat, previousLng]

    waypoints.push({
      ...waypoint,
      azimuth,
      seconds,
      distance,
      lat: previousLat,
      lng: previousLng,
    })
  }

  return {
    id: route.id,
    routeGroupId: route.routeGroupId,
    guideline: route.guideline,
    anchorWaypointId: route.anchorWaypointId,
    title: route.title,
    description: route.description,
    color: route.color,
    weight: route.weight,
    anchorLat,
    anchorLng,
    waypoints,
  }
}
