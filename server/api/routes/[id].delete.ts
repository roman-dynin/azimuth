export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  await prisma.$transaction([
    prisma.waypoint.deleteMany({ where: { routeId: id } }),
    prisma.route.delete({ where: { id } }),
  ])
})
