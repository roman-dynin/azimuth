import type { H3Event } from 'h3'

export function parseId(event: H3Event): number {
  const raw = getRouterParam(event, 'id')

  const id = Number(raw)

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: `Некорректный id: ${raw}` })
  }

  return id
}
