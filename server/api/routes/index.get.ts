import type { Waypoint } from '~~/prisma/generated/client'

import { z } from 'zod'

const querySchema = z.object({ speed: z.coerce.number().positive().max(10).optional() })

export default defineEventHandler(async (event) => {
  const { speed } = await getValidatedQuery(event, querySchema.parse)

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

  return buildRoutes(rawRoutes, waypointsByRouteId, speed)
})
