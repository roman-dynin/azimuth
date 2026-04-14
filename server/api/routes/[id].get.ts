export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const route = await prisma.route.findUnique({ where: { id } })

  if (!route) {
    throw createError({ statusCode: 404, message: 'Маршрут не найден' })
  }

  return route
})
