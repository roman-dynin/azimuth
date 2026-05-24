export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const data = await parseBody(event, spotPatchSchema)

  await requireById(prisma.spot, id, 'Спот не найден')

  return prisma.spot.update({ where: { id }, data })
})
