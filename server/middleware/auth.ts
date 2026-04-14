export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/') || path === '/api/auth' || event.method === 'GET') {
    return
  }

  const { authCode } = useRuntimeConfig()

  const code = getHeader(event, 'X-Management-Code')

  if (!authCode || code !== authCode) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }
})
