import type { H3Event } from 'h3'

import type { Buffer } from 'node:buffer'
import type { ZodType } from 'zod'

export interface UploadedFile {
  data: Buffer
  type: string
  filename: string
}

export async function parseMultipartBody<T>(
  event: H3Event,
  schema: ZodType<T>,
): Promise<{ fields: T; file?: UploadedFile }> {
  const form = await readMultipartFormData(event)

  if (!form) {
    throw createError({ statusCode: 422, message: 'Ожидается multipart/form-data' })
  }

  const fields: Record<string, string> = {}

  let file: UploadedFile | undefined

  for (const part of form) {
    if (!part.name) continue

    if (part.filename) {
      file = { data: part.data, type: part.type ?? 'application/octet-stream', filename: part.filename }
    } else {
      fields[part.name] = part.data.toString('utf8')
    }
  }

  const result = schema.safeParse(fields)

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
      .join('; ')

    throw createError({ statusCode: 422, statusMessage: 'Validation Error', message })
  }

  return { fields: result.data, file }
}
