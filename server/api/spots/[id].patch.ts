export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const body = await readBody<{
    title?: string | null
    description?: string | null
    emoji?: string
    lat?: number
    lng?: number
  }>(event)

  return prisma.spot.update({ where: { id }, data: body })
})
