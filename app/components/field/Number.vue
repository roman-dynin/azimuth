<script lang="ts" setup>
const props = defineProps<{
  label?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
}>()

const model = defineModel<number | null>({ default: null })

function onInput(event: Event) {
  const input = event.target as HTMLInputElement

  model.value = input.value === '' ? null : input.valueAsNumber
}

function onBlur() {
  if (model.value === null) {
    return
  }

  if (props.min !== undefined && model.value < props.min) {
    model.value = props.min
  }

  if (props.max !== undefined && model.value > props.max) {
    model.value = props.max
  }
}
</script>

<template>
  <div :class="{ 'space-y-1': label }">
    <div
      v-if="label"
      class="text-xs tracking-wide text-gray-400 uppercase"
    >
      {{ label }}
    </div>
    <input
      :value="model ?? ''"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      class="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
      @input="onInput"
      @blur="onBlur"
    />
  </div>
</template>
