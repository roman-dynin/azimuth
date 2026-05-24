(() => {
  try {
    const stored = localStorage.getItem('azimuth-theme')

    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored

      return
    }

    document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    document.documentElement.dataset.theme = 'dark'
  }
})()
