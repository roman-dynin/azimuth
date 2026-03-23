export default defineEventHandler(async () => {
  return prisma.routeGroup.findMany({
    orderBy: {
      id: 'asc',
    },
  })
})
