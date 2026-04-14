export function useEntityForm(
  endpoint: string,
  entityId: number | null,
  buildBody: () => Record<string, any>,
  onSuccess: () => void,
) {
  const saving = ref(false)

  const removing = ref(false)

  const error = ref('')

  async function save() {
    saving.value = true

    try {
      const body = buildBody()

      if (entityId !== null) {
        await $fetch(`${endpoint}/${entityId}`, { method: 'PATCH', body })
      } else {
        await $fetch(endpoint, { method: 'POST', body })
      }

      onSuccess()
    } catch (error: any) {
      error.value = error?.data?.message || error?.message || 'Всё пошло по пизде'
    } finally {
      saving.value = false
    }
  }

  async function remove() {
    if (entityId === null) return

    removing.value = true

    try {
      await $fetch(`${endpoint}/${entityId}`, { method: 'DELETE' })

      onSuccess()
    } catch (error: any) {
      error.value = error?.data?.message || error?.message || 'Всё пошло по пизде'
    } finally {
      removing.value = false
    }
  }

  return { saving, removing, error, save, remove }
}
