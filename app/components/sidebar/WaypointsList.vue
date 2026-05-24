<script lang="ts" setup>
const props = defineProps<{
  route: IAPIRoute
}>()

const emit = defineEmits<{
  refresh: []
  editWaypoint: [waypoint: IAPIWaypoint]
}>()

const { getAuthHeaders } = useAuth()

const waypointsCopy = ref([...props.route.waypoints])

watch(
  () => props.route.waypoints,
  (waypoints) => (waypointsCopy.value = [...waypoints]),
)

const dragIndex = ref(-1)

const dragOverIndex = ref(-1)

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index

  event.dataTransfer!.effectAllowed = 'move'
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()

  event.dataTransfer!.dropEffect = 'move'

  dragOverIndex.value = index
}

function onDragLeave() {
  dragOverIndex.value = -1
}

async function onDrop(targetIndex: number, event: DragEvent) {
  event.preventDefault()

  dragOverIndex.value = -1

  const from = dragIndex.value

  dragIndex.value = -1

  if (from === targetIndex || from === -1) return

  const waypoints = [...waypointsCopy.value]

  const moved = waypoints.splice(from, 1)[0]!

  waypoints.splice(targetIndex, 0, moved)

  waypointsCopy.value = waypoints

  await $fetch('/api/waypoints/reorder', {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: waypoints.map((waypoint, index) => ({
      id: waypoint.id,
      order: index + 1,
    })),
  })

  emit('refresh')
}

const form = reactive({
  targetWaypointId: null as number | null,
  azimuth: null as number | null,
  distance: null as number | null,
  seconds: null as number | null,
})

const { saving, error, save } = useEntityForm(
  '/api/waypoints',
  null,
  () => ({
    routeId: props.route.id,
    order: waypointsCopy.value.length + 1,
    ...(form.targetWaypointId
      ? { targetWaypointId: form.targetWaypointId }
      : { azimuth: form.azimuth, distance: form.distance, seconds: form.seconds }),
  }),
  () => {
    form.targetWaypointId = null

    form.azimuth = null

    form.distance = null

    form.seconds = null

    emit('refresh')
  },
)
</script>

<template>
  <SidebarHeader
    :title="`Маршрут #${route.id}`"
    :subtitle="route.title || undefined"
  />

  <div class="flex-1 overflow-y-auto">
    <ul>
      <li
        v-for="(waypoint, index) in waypointsCopy"
        :key="waypoint.id"
        class="flex cursor-pointer items-center gap-2 border-b border-gray-800 px-3 py-2 select-none hover:bg-gray-800"
        :class="{
          'border-t-2 border-t-blue-500': dragOverIndex === index && dragIndex !== index,
        }"
        draggable="true"
        @click="emit('editWaypoint', waypoint)"
        @dragstart="onDragStart(index, $event)"
        @dragover="onDragOver(index, $event)"
        @dragleave="onDragLeave"
        @drop="onDrop(index, $event)"
      >
        <span class="shrink-0 cursor-grab text-lg leading-none text-gray-600 active:cursor-grabbing">⠿</span>
        <div class="min-w-0 flex-1">
          <div class="text-xs text-gray-500">ID: {{ waypoint.id }}</div>
          <div class="truncate text-sm text-gray-200">
            <span v-if="waypoint.targetWaypointId">→ #{{ waypoint.targetWaypointId }}</span>
            <span v-else-if="waypoint.azimuth !== null">
              {{ waypoint.azimuth }}°
              <span v-if="waypoint.distance !== null"> · {{ Math.round(waypoint.distance) }} м</span>
              <span v-if="waypoint.seconds !== null"> · {{ Math.round(waypoint.seconds / 60) }} мин.</span>
            </span>
            <span v-else>—</span>
          </div>
          <div
            v-if="waypoint.title"
            class="truncate text-xs text-gray-400"
          >
            {{ waypoint.title }}
          </div>
        </div>
      </li>
    </ul>
  </div>

  <div class="shrink-0 space-y-2 border-t border-gray-700 px-4 py-3">
    <div class="text-xs tracking-wide text-gray-400 uppercase">Новая точка</div>

    <FieldNumber
      v-model.number="form.targetWaypointId"
      label="Целевая точка (Waypoint ID)"
      placeholder="ID точки"
    />

    <template v-if="!form.targetWaypointId">
      <FieldNumber
        v-model.number="form.azimuth"
        label="Азимут (°)"
        :min="0"
        :max="359"
      />

      <div class="flex gap-2">
        <FieldNumber
          v-model.number="form.distance"
          label="Дистанция (м.)"
          :min="0"
          :step="1"
        />

        <FieldNumber
          v-model.number="form.seconds"
          label="Время (сек.)"
          :min="0"
        />
      </div>
    </template>

    <div
      v-if="error"
      class="text-xs text-red-400"
    >
      {{ error }}
    </div>

    <button
      :disabled="saving"
      class="w-full cursor-pointer rounded bg-white py-1.5 text-sm text-black disabled:opacity-50"
      @click="save"
    >
      {{ saving ? 'Добавление...' : '+ Добавить' }}
    </button>
  </div>
</template>
