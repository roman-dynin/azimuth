<script lang="ts" setup>
const emit = defineEmits<{ success: [] }>()

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
  <div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60">
    <form
      class="flex w-72 flex-col gap-4 rounded-xl bg-gray-900 p-6 shadow-2xl"
      @submit.prevent="submit"
    >
      <div class="text-sm font-medium text-white">Введите код доступа</div>

      <input
        v-model="code"
        type="password"
        class="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-gray-500"
        placeholder="Код"
        autofocus
        autocomplete="off"
      />

      <div
        v-if="error"
        class="text-xs text-red-400"
      >
        Неверный код
      </div>

      <button
        type="submit"
        :disabled="loading || !code"
        class="rounded-lg bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-40"
      >
        Войти
      </button>
    </form>
  </div>
</template>
