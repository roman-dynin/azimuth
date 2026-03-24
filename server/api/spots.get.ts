export default defineEventHandler(async () => prisma.spot.findMany({ orderBy: { id: 'asc' } }))
