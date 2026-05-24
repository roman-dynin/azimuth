export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const data = await parseBody(event, routeGroupPatchSchema)

  return prisma.routeGroup.update({ where: { id }, data })
})
