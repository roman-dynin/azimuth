<script lang="ts" setup>
defineProps<{
  saving?: boolean
  removing?: boolean
  error?: string
  onSave: () => void
  onCancel: () => void
  onRemove?: () => void
}>()
</script>

<template>
  <div class="shrink-0 border-t border-gray-200 px-4 pt-3 dark:border-gray-700">
    <div
      v-if="error"
      class="mb-2 text-xs text-red-700 dark:text-red-400"
    >
      {{ error }}
    </div>
    <div class="flex items-center justify-between pb-3">
      <div class="flex gap-2">
        <button
          :disabled="saving || removing"
          class="cursor-pointer rounded bg-gray-900 px-4 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          @click="onSave"
        >
          {{ saving ? 'Сохраняю ...' : 'Сохранить' }}
        </button>
        <button
          :disabled="saving || removing"
          class="cursor-pointer px-4 py-1.5 text-sm text-gray-600 hover:text-black disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
          @click="onCancel"
        >
          Отмена
        </button>
      </div>
      <button
        v-if="onRemove"
        :disabled="saving || removing"
        class="cursor-pointer text-sm text-red-700 hover:text-red-600 disabled:opacity-50 dark:text-red-500 dark:hover:text-red-400"
        @click="onRemove"
      >
        {{ removing ? 'Удаляю ...' : 'Удалить' }}
      </button>
    </div>
  </div>
</template>
