export default defineEventHandler(async (event) => {
  const data = await parseBody(event, routeCreateSchema)

  if (data.routeGroupId) await requireById(prisma.routeGroup, data.routeGroupId, 'Группа не найдена')

  assertRouteInput(data)

  return withRoutesCheck((tx) => tx.route.create({ data }))
})
