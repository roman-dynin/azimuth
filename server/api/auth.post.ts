export default defineEventHandler(async (event) => {
  const { code } = await parseBody(event, authSchema)

  const { authCode } = useRuntimeConfig()

  if (!authCode || code !== authCode) {
    throw createError({ statusCode: 401, message: 'Неверный код' })
  }

  return { ok: true }
})
