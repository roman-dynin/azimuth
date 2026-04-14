export default defineEventHandler(async () => prisma.routeGroup.findMany({ orderBy: { id: 'asc' } }))
