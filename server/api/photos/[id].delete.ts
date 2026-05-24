export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.photo.findUniqueOrThrow({ where: { id } })

  await deletePhotoFile(existing.filename)

  return prisma.photo.delete({ where: { id } })
})
