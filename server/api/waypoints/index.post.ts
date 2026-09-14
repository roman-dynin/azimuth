export default defineEventHandler(async (event) => {
  const data = await parseBody(event, waypointCreateSchema)

  await requireById(prisma.route, data.routeId, 'Маршрут не найден')

  assertWaypointInput(data)

  return withRoutesCheck((tx) => tx.waypoint.create({ data }))
})
