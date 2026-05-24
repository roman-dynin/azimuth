<script lang="ts" setup>
const { src, close } = useLightbox()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(src, (value) => {
  if (import.meta.client) {
    document.body.style.overflow = value ? 'hidden' : ''
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)

  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="src"
      class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <img
        :src="src"
        class="max-h-full max-w-full object-contain select-none"
        alt=""
      />

      <button
        type="button"
        aria-label="Закрыть"
        class="absolute top-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
        @click="close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  </Teleport>
</template>
