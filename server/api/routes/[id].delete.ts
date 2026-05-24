export default defineEventHandler(async (event) => {
  const id = parseId(event)

  await requireById(prisma.route, id, 'Маршрут не найден')

  const waypointIds = (await prisma.waypoint.findMany({ where: { routeId: id }, select: { id: true } })).map(
    (w) => w.id,
  )

  if (waypointIds.length) {
    const [dependentRoutes, dependentWaypoints] = await Promise.all([
      prisma.route.findMany({
        where: { anchorWaypointId: { in: waypointIds }, id: { not: id } },
        select: { id: true },
      }),
      prisma.waypoint.findMany({
        where: { targetWaypointId: { in: waypointIds }, routeId: { not: id } },
        select: { id: true },
      }),
    ])

    if (dependentRoutes.length || dependentWaypoints.length) {
      const parts: string[] = []

      if (dependentRoutes.length) {
        parts.push(`якорь маршрутов [${dependentRoutes.map((r) => `#${r.id}`).join(', ')}]`)
      }

      if (dependentWaypoints.length) {
        parts.push(`цель точек [${dependentWaypoints.map((w) => `#${w.id}`).join(', ')}]`)
      }

      throw createError({
        statusCode: 422,
        message: `Точки маршрута используются как ${parts.join(' и ')}. Сначала уберите ссылки.`,
      })
    }
  }

  await prisma.$transaction([
    prisma.waypoint.deleteMany({ where: { routeId: id } }),
    prisma.route.delete({ where: { id } }),
  ])
})
