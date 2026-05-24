export default defineEventHandler(async (event) => {
  const data = await parseBody(event, spotCreateSchema)

  return prisma.spot.create({ data })
})
