export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title?: string | null
    description?: string | null
    color?: string | null
    weight?: number | null
  }>(event)

  return prisma.routeGroup.create({ data: body })
})
