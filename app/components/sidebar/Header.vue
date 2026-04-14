<script lang="ts" setup>
defineProps<{
  title: string
  subtitle?: string
}>()

const { view, back, close } = useSidebar()
</script>

<template>
  <div class="flex shrink-0 items-center justify-between border-b border-gray-700 px-4 py-3">
    <div class="flex min-w-0 items-center gap-2">
      <button
        v-if="view !== 'home'"
        class="shrink-0 cursor-pointer text-sm text-gray-400 hover:text-white"
        @click="back"
      >
        ←
      </button>
      <div class="min-w-0">
        <div class="text-sm font-medium">
          {{ title }}
        </div>
        <div
          v-if="subtitle"
          class="truncate text-xs text-gray-400"
        >
          {{ subtitle }}
        </div>
      </div>
    </div>
    <button
      class="ml-2 shrink-0 cursor-pointer text-lg leading-none text-gray-400 hover:text-white"
      @click="close"
    >
      ✕
    </button>
  </div>
</template>
