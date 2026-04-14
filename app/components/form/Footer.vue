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
  <div class="shrink-0 border-t border-gray-700 px-4 pt-3">
    <div
      v-if="error"
      class="mb-2 text-xs text-red-400"
    >
      {{ error }}
    </div>
    <div class="flex items-center justify-between pb-3">
      <div class="flex gap-2">
        <button
          :disabled="saving || removing"
          class="cursor-pointer rounded bg-white px-4 py-1.5 text-sm text-black disabled:opacity-50"
          @click="onSave"
        >
          {{ saving ? 'Сохраняю ...' : 'Сохранить' }}
        </button>
        <button
          :disabled="saving || removing"
          class="cursor-pointer px-4 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-50"
          @click="onCancel"
        >
          Отмена
        </button>
      </div>
      <button
        v-if="onRemove"
        :disabled="saving || removing"
        class="cursor-pointer text-sm text-red-500 hover:text-red-400 disabled:opacity-50"
        @click="onRemove"
      >
        {{ removing ? 'Удаляю ...' : 'Удалить' }}
      </button>
    </div>
  </div>
</template>
