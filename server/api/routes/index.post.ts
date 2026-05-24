export default defineEventHandler(async (event) => {
  const data = await parseBody(event, routeCreateSchema)

  return prisma.route.create({ data })
})
