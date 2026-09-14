export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const data = await parseBody(event, routePatchSchema)

  const existing = await requireById(prisma.route, id, 'Маршрут не найден')

  if (data.routeGroupId) await requireById(prisma.routeGroup, data.routeGroupId, 'Группа не найдена')

  assertRouteInput({ ...existing, ...data })

  return withRoutesCheck((tx) => tx.route.update({ where: { id }, data }))
})
