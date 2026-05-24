export default defineEventHandler(async (event) => {
  const id = parseId(event)

  await requireById(prisma.spot, id, 'Спот не найден')

  return prisma.spot.delete({ where: { id } })
})
