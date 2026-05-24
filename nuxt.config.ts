import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'leaflet', // CJS
      ],
    },
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    authCode: '',
  },

  ssr: false,

  modules: ['@nuxt/eslint'],

  typescript: {
    typeCheck: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
    checker: {
      configType: 'eslintrc',
    },
  },
})
