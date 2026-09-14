const STORAGE_KEY = 'azimuth-speed'

function readStored(): number | null {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY))

    return stored > 0 ? stored : null
  } catch {
    return null
  }
}

const speed = ref(readStored() ?? DIVER_SPEED_MULTIPLIER)

watch(speed, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // Safari private mode кидает на setItem
  }
})

export function useSettings() {
  return { speed }
}
