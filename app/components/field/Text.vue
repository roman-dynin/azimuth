<script lang="ts" setup>
defineProps<{
  label?: string
  placeholder?: string
}>()

const model = defineModel<string | null>({ default: null })
</script>

<template>
  <div :class="{ 'space-y-1': label }">
    <div
      v-if="label"
      class="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400"
    >
      {{ label }}
    </div>
    <input
      :value="model ?? ''"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
      @input="model = ($event.target as HTMLInputElement).value || null"
    />
  </div>
</template>
