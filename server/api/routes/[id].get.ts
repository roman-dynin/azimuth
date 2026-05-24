export default defineEventHandler(async (event) => {
  const id = parseId(event)

  return requireById(prisma.route, id, 'Маршрут не найден')
})
