const STORAGE_KEY = 'azimuth-speed'

function readStored(): number | null {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY))

    return stored > 0 ? stored : null
  } catch {
    return null
  }
}

// Скорость дайвера в м/с. Пользовательская, живёт в localStorage; по умолчанию — константа.
const speed = ref(readStored() ?? DIVER_SPEED_MULTIPLIER)

watch(speed, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // localStorage unavailable (Safari private mode etc.)
  }
})

export function useSettings() {
  return { speed }
}
