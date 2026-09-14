<script lang="ts" setup>
import type { FeatureGroup, LatLngLiteral, LayerGroup, Map as LeafletMap } from 'leaflet'

import L from 'leaflet'

import { Moon, Ruler, Settings, Sun } from 'lucide'

function fetchOrEmpty<T>(url: string): Promise<T[]> {
  return $fetch<T[]>(url).catch((err) => {
    console.warn(`[fetch] ${url}`, err)

    return []
  })
}

const { speed } = useSettings()

const { data, refresh } = useAsyncData('data', async () => {
  const [routeGroups, routes, spots] = await Promise.all([
    fetchOrEmpty<IAPIRouteGroup>('/api/routeGroups'),
    fetchOrEmpty<IAPIRoute>(`/api/routes?speed=${speed.value}`),
    fetchOrEmpty<IAPISpot>('/api/spots'),
  ])

  return {
    routeGroups,
    routes,
    spots,
  }
})

const routeGroupProxies = shallowRef<Record<number, RouteGroupProxy>>()

const map = shallowRef<LeafletMap>()

const mapClickLatLng = shallowRef<LatLngLiteral>()

const contentLayer = shallowRef<LayerGroup>()

const poiLayer = shallowRef<LayerGroup>()

const spotsLayer = shallowRef<LayerGroup>()

const depthLayer = shallowRef<FeatureGroup>()

const depthLayerVisible = ref(true)

const { show: showSidebar, open: openSidebar } = useSidebar()

const { authorized, init: initAuth } = useAuth()

const { online } = useOnline()

const { isDark, toggle: toggleColorScheme } = useColorScheme()

const showAuthModal = ref(false)

const showSettingsModal = ref(false)

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
  if (!data.value || !map.value || !contentLayer.value || !poiLayer.value || !spotsLayer.value) {
    return
  }

  contentLayer.value.clearLayers()

  poiLayer.value.clearLayers()

  spotsLayer.value.clearLayers()

  routeGroupProxies.value = getRouteGroupProxies(data.value.routeGroups)

  renderRoutes(contentLayer.value, poiLayer.value, routeGroupProxies.value, data.value.routes)

  renderRouteGroups(contentLayer.value, routeGroupProxies.value)

  renderSpots(spotsLayer.value, data.value.spots)

  if (depthLayer.value) {
    const allWaypoints = data.value.routes.flatMap((route) => route.waypoints)

    renderDepthHalos(depthLayer.value, allWaypoints, data.value.spots)
  }
}

watch(data, render)

watch(speed, () => refresh())

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

  poiLayer.value = L.layerGroup().addTo(map.value)

  spotsLayer.value = L.layerGroup().addTo(map.value)

  depthLayer.value = L.featureGroup()

  if (depthLayerVisible.value) {
    depthLayer.value.addTo(map.value)
  }

  // В нижних углах Leaflet ставит новый контрол выше предыдущих
  createButtonControl({
    icon: () => (isDark.value ? Sun : Moon),
    title: () => (isDark.value ? 'Светлая тема' : 'Тёмная тема'),
    onClick: toggleColorScheme,
  }).addTo(map.value)

  createButtonControl({ icon: Settings, title: 'Настройки', onClick: () => (showSettingsModal.value = true) }).addTo(
    map.value,
  )

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

  initAuth()

  initCoordinatesPreview(map.value)

  initMapFocus(map.value)

  initRuler(map.value)

  createButtonControl({ icon: Ruler, title: 'Линейка', active: rulerActive, onClick: toggleRuler }).addTo(map.value)

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: 22,
  })

  const darkLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: 22,
    className: 'tile--dark',
  })

  const googleSatelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  })

  ;(isDark.value ? darkLayer : osmLayer).addTo(map.value)

  // Подписи привязаны к полилиниям, в слой не вынести; пустой слой ради чекбокса
  const container = map.value.getContainer()

  const labelsLayer = L.layerGroup()
    .on('add', () => container.classList.remove('map--no-route-labels'))
    .on('remove', () => container.classList.add('map--no-route-labels'))
    .addTo(map.value)

  const overlays = {
    Маршруты: contentLayer.value,
    Подписи: labelsLayer,
    POI: poiLayer.value,
    Споты: spotsLayer.value,
  }

  const buildLayerControl = (dark: boolean) =>
    L.control.layers({ Карта: dark ? darkLayer : osmLayer, Спутник: googleSatelliteLayer }, overlays).addTo(map.value!)

  let layerControl = buildLayerControl(isDark.value)

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

    layerControl = buildLayerControl(dark)
  })
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
      <TheSettingsModal
        v-if="showSettingsModal"
        @close="showSettingsModal = false"
      />
      <TheSidebar
        v-if="showSidebar && data"
        :route-groups="data.routeGroups"
        :routes="data.routes"
        :spots="data.spots"
        :map-click-lat-lng="mapClickLatLng"
        @refresh="refresh"
        @toggle-picking="picking = $event"
      />
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

.tile--dark {
  filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9);
}

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
  position: relative;
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
  position: absolute;
  left: calc(100% + 6px);
  bottom: 0;
  padding: 5px 8px;
  width: 140px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 4px;
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
}

.map-button {
  border: none;
  box-shadow: none;
}

/* Иконка пересоздаётся между слушателями click, и Leaflet не находит контрол по parentNode */
.map-button__button svg,
.depth-toggle__button svg {
  pointer-events: none;
}

.map-button__button {
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

.map-button--active .map-button__button {
  box-shadow: 0 0 0 2px #1f9e89;
}

[data-theme='dark'] .map-button__button {
  background: #1f2937;
}

.map--no-route-labels .route-label {
  display: none;
}

/* CSS-stroke перебивает атрибут stroke от Leaflet */
.route--hover {
  stroke: rgba(0, 255, 0, 0.75);
}

.map-toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ruler-label {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.ruler-node {
  background: #ffffff;
  border: 2px solid #1f9e89;
  border-radius: 50%;
  box-sizing: border-box;
}

.leaflet-marker-draggable.ruler-node {
  cursor: grab;
}

.ruler-label__delete {
  cursor: pointer;
  color: #dc2626;
}

/* Крест без кольца: кольцо похоже на узел линии */
.ruler-crosshair {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  z-index: 1000;
  pointer-events: none;
}

.ruler-crosshair::before,
.ruler-crosshair::after {
  content: '';
  position: absolute;
  background: #1f9e89;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.ruler-crosshair::before {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
}

.ruler-crosshair::after {
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  margin-top: -1px;
}

.marker--preview {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Только opacity: анимация transform перебила бы translate3d Leaflet'а */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
