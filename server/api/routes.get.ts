import type { Waypoint } from '~~/prisma/generated/client'

export default defineEventHandler(async () => {
  const [rawRoutes, rawWaypoints] = await Promise.all([
    prisma.route.findMany({ orderBy: { id: 'asc' } }),
    prisma.waypoint.findMany({ orderBy: [{ order: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }] }),
  ])

  const waypointsByRouteId = new Map<number, Waypoint[]>()

  for (const waypoint of rawWaypoints) {
    const list = waypointsByRouteId.get(waypoint.routeId) ?? []

    list.push(waypoint)

    waypointsByRouteId.set(waypoint.routeId, list)
  }

  return buildRoutes(rawRoutes, waypointsByRouteId)
})
