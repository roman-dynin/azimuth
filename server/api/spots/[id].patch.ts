export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const data = await parseBody(event, spotPatchSchema)

  return prisma.spot.update({ where: { id }, data })
})
