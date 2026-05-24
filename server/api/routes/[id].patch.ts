export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const data = await parseBody(event, routePatchSchema)

  return prisma.route.update({ where: { id }, data })
})
