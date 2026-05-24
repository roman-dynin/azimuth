export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const existing = await requireById(prisma.photo, id, 'Фото не найдено')

  await deletePhotoFile(existing.filename)

  return prisma.photo.delete({ where: { id } })
})
