import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

export async function parseBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const raw = await readBody(event)

  const result = schema.safeParse(raw)

  if (!result.success) {
    throw createError({ statusCode: 422, statusMessage: 'Validation Error', message: formatZodError(result.error) })
  }

  return result.data
}
