<script lang="ts" setup>
import type { LatLngLiteral, LatLngTuple } from 'leaflet'

import type { Route } from '~~/prisma/generated/client'

const props = defineProps<{
  route: IAPIRoute | null
  routeGroups: IAPIRouteGroup[]
  mapClickLatLng?: LatLngLiteral
}>()

const emit = defineEmits<{
  refresh: []
  togglePicking: [value: boolean]
}>()

const { back } = useSidebar()

const loading = ref(false)

const form = reactive({
  title: null as string | null,
  description: null as string | null,
  color: null as string | null,
  weight: null as number | null,
  guideline: false,
  routeGroupId: null as number | null,
  anchorWaypointId: null as number | null,
  anchorLat: null as number | null,
  anchorLng: null as number | null,
})

function setAnchorLatLng(lat: number, lng: number): void {
  form.anchorLat = lat

  form.anchorLng = lng
}

if (props.route) {
  loading.value = true

  const rawRoute = await $fetch<Route>(`/api/routes/${props.route.id}`)

  Object.assign(form, rawRoute)

  loading.value = false
}

const { show, hide, onDrag } = useCoordinatesPreview()

watch(
  () => [form.anchorLat, form.anchorLng] as LatLngTuple,
  ([lat, lng]) => show(lat, lng),
  { immediate: true },
)

onUnmounted(hide)

onDrag(setAnchorLatLng)

const { picking, toggle } = useCoordinatesPicking(
  () => props.mapClickLatLng,
  setAnchorLatLng,
  (value) => emit('togglePicking', value),
)

const hasAnchor = computed(() => !!form.anchorWaypointId || (form.anchorLat !== null && form.anchorLng !== null))

const { saving, removing, error, save, remove } = useEntityForm(
  '/api/routes',
  props.route?.id ?? null,
  () => ({
    ...form,
    anchorLat: form.anchorWaypointId ? null : form.anchorLat,
    anchorLng: form.anchorWaypointId ? null : form.anchorLng,
  }),
  () => {
    emit('refresh')

    back()
  },
)

function onSave() {
  if (!props.route && !hasAnchor.value) return

  save()
}
</script>

<template>
  <SidebarHeader :title="route ? `Маршрут #${route.id}` : 'Новый маршрут'" />

  <div
    v-if="loading"
    class="flex flex-1 items-center justify-center"
  >
    <span class="text-sm text-gray-500">Загружаю ...</span>
  </div>

  <template v-else>
    <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <FieldText
        v-model.trim="form.title"
        label="Название"
      />

      <FieldTextarea
        v-model.trim="form.description"
        label="Описание"
      />

      <FieldColorPicker v-model="form.color" />

      <FieldNumber
        v-model.number="form.weight"
        label="Толщина линии"
        :min="1"
      />

      <label class="flex cursor-pointer items-center gap-2 select-none">
        <input
          v-model="form.guideline"
          type="checkbox"
          class="accent-white"
        />
        <span class="text-sm">Ходовик</span>
      </label>

      <div class="space-y-1">
        <div class="text-xs tracking-wide text-gray-400 uppercase">Группа</div>
        <select
          v-model.number="form.routeGroupId"
          class="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option :value="null">Без группы</option>
          <option
            v-for="group in routeGroups"
            :key="group.id"
            :value="group.id"
          >
            #{{ group.id }} {{ group.title || '' }}
          </option>
        </select>
      </div>

      <FieldNumber
        v-model.number="form.anchorWaypointId"
        label="Якорь (Waypoint ID)"
        placeholder="ID точки другого маршрута"
      />

      <FieldCoordinatesPicker
        v-if="!form.anchorWaypointId"
        label="Якорь (Координаты)"
        :lat="form.anchorLat"
        :lng="form.anchorLng"
        :picking="picking"
        @update:lat="form.anchorLat = $event"
        @update:lng="form.anchorLng = $event"
        @toggle-picking="toggle"
      />

      <div
        v-if="!route && !hasAnchor"
        class="text-xs text-red-400"
      >
        Укажи Waypoint ID или координаты якоря
      </div>
    </div>

    <FormFooter
      :saving="saving"
      :removing="removing"
      :error="error"
      :on-remove="route ? remove : undefined"
      :on-save="onSave"
      :on-cancel="back"
    />
  </template>
</template>
