<script lang="ts" setup>
defineProps<{
  spots: IAPISpot[]
}>()

const emit = defineEmits<{
  open: [spot: IAPISpot | null]
}>()
</script>

<template>
  <div class="px-4 pt-4 pb-4">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs tracking-wide text-gray-400 uppercase">Споты</span>
      <button
        class="cursor-pointer text-xs text-gray-400 hover:text-white"
        @click="emit('open', null)"
      >
        + Создать
      </button>
    </div>
    <div
      v-if="spots.length === 0"
      class="py-1 text-xs text-gray-600"
    >
      Нет спотов
    </div>
    <div
      v-for="spot in spots"
      :key="spot.id"
      class="group flex cursor-pointer items-center justify-between py-1.5 text-gray-300 hover:text-white"
      @click="emit('open', spot)"
    >
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-base">{{ spot.emoji }}</span>
        <div class="min-w-0">
          <div class="text-xs text-gray-500">ID: {{ spot.id }}</div>
          <div class="truncate text-sm">{{ spot.title || '—' }}</div>
        </div>
      </div>
      <span class="text-xs text-gray-600 group-hover:text-gray-400">→</span>
    </div>
  </div>
</template>
