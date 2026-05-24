export default defineEventHandler(async (event) => {
  const items = await parseBody(event, waypointsReorderSchema)

  await Promise.all(items.map(({ id, order }) => prisma.waypoint.update({ where: { id }, data: { order } })))
})
