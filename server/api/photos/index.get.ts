export default defineEventHandler(async () => prisma.photo.findMany({ orderBy: { id: 'asc' } }))
