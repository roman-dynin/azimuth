<script lang="ts" setup>
import type { LatLng, LatLngTuple } from 'leaflet'

const props = defineProps<{
  spot: IAPISpot | null
  mapClickLatLng?: LatLng
}>()

const emit = defineEmits<{
  refresh: []
  togglePicking: [value: boolean]
}>()

const { back } = useSidebar()

const form = reactive({
  title: props.spot?.title ?? null,
  description: props.spot?.description ?? null,
  emoji: props.spot?.emoji ?? '',
  lat: props.spot?.lat ?? null,
  lng: props.spot?.lng ?? null,
})

function setLatLng(lat: number, lng: number): void {
  form.lat = lat

  form.lng = lng
}

const { show, hide, onDrag } = useCoordinatesPreview()

watch(
  () => [form.lat, form.lng] as LatLngTuple,
  ([lat, lng]) => show(lat, lng),
  { immediate: true },
)

onUnmounted(hide)

onDrag(setLatLng)

const { picking, toggle } = useCoordinatesPicking(
  () => props.mapClickLatLng,
  setLatLng,
  (value) => emit('togglePicking', value),
)

const { saving, removing, error, save, remove } = useEntityForm(
  '/api/spots',
  props.spot?.id ?? null,
  () => ({ ...form }),
  () => {
    emit('refresh')

    back()
  },
)
</script>

<template>
  <SidebarHeader :title="spot ? `Спот #${spot.id}` : 'Новый спот'" />

  <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
    <FieldText
      v-model.trim="form.emoji"
      label="Emoji"
      placeholder="🐙"
    />

    <FieldText
      v-model.trim="form.title"
      label="Название"
    />

    <FieldTextarea
      v-model.trim="form.description"
      label="Описание"
    />

    <FieldCoordinatesPicker
      :lat="form.lat"
      :lng="form.lng"
      :picking="picking"
      @update:lat="form.lat = $event"
      @update:lng="form.lng = $event"
      @toggle-picking="toggle"
    />
  </div>

  <FormFooter
    :saving="saving"
    :removing="removing"
    :error="error"
    :on-remove="spot ? remove : undefined"
    :on-save="save"
    :on-cancel="back"
  />
</template>
