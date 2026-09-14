<script lang="ts" setup>
import type { Waypoint } from '~~/prisma/generated/client'

const props = defineProps<{
  waypoint: IAPIWaypoint
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { back } = useSidebar()

// Список отдаёт вычисленные azimuth / seconds / distance, форме нужны введённые
const loadError = ref('')

const form = reactive({
  title: null as string | null,
  description: null as string | null,
  poi: false,
  color: null as string | null,
  emoji: null as string | null,
  targetWaypointId: null as number | null,
  azimuth: null as number | null,
  distance: null as number | null,
  seconds: null as number | null,
  depth: null as number | null,
  order: null as number | null,
})

try {
  const { id: _id, routeId: _routeId, ...editable } = await $fetch<Waypoint>(`/api/waypoints/${props.waypoint.id}`)

  Object.assign(form, editable)
} catch (err: any) {
  loadError.value = err?.data?.message || err?.message || 'Не удалось загрузить точку'
}

const { saving, removing, error, save, remove } = useEntityForm(
  '/api/waypoints',
  props.waypoint.id,
  () =>
    form.targetWaypointId
      ? { ...form, azimuth: null, distance: null, seconds: null }
      : { ...form, targetWaypointId: null },
  () => {
    emit('refresh')

    back()
  },
)
</script>

<template>
  <SidebarHeader :title="`Точка #${waypoint.id}`" />

  <div
    v-if="loadError"
    class="flex-1 px-4 py-4 text-sm text-red-700 dark:text-red-400"
  >
    {{ loadError }}
  </div>

  <template v-else>
    <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <label class="flex cursor-pointer items-center gap-2 select-none">
        <input
          v-model="form.poi"
          type="checkbox"
          class="accent-black dark:accent-white"
        />
        <span class="text-sm">Точка интереса</span>
      </label>

      <FieldText
        v-model.trim="form.title"
        label="Название"
      />

      <FieldTextarea
        v-model.trim="form.description"
        label="Описание"
      />

      <FieldColorPicker v-model="form.color" />

      <FieldText
        v-model.trim="form.emoji"
        label="Emoji"
        placeholder="🐙"
      />

      <FieldNumber
        v-model.number="form.targetWaypointId"
        label="Целевая точка (Waypoint ID)"
        placeholder="ID точки"
      />

      <template v-if="!form.targetWaypointId">
        <FieldNumber
          v-model="form.azimuth"
          label="Азимут (°)"
          :min="0"
          :max="359"
        />

        <FieldNumber
          v-model="form.distance"
          label="Дистанция (м.)"
          :min="0"
          :step="1"
        />

        <FieldNumber
          v-model="form.seconds"
          label="Время (сек.)"
          :min="0"
        />
      </template>

      <FieldNumber
        v-model="form.depth"
        label="Глубина (м.)"
        :min="0"
        :step="1"
      />

      <FieldNumber
        v-model="form.order"
        label="Порядок"
        :step="0.1"
      />
    </div>

    <FormFooter
      :saving="saving"
      :removing="removing"
      :error="error"
      :on-remove="remove"
      :on-save="save"
      :on-cancel="back"
    />
  </template>
</template>
