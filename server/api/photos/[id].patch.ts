export default defineEventHandler(async (event) => {
  const id = parseId(event)

  const { fields, file } = await parseMultipartBody(event, photoPatchSchema)

  const existing = await requireById(prisma.photo, id, 'Фото не найдено')

  const data: Record<string, unknown> = { ...fields }

  if (file) {
    data.filename = await saveCompressedImage(file.data)

    await deletePhotoFile(existing.filename)
  }

  return prisma.photo.update({ where: { id }, data })
})
