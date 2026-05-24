const online = ref(true)

let initialized = false

export function useOnline() {
  if (import.meta.client && !initialized) {
    online.value = navigator.onLine

    window.addEventListener('online', () => (online.value = true))

    window.addEventListener('offline', () => (online.value = false))

    initialized = true
  }

  return { online: readonly(online) }
}
