import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

export async function parseBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const raw = await readBody(event)

  const result = schema.safeParse(raw)

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
      .join('; ')

    throw createError({ statusCode: 422, statusMessage: 'Validation Error', message })
  }

  return result.data
}
