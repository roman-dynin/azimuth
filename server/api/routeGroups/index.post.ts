export default defineEventHandler(async (event) => {
  const data = await parseBody(event, routeGroupCreateSchema)

  return prisma.routeGroup.create({ data })
})
