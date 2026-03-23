export default defineEventHandler(() => {
  return prisma.waypoint.findMany()
})
