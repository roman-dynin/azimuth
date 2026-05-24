<script lang="ts" setup>
defineProps<{
  title: string
  subtitle?: string
}>()

const { view, back, close } = useSidebar()

const { authorized, logout } = useAuth()

function onLogout() {
  logout()

  close()
}
</script>

<template>
  <div class="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
    <div class="flex min-w-0 items-center gap-2">
      <button
        v-if="view !== 'home'"
        class="shrink-0 cursor-pointer text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
        @click="back"
      >
        ←
      </button>
      <div class="min-w-0">
        <div class="text-sm font-medium">
          {{ title }}
        </div>
        <div
          v-if="subtitle"
          class="truncate text-xs text-gray-600 dark:text-gray-400"
        >
          {{ subtitle }}
        </div>
      </div>
    </div>
    <div class="ml-2 flex shrink-0 items-center gap-2">
      <button
        v-if="authorized"
        class="cursor-pointer text-xs text-gray-500 hover:text-black dark:hover:text-white"
        title="Выйти"
        @click="onLogout"
      >
        🏃🚪
      </button>
      <button
        class="cursor-pointer text-lg leading-none text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
        @click="close"
      >
        ✕
      </button>
    </div>
  </div>
</template>
