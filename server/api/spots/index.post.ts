export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title?: string | null
    description?: string | null
    emoji: string
    lat: number
    lng: number
  }>(event)

  return prisma.spot.create({ data: body })
})
