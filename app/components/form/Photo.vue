<script lang="ts" setup>
import type { LatLngLiteral, LatLngTuple } from 'leaflet'

const props = defineProps<{
  photo: IAPIPhoto | null
  mapClickLatLng?: LatLngLiteral
}>()

const emit = defineEmits<{
  refresh: []
  togglePicking: [value: boolean]
}>()

const { back } = useSidebar()

const { open: openLightbox } = useLightbox()

const form = reactive({
  title: props.photo?.title ?? null,
  description: props.photo?.description ?? null,
  lat: props.photo?.lat ?? null,
  lng: props.photo?.lng ?? null,
})

const file = ref<File | null>(null)

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement

  file.value = target.files?.[0] ?? null
}

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

function buildFormData(): FormData {
  const formData = new FormData()

  for (const [key, value] of Object.entries(form)) {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  }

  if (file.value) {
    formData.append('file', file.value)
  }

  return formData
}

const {
  saving,
  removing,
  error,
  save: saveEntity,
  remove,
} = useEntityForm(
  '/api/photos',
  props.photo?.id ?? null,
  buildFormData,
  () => {
    emit('refresh')

    back()
  },
)

async function save() {
  if (!props.photo && !file.value) {
    error.value = 'Выберите файл'

    return
  }

  await saveEntity()
}
</script>

<template>
  <SidebarHeader :title="photo ? `Фото #${photo.id}` : 'Новое фото'" />

  <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
    <div
      v-if="photo"
      class="overflow-hidden rounded border border-gray-700"
    >
      <img
        :src="`/uploads/photos/${photo.filename}`"
        class="block w-full cursor-zoom-in"
        alt=""
        @click="openLightbox(`/uploads/photos/${photo.filename}`)"
      />
    </div>

    <div class="space-y-1">
      <div class="text-xs tracking-wide text-gray-400 uppercase">
        {{ photo ? 'Заменить файл' : 'Файл' }}
      </div>
      <input
        type="file"
        accept="image/*"
        class="w-full text-sm text-gray-300 file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-gray-800 file:px-2 file:py-1 file:text-sm file:text-white hover:file:bg-gray-700"
        @change="onFileChange"
      />
    </div>

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
    :on-remove="photo ? remove : undefined"
    :on-save="save"
    :on-cancel="back"
  />
</template>
