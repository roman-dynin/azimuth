export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  return prisma.waypoint.delete({ where: { id } })
})
