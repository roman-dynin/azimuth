export default defineEventHandler(async (event) => {
  const id = parseId(event)

  await requireById(prisma.waypoint, id, 'Точка не найдена')

  const [dependentRoutes, dependentWaypoints] = await Promise.all([
    prisma.route.findMany({ where: { anchorWaypointId: id }, select: { id: true } }),
    prisma.waypoint.findMany({ where: { targetWaypointId: id }, select: { id: true } }),
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
      message: `Точка используется как ${parts.join(' и ')}. Сначала уберите ссылки.`,
    })
  }

  return prisma.waypoint.delete({ where: { id } })
})
