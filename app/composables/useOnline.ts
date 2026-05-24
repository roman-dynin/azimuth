const online = ref(true)

let initialized = false

async function ping() {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' })

    online.value = res.ok
  } catch {
    online.value = false
  }
}

export function useOnline() {
  if (import.meta.client && !initialized) {
    online.value = navigator.onLine

    window.addEventListener('online', ping)

    window.addEventListener('offline', () => (online.value = false))

    ping()

    setInterval(ping, 15000)

    initialized = true
  }

  return { online: readonly(online) }
}
