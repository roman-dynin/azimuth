export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const routes = await prisma.route.findMany({
    where: { routeGroupId: id },
    select: { id: true },
  })

  const routeIds = routes.map((route) => route.id)

  await prisma.$transaction([
    prisma.waypoint.deleteMany({ where: { routeId: { in: routeIds } } }),
    prisma.route.deleteMany({ where: { routeGroupId: id } }),
    prisma.routeGroup.delete({ where: { id } }),
  ])
})
