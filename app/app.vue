<script lang="ts" setup>
import type { LatLngLiteral, LayerGroup, Map as LeafletMap } from 'leaflet'

import L from 'leaflet'

function fetchOrEmpty<T>(url: string): Promise<T[]> {
  return $fetch<T[]>(url).catch((err) => {
    console.warn(`[fetch] ${url}`, err)

    return []
  })
}

const { data, refresh } = useAsyncData('data', async () => {
  const [routeGroups, routes, spots, photos] = await Promise.all([
    fetchOrEmpty<IAPIRouteGroup>('/api/routeGroups'),
    fetchOrEmpty<IAPIRoute>('/api/routes'),
    fetchOrEmpty<IAPISpot>('/api/spots'),
    fetchOrEmpty<IAPIPhoto>('/api/photos'),
  ])

  return {
    routeGroups,
    routes,
    spots,
    photos,
  }
})

const routeGroupProxies = shallowRef<Record<number, RouteGroupProxy>>()

const map = shallowRef<LeafletMap>()

const mapClickLatLng = shallowRef<LatLngLiteral>()

const contentLayer = shallowRef<LayerGroup>()

const { show: showSidebar, open: openSidebar } = useSidebar()

const { authorized, init: initAuth } = useAuth()

const { online } = useOnline()

const { isDark, toggle: toggleColorScheme } = useColorScheme()

const visiblePhotos = computed(() => (online.value ? (data.value?.photos ?? []) : []))

const showAuthModal = ref(false)

function handleManagementClick() {
  if (authorized.value) {
    openSidebar()
  } else {
    showAuthModal.value = true
  }
}

function onAuthSuccess() {
  showAuthModal.value = false

  openSidebar()
}

const picking = ref(false)

const { init: initCoordinatesPreview } = useCoordinatesPreview()

const { init: initMapFocus } = useMapFocus()

let initialRender = true

function render() {
  if (!data.value || !map.value || !contentLayer.value) {
    return
  }

  contentLayer.value.clearLayers()

  routeGroupProxies.value = getRouteGroupProxies(data.value.routeGroups)

  renderRoutes(map.value, contentLayer.value, routeGroupProxies.value, data.value.routes, initialRender)

  renderRouteGroups(contentLayer.value, routeGroupProxies.value)

  renderSpots(contentLayer.value, data.value.spots)

  renderPhotos(contentLayer.value, visiblePhotos.value)

  initialRender = false
}

watch(data, render)

watch(online, render)

const apiUpdatesChannel = shallowRef<BroadcastChannel>()

onMounted(() => {
  map.value = L.map('map', { attributionControl: false }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM)

  map.value.createPane('markers').style.zIndex = '450'

  map.value!.on('click', (event) => {
    mapClickLatLng.value = map.value!.mouseEventToLatLng(event.originalEvent) as LatLngLiteral
  })

  contentLayer.value = L.layerGroup().addTo(map.value)

  if ('BroadcastChannel' in window) {
    apiUpdatesChannel.value = new BroadcastChannel('api-cache-updates')

    apiUpdatesChannel.value.addEventListener('message', () => refresh())
  }

  initAuth()

  initCoordinatesPreview(map.value)

  initMapFocus(map.value)

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: 22,
  })

  const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxNativeZoom: 20,
    maxZoom: 22,
    subdomains: 'abcd',
  })

  const googleSatelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  })

  ;(isDark.value ? darkLayer : osmLayer).addTo(map.value)

  let layerControl = L.control
    .layers({
      Карта: isDark.value ? darkLayer : osmLayer,
      Спутник: googleSatelliteLayer,
    })
    .addTo(map.value!)

  watch(isDark, (dark) => {
    if (!map.value) {
      return
    }

    const [add, remove] = dark ? [darkLayer, osmLayer] : [osmLayer, darkLayer]

    if (map.value.hasLayer(remove)) {
      map.value.removeLayer(remove)

      add.addTo(map.value)
    }

    map.value.removeControl(layerControl)

    layerControl = L.control
      .layers({
        Карта: dark ? darkLayer : osmLayer,
        Спутник: googleSatelliteLayer,
      })
      .addTo(map.value)
  })
})

onBeforeUnmount(() => {
  apiUpdatesChannel.value?.close()
})

useHead({
  title: 'Керамзитное',
  style: [{ innerHTML: `:root { --emoji-marker-size: ${WAYPOINT_EMOJI_SIZE_PX}px; }` }],
})
</script>

<template>
  <div class="flex h-dvh flex-col">
    <div class="relative grow">
      <div
        id="map"
        class="h-full"
        :style="picking ? { cursor: 'crosshair' } : {}"
      />
      <TheAuthModal
        v-if="showAuthModal"
        @success="onAuthSuccess"
      />
      <TheSidebar
        v-if="showSidebar && data"
        :route-groups="data.routeGroups"
        :routes="data.routes"
        :spots="data.spots"
        :photos="visiblePhotos"
        :map-click-lat-lng="mapClickLatLng"
        @refresh="refresh"
        @toggle-picking="picking = $event"
      />
      <ThePhotoViewer />
    </div>
    <div class="flex items-center justify-between bg-gray-50 px-2 py-2 text-xs text-gray-500 dark:bg-black">
      <div class="hidden lg:block">
        {{ mapClickLatLng }}
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="!online"
          class="rounded bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-300"
        >
          Нет интернета
        </span>
        <span class="hidden lg:inline">Сделано с любовью!</span> 🐙
        <a
          href="https://github.com/roman-dynin/azimuth"
          target="_blank"
          >@roman-dynin</a
        >
      </div>
      <div class="flex items-center gap-3">
        <button
          class="cursor-pointer text-base leading-none"
          :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
          @click="toggleColorScheme"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button
          class="cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          @click="handleManagementClick"
        >
          Управление
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css">
@import 'tailwindcss';

@import 'leaflet/dist/leaflet.css';

@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

.marker--emoji {
  font-size: calc(var(--emoji-marker-size) * 0.5);
  line-height: var(--emoji-marker-size);
  text-align: center;

  background: #ffffff;
  border-radius: 50%;

  width: var(--emoji-marker-size) !important;
  height: var(--emoji-marker-size) !important;
}

[data-theme='dark'] .marker--emoji {
  background: #1f2937;
}

[data-theme='dark'] .leaflet-popup-content-wrapper,
[data-theme='dark'] .leaflet-popup-tip,
[data-theme='dark'] .leaflet-tooltip {
  background: #1f2937;
  color: #f3f4f6;
  border: none;
}

[data-theme='dark'] .leaflet-tooltip-top::before {
  border-top-color: #1f2937;
}

[data-theme='dark'] .leaflet-tooltip-bottom::before {
  border-bottom-color: #1f2937;
}

[data-theme='dark'] .leaflet-tooltip-left::before {
  border-left-color: #1f2937;
}

[data-theme='dark'] .leaflet-tooltip-right::before {
  border-right-color: #1f2937;
}

[data-theme='dark'] .leaflet-control-layers,
[data-theme='dark'] .leaflet-bar a {
  background: #1f2937;
  color: #f3f4f6;
  border-color: #374151;
}

[data-theme='dark'] .leaflet-control-layers-separator {
  border-top-color: #374151;
}

.marker--preview {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.15);
  }
}
</style>
