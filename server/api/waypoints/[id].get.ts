export default defineEventHandler(async (event) => {
  const id = parseId(event)

  return requireById(prisma.waypoint, id, 'Точка не найдена')
})
