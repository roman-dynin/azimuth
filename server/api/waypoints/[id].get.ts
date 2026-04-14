export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const waypoint = await prisma.waypoint.findUnique({ where: { id } })

  if (!waypoint) {
    throw createError({ statusCode: 404, message: 'Точка не найдена' })
  }

  return waypoint
})
