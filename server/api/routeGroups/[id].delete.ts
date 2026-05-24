export default defineEventHandler(async (event) => {
  const id = parseId(event)

  await requireById(prisma.routeGroup, id, 'Группа не найдена')

  const routes = await prisma.route.findMany({
    where: { routeGroupId: id },
    select: { id: true },
  })

  const routeIds = routes.map((route) => route.id)

  const waypointIds = routeIds.length
    ? (await prisma.waypoint.findMany({ where: { routeId: { in: routeIds } }, select: { id: true } })).map((w) => w.id)
    : []

  if (waypointIds.length) {
    const [dependentRoutes, dependentWaypoints] = await Promise.all([
      prisma.route.findMany({
        where: { anchorWaypointId: { in: waypointIds }, id: { notIn: routeIds } },
        select: { id: true },
      }),
      prisma.waypoint.findMany({
        where: { targetWaypointId: { in: waypointIds }, routeId: { notIn: routeIds } },
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
        message: `Точки маршрутов группы используются как ${parts.join(' и ')}. Сначала уберите ссылки.`,
      })
    }
  }

  await prisma.$transaction([
    prisma.waypoint.deleteMany({ where: { routeId: { in: routeIds } } }),
    prisma.route.deleteMany({ where: { routeGroupId: id } }),
    prisma.routeGroup.delete({ where: { id } }),
  ])
})
