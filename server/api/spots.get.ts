export default defineEventHandler(async () => {
  return prisma.spot.findMany({
    orderBy: {
      id: 'asc',
    },
  })
})
