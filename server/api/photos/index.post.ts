export default defineEventHandler(async (event) => {
  const { fields, file } = await parseMultipartBody(event, photoCreateSchema)

  if (!file) {
    throw createError({ statusCode: 422, message: 'Файл обязателен' })
  }

  const filename = await saveCompressedImage(file.data)

  return prisma.photo.create({ data: { ...fields, filename } })
})
