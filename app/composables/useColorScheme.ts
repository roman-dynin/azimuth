type Theme = 'light' | 'dark'

const STORAGE_KEY = 'azimuth-theme'

const theme = ref<Theme>('dark')

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

let initialized = false

function initialize() {
  if (initialized) {
    return
  }

  initialized = true

  theme.value = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

  watch(
    theme,
    (value) => {
      document.documentElement.dataset.theme = value
    },
    { immediate: true },
  )

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (readStored() !== null) {
      return
    }

    theme.value = event.matches ? 'dark' : 'light'
  })
}

export function useColorScheme() {
  initialize()

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'

    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // localStorage unavailable (Safari private mode etc.)
    }
  }

  return {
    theme: readonly(theme),
    isDark: computed(() => theme.value === 'dark'),
    toggle,
  }
}
