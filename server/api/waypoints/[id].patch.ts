export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const body = await readBody<{
    title?: string | null
    description?: string | null
    color?: string | null
    poi?: boolean
    targetWaypointId?: number | null
    azimuth?: number | null
    distance?: number | null
    seconds?: number | null
    depth?: number | null
    order?: number | null
  }>(event)

  return prisma.waypoint.update({
    where: { id },
    data: body,
  })
})
