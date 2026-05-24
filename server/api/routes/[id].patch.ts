export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const data = await parseBody(event, routePatchSchema)

  await requireById(prisma.route, id, 'Маршрут не найден')

  return prisma.route.update({ where: { id }, data })
})
