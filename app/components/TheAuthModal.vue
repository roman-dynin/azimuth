<script lang="ts" setup>
const emit = defineEmits<{ success: [], close: [] }>()

const { authorize } = useAuth()

const code = ref('')

const loading = ref(false)

const error = ref(false)

async function submit() {
  if (!code.value) return

  loading.value = true

  error.value = false

  try {
    await authorize(code.value)

    emit('success')
  } catch {
    code.value = ''

    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60"
    @click.self="emit('close')"
  >
    <form
      class="relative flex w-72 flex-col gap-4 rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900"
      @submit.prevent="submit"
    >
      <button
        type="button"
        class="absolute top-2 right-2 cursor-pointer text-lg leading-none text-gray-400 hover:text-gray-700 dark:hover:text-white"
        aria-label="Закрыть"
        @click="emit('close')"
      >
        ×
      </button>

      <div class="text-sm font-medium text-gray-900 dark:text-white">Введите код доступа</div>

      <input
        v-model="code"
        type="password"
        class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:text-white"
        placeholder="Код"
        autofocus
        autocomplete="off"
      />

      <div
        v-if="error"
        class="text-xs text-red-700 dark:text-red-400"
      >
        Неверный код
      </div>

      <button
        type="submit"
        :disabled="loading || !code"
        class="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-900 hover:bg-gray-300 disabled:opacity-40 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        Войти
      </button>
    </form>
  </div>
</template>
