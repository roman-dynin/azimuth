import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#000000' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Azimuth' },
      ],
    },
  },

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

  modules: ['@nuxt/eslint', '@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    client: {
      installPrompt: true,
    },
    manifest: {
      name: 'Azimuth',
      short_name: 'Azimuth',
      description: 'Подводная навигация по оз. Керамзитное',
      theme_color: '#000000',
      background_color: '#111827',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      additionalManifestEntries: [{ url: '/', revision: `${Date.now()}` }],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//],
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            networkTimeoutSeconds: 3,
          },
        },
        {
          urlPattern: /\/api\/(routes|routeGroups|spots|photos)(\?.*)?$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: /^https:\/\/[a-z]\.tile\.openstreetmap\.org\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'osm-tiles',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/mt\d\.google\.com\/vt\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-tiles',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

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
