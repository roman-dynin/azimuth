export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const body = await readBody<{
    routeGroupId?: number | null
    guideline?: boolean
    title?: string | null
    description?: string | null
    color?: string | null
    weight?: number | null
    anchorWaypointId?: number | null
    anchorLat?: number | null
    anchorLng?: number | null
  }>(event)

  return prisma.route.update({ where: { id }, data: body })
})
