export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const data = await parseBody(event, waypointPatchSchema)

  const existing = await requireById(prisma.waypoint, id, 'Точка не найдена')

  assertWaypointInput({ ...existing, ...data })

  return withRoutesCheck((tx) => tx.waypoint.update({ where: { id }, data }))
})
