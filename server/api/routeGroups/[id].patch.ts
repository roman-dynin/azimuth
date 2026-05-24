export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const data = await parseBody(event, routeGroupPatchSchema)

  await requireById(prisma.routeGroup, id, 'Группа не найдена')

  return prisma.routeGroup.update({ where: { id }, data })
})
