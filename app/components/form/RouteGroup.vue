<script lang="ts" setup>
const props = defineProps<{
  routeGroup: IAPIRouteGroup | null
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { back } = useSidebar()

const form = reactive({
  title: props.routeGroup?.title ?? null,
  description: props.routeGroup?.description ?? null,
  color: props.routeGroup?.color ?? null,
  weight: props.routeGroup?.weight ?? null,
})

const { saving, removing, error, save, remove } = useEntityForm(
  '/api/routeGroups',
  props.routeGroup?.id ?? null,
  () => ({ ...form }),
  () => {
    emit('refresh')

    back()
  },
)
</script>

<template>
  <SidebarHeader :title="routeGroup ? `Группа #${routeGroup.id}` : 'Новая группа'" />

  <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
    <FieldText
      v-model.trim="form.title"
      label="Название"
    />

    <FieldTextarea
      v-model.trim="form.description"
      label="Описание"
    />

    <FieldColorPicker v-model.trim="form.color" />

    <FieldNumber
      v-model.number="form.weight"
      label="Толщина линии"
      :min="1"
    />
  </div>

  <FormFooter
    :saving="saving"
    :removing="removing"
    :error="error"
    :on-remove="routeGroup ? remove : undefined"
    :on-save="save"
    :on-cancel="back"
  />
</template>
