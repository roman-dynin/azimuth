<script lang="ts" setup>
defineProps<{
  routes: IAPIRoute[]
}>()

const emit = defineEmits<{
  open: [route: IAPIRoute | null]
  openWaypoints: [route: IAPIRoute]
}>()
</script>

<template>
  <div class="px-4 pt-4 pb-2">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400">Маршруты</span>
      <button
        class="cursor-pointer text-xs text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
        @click="emit('open', null)"
      >
        + Создать
      </button>
    </div>
    <div
      v-if="routes.length === 0"
      class="py-1 text-xs text-gray-400 dark:text-gray-600"
    >
      Нет маршрутов
    </div>
    <div
      v-for="route in routes"
      :key="route.id"
      class="flex items-center justify-between py-1.5 text-gray-700 dark:text-gray-300"
    >
      <div
        class="min-w-0 flex-1 cursor-pointer hover:text-black dark:hover:text-white"
        @click="emit('open', route)"
      >
        <div class="text-xs text-gray-500">
          ID: {{ route.id }}
          <span
            v-if="route.routeGroupId"
            class="ml-1"
            >· Группа #{{ route.routeGroupId }}</span
          >
          <span class="ml-1">· {{ route.guideline ? 'Ходовик' : 'Компас' }}</span>
        </div>
        <div
          class="truncate text-sm"
          :class="{ 'text-gray-500': !route.title }"
        >
          {{ route.title || '—' }}
        </div>
      </div>
      <button
        class="ml-2 shrink-0 cursor-pointer text-xs text-gray-500 hover:text-black dark:hover:text-white"
        @click="emit('openWaypoints', route)"
      >
        Точки →
      </button>
    </div>
  </div>
</template>
