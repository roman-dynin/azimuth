<script lang="ts" setup>
const model = defineModel<string | null>({ default: null })
</script>

<template>
  <div class="space-y-1">
    <div class="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400">Цвет</div>
    <input
      :value="model"
      type="color"
      class="h-8 w-full cursor-pointer rounded border-0 bg-transparent p-0"
      @input="model = ($event.target as HTMLInputElement).value"
    />
  </div>
</template>
