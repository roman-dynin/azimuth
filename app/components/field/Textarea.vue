<script lang="ts" setup>
const {
  label,
  rows = 4,
  placeholder,
} = defineProps<{
  label?: string
  rows?: number
  placeholder?: string
}>()

const model = defineModel<string | null>({ default: null })
</script>

<template>
  <div :class="{ 'space-y-1': label }">
    <div
      v-if="label"
      class="text-xs tracking-wide text-gray-400 uppercase"
    >
      {{ label }}
    </div>
    <textarea
      :value="model ?? ''"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full resize-none rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
      @input="model = ($event.target as HTMLInputElement).value || null"
    />
  </div>
</template>
