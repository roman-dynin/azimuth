export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const data = await parseBody(event, waypointPatchSchema)

  return prisma.waypoint.update({ where: { id }, data })
})
