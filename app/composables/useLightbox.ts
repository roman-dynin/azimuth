const src = ref<string | null>(null)

export function useLightbox() {
  function open(value: string) {
    src.value = value
  }

  function close() {
    src.value = null
  }

  return {
    src: readonly(src),
    open,
    close,
  }
}
