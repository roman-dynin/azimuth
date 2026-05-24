export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const data = await parseBody(event, waypointPatchSchema)

  await requireById(prisma.waypoint, id, 'Точка не найдена')

  return prisma.waypoint.update({ where: { id }, data })
})
