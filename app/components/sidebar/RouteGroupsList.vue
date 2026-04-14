<script lang="ts" setup>
defineProps<{
  routeGroups: IAPIRouteGroup[]
}>()

const emit = defineEmits<{
  open: [group: IAPIRouteGroup | null]
}>()
</script>

<template>
  <div class="px-4 pt-4 pb-2">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs tracking-wide text-gray-400 uppercase">Группы маршрутов</span>
      <button
        class="cursor-pointer text-xs text-gray-400 hover:text-white"
        @click="emit('open', null)"
      >
        + Создать
      </button>
    </div>
    <div
      v-if="routeGroups.length === 0"
      class="py-1 text-xs text-gray-600"
    >
      Нет групп
    </div>
    <div
      v-for="group in routeGroups"
      :key="group.id"
      class="group flex cursor-pointer items-center justify-between py-1.5 text-gray-300 hover:text-white"
      @click="emit('open', group)"
    >
      <div class="min-w-0">
        <div class="text-xs text-gray-500">ID: {{ group.id }}</div>
        <div
          class="truncate text-sm"
          :class="{ 'text-gray-500': !group.title }"
        >
          {{ group.title || '—' }}
        </div>
      </div>
      <span class="text-xs text-gray-600 group-hover:text-gray-400">→</span>
    </div>
  </div>
</template>
