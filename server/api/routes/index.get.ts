import { z } from 'zod'

const querySchema = z.object({ speed: z.coerce.number().positive().max(10).optional() })

export default defineEventHandler(async (event) => {
  const { speed } = await getValidatedQuery(event, querySchema.parse)

  return loadRoutes(prisma, speed)
})
