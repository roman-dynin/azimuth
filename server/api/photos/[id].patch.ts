export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const { fields, file } = await parseMultipartBody(event, photoPatchSchema)

  const data: Record<string, unknown> = { ...fields }

  if (file) {
    const existing = await prisma.photo.findUniqueOrThrow({ where: { id } })

    data.filename = await saveCompressedImage(file.data)

    await deletePhotoFile(existing.filename)
  }

  return prisma.photo.update({ where: { id }, data })
})
