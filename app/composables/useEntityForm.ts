export function useEntityForm(
  endpoint: string,
  entityId: number | null,
  buildBody: () => Record<string, unknown> | FormData,
  onSuccess: () => void,
) {
  const { getAuthHeaders } = useAuth()

  const saving = ref(false)

  const removing = ref(false)

  const error = ref('')

  async function save() {
    error.value = ''

    saving.value = true

    try {
      const body = buildBody()

      if (entityId !== null) {
        await $fetch(`${endpoint}/${entityId}`, { method: 'PATCH', body, headers: getAuthHeaders() })
      } else {
        await $fetch(endpoint, { method: 'POST', body, headers: getAuthHeaders() })
      }

      onSuccess()
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Не удалось выполнить операцию'
    } finally {
      saving.value = false
    }
  }

  async function remove() {
    if (entityId === null) return

    error.value = ''

    removing.value = true

    try {
      await $fetch(`${endpoint}/${entityId}`, { method: 'DELETE', headers: getAuthHeaders() })

      onSuccess()
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Не удалось выполнить операцию'
    } finally {
      removing.value = false
    }
  }

  return { saving, removing, error, save, remove }
}
