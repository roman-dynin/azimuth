export default defineEventHandler(async (event) => {
  const body = await readBody<Array<{ id: number; order: number }>>(event)

  await Promise.all(body.map(({ id, order }) => prisma.waypoint.update({ where: { id }, data: { order } })))
})
