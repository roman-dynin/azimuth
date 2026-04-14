export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const body = await readBody<{
    title?: string | null
    description?: string | null
    color?: string | null
    weight?: number | null
  }>(event)

  return prisma.routeGroup.update({ where: { id }, data: body })
})
