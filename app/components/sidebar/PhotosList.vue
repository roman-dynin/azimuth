<script lang="ts" setup>
defineProps<{
  photos: IAPIPhoto[]
}>()

const emit = defineEmits<{
  open: [photo: IAPIPhoto | null]
}>()
</script>

<template>
  <div class="px-4 pt-4 pb-4">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400">Фото</span>
      <button
        class="cursor-pointer text-xs text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
        @click="emit('open', null)"
      >
        + Создать
      </button>
    </div>
    <div
      v-if="photos.length === 0"
      class="py-1 text-xs text-gray-400 dark:text-gray-600"
    >
      Нет фото
    </div>
    <div
      v-for="photo in photos"
      :key="photo.id"
      class="group flex cursor-pointer items-center justify-between py-1.5 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
      @click="emit('open', photo)"
    >
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-base">📷</span>
        <div class="min-w-0">
          <div class="text-xs text-gray-500">ID: {{ photo.id }}</div>
          <div class="truncate text-sm">{{ photo.title || '—' }}</div>
        </div>
      </div>
      <span class="text-xs text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400">→</span>
    </div>
  </div>
</template>
