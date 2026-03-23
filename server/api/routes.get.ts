// TODO: Кэширование?

import type { LatLngTuple } from 'leaflet'

import type { EnrichedRoute, EnrichedWaypoint } from '~~/types/api'

const METERS_PER_DEGREE = 111320

// Скорость дайвера в м/с (это тестовое значение и пока имеет мало общего с реальной скоростью)
const DIVER_SPEED_MULTIPLIER = 0.25

export default defineEventHandler(async () => {
  const enrichedRoutes: EnrichedRoute[] = []

  const processedRouteIds: number[] = []

  const processedWaypoints: Record<number, LatLngTuple> = {}

  const routes = await prisma.route.findMany({
    orderBy: {
      id: 'asc',
    },
  })

  while (processedRouteIds.length < routes.length) {
    for (const route of routes) {
      if (processedRouteIds.findIndex(value => value === route.id) !== -1) {
        continue
      }

      let originLat: number

      let originLng: number

      if (route.parentWaypointId) {
        const origin = processedWaypoints[route.parentWaypointId]

        if (!origin) {
          continue
        }

        [originLat, originLng] = origin
      }
      else {
        originLat = route.lat!

        originLng = route.lng!
      }

      const routeLatLng: LatLngTuple = [originLat, originLng] // Точка начала маршрута

      const waypoints = await prisma.waypoint.findMany({
        where: {
          routeId: route.id,
        },
        orderBy: {
          id: 'asc',
        },
      })

      const enrichedWaypoints: EnrichedWaypoint[] = waypoints.map((waypoint) => {
        const distance = waypoint.seconds * DIVER_SPEED_MULTIPLIER

        const radians = waypoint.azimuth * (Math.PI / 180)

        const latOffset = distance * Math.cos(radians) / METERS_PER_DEGREE

        const lngOffset = distance * Math.sin(radians) / (METERS_PER_DEGREE * Math.cos(originLat * (Math.PI / 180)))

        originLat = Number.parseFloat((originLat + latOffset).toFixed(7))

        originLng = Number.parseFloat((originLng + lngOffset).toFixed(7))

        const waypointLatLng: LatLngTuple = [originLat, originLng]

        processedWaypoints[waypoint.id] = waypointLatLng

        return {
          id: waypoint.id,
          azimuth: waypoint.azimuth,
          seconds: waypoint.seconds,
          latLng: waypointLatLng,
        }
      })

      enrichedRoutes.push({
        id: route.id,
        title: route.title,
        latLng: routeLatLng,
        waypoints: enrichedWaypoints,
      })

      processedRouteIds.push(route.id)
    }
  }

  return enrichedRoutes
})
