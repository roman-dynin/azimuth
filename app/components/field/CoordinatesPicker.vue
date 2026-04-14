<script lang="ts" setup>
defineProps<{
  label?: string
  lat: number | null
  lng: number | null
  picking: boolean
}>()

const emit = defineEmits<{
  'update:lat': [value: number | null]
  'update:lng': [value: number | null]
  togglePicking: []
}>()
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between">
      <div class="text-xs tracking-wide text-gray-400 uppercase">
        {{ label ?? 'Координаты' }}
      </div>
      <button
        :class="
          picking
            ? 'animate-pulse text-blue-400'
            : 'text-gray-400 hover:text-white'
        "
        class="cursor-pointer text-xs"
        @click="emit('togglePicking')"
      >
        {{ picking ? 'Кликни на карте ...' : 'Выбрать на карте' }}
      </button>
    </div>
    <div class="flex gap-2">
      <FieldNumber
        :model-value="lat"
        placeholder="Широта"
        @update:model-value="emit('update:lat', $event)"
      />
      <FieldNumber
        :model-value="lng"
        placeholder="Долгота"
        @update:model-value="emit('update:lng', $event)"
      />
    </div>
  </div>
</template>
