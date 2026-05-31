<script lang="ts" setup>
import type { FeatureGroup, LatLngLiteral, LayerGroup, Map as LeafletMap } from 'leaflet'

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

const depthLayer = shallowRef<FeatureGroup>()

const depthLayerVisible = ref(true)

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

const { init: initRuler, active: rulerActive, toggle: toggleRuler } = useRuler()

function render() {
  if (!data.value || !map.value || !contentLayer.value) {
    return
  }

  contentLayer.value.clearLayers()

  routeGroupProxies.value = getRouteGroupProxies(data.value.routeGroups)

  renderRoutes(contentLayer.value, routeGroupProxies.value, data.value.routes)

  renderRouteGroups(contentLayer.value, routeGroupProxies.value)

  renderSpots(contentLayer.value, data.value.spots)

  renderPhotos(contentLayer.value, visiblePhotos.value)

  if (depthLayer.value) {
    const allWaypoints = data.value.routes.flatMap((route) => route.waypoints)

    renderDepthHalos(depthLayer.value, allWaypoints, data.value.spots)
  }
}

watch(data, render)

watch(online, render)

const apiUpdatesChannel = shallowRef<BroadcastChannel>()

onMounted(() => {
  map.value = L.map('map', { attributionControl: false }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM)

  map.value.createPane('markers').style.zIndex = '450'

  const depthPane = map.value.createPane('depth')

  depthPane.style.zIndex = '350'

  depthPane.style.filter = 'blur(50px)'

  depthPane.style.pointerEvents = 'none'

  map.value!.on('click', (event) => {
    if (rulerActive.value) {
      return
    }

    mapClickLatLng.value = map.value!.mouseEventToLatLng(event.originalEvent) as LatLngLiteral
  })

  contentLayer.value = L.layerGroup().addTo(map.value)

  depthLayer.value = L.featureGroup()

  if (depthLayerVisible.value) {
    depthLayer.value.addTo(map.value)
  }

  createDepthToggleControl({
    initialVisible: depthLayerVisible.value,
    onToggle: (visible) => {
      depthLayerVisible.value = visible

      if (!map.value || !depthLayer.value) {
        return
      }

      if (visible) {
        depthLayer.value.addTo(map.value)
      } else {
        depthLayer.value.removeFrom(map.value)
      }
    },
  }).addTo(map.value)

  if ('BroadcastChannel' in window) {
    apiUpdatesChannel.value = new BroadcastChannel('api-cache-updates')

    apiUpdatesChannel.value.addEventListener('message', () => refresh())
  }

  initAuth()

  initCoordinatesPreview(map.value)

  initMapFocus(map.value)

  initRuler(map.value)

  createRulerControl({ active: rulerActive, onToggle: toggleRuler }).addTo(map.value)

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
        @close="showAuthModal = false"
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
          class="hidden cursor-pointer text-gray-600 hover:text-black lg:inline dark:text-gray-400 dark:hover:text-white"
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

.depth-toggle {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  box-shadow: none;
}

.depth-toggle__button {
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  text-decoration: none;
  width: 30px;
  height: 30px;
  line-height: 30px;
  background: #ffffff;
  border-radius: 4px;
  flex-shrink: 0;
}

.depth-toggle--active .depth-toggle__button {
  box-shadow: 0 0 0 2px #1f9e89;
}

[data-theme='dark'] .depth-toggle__button {
  background: #1f2937;
}

.depth-toggle__legend {
  display: none;
  padding: 5px 8px;
  width: 140px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 10px;
  color: #374151;
  backdrop-filter: blur(4px);
}

.depth-toggle--active .depth-toggle__legend {
  display: block;
}

.depth-toggle__legend-bar {
  height: 8px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    #fde725,
    #b5de2b,
    #6ece58,
    #35b779,
    #1f9e89,
    #26828e,
    #31688e,
    #3e4989,
    #482878,
    #440154
  );
}

.depth-toggle__legend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
}

[data-theme='dark'] .depth-toggle__legend {
  background: rgba(31, 41, 55, 0.92);
  color: #f3f4f6;
  border-color: #374151;
}

.ruler-toggle {
  border: none;
  box-shadow: none;
}

.ruler-toggle__button {
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  text-decoration: none;
  width: 30px;
  height: 30px;
  line-height: 30px;
  background: #ffffff;
  border-radius: 4px;
}

.ruler-toggle--active .ruler-toggle__button {
  box-shadow: 0 0 0 2px #1f9e89;
}

[data-theme='dark'] .ruler-toggle__button {
  background: #1f2937;
}

.ruler-label {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
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
