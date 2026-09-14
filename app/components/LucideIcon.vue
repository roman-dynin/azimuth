<script lang="ts" setup>
import type { IconNode } from 'lucide'

// Рендер lucide-иконки без lucide-vue-next: IconNode — это просто [tag, attrs][]
withDefaults(defineProps<{ icon: IconNode; size?: number }>(), { size: 18 })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <component
      :is="tag"
      v-for="([tag, attrs], index) in icon"
      :key="index"
      v-bind="attrs"
    />
  </svg>
</template>
