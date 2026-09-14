export default defineEventHandler(async (event) => {
  const items = await parseBody(event, waypointsReorderSchema)

  // updateMany: id могли удалить с другого устройства
  await withRoutesCheck(async (tx) => {
    for (const { id, order } of items) {
      await tx.waypoint.updateMany({ where: { id }, data: { order } })
    }
  })
})
