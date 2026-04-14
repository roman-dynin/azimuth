const SESSION_KEY = 'auth_code'

const authorized = ref(false)

export function useAuth() {
  function init() {
    authorized.value = !!sessionStorage.getItem(SESSION_KEY)
  }

  async function authorize(code: string) {
    await $fetch('/api/auth', { method: 'POST', body: { code } })

    sessionStorage.setItem(SESSION_KEY, code)

    authorized.value = true
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    authorized.value = false
  }

  function getAuthHeaders(): Record<string, string> {
    const code = sessionStorage.getItem(SESSION_KEY)

    return code ? { 'X-Management-Code': code } : {}
  }

  return { authorized: readonly(authorized), init, authorize, logout, getAuthHeaders }
}
