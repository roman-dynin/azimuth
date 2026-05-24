export default defineEventHandler(async (event) => {
  const data = await parseBody(event, waypointCreateSchema)

  return prisma.waypoint.create({ data })
})
