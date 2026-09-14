<script lang="ts" setup>
import { X } from 'lucide'

const emit = defineEmits<{ close: [] }>()

const { speed } = useSettings()

// В UI м/мин, дайверу привычнее; внутри м/с
const form = ref<number | null>(Math.round(speed.value * 60 * 10) / 10)

function submit() {
  speed.value = form.value ? form.value / 60 : DIVER_SPEED_MULTIPLIER

  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60"
    @click.self="emit('close')"
  >
    <form
      class="relative flex w-72 flex-col gap-4 rounded-xl bg-white p-6 text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-white"
      @submit.prevent="submit"
    >
      <button
        type="button"
        class="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-white"
        aria-label="Закрыть"
        @click="emit('close')"
      >
        <LucideIcon :icon="X" />
      </button>

      <div class="text-sm font-medium">Настройки</div>

      <FieldNumber
        v-model="form"
        label="Скорость, м/мин"
        :min="1"
        :max="600"
        :step="1"
        :placeholder="String(DIVER_SPEED_MULTIPLIER * 60)"
      />

      <FieldNumber
        label="Магнитное склонение, °"
        :model-value="MAGNETIC_DECLINATION_DEG"
        disabled
      />

      <button
        type="submit"
        class="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        Сохранить
      </button>
    </form>
  </div>
</template>
