<script lang="ts" setup>
import type { LatLngLiteral, LayerGroup, Map as LeafletMap } from 'leaflet'

import L from 'leaflet'

const { data, status, refresh } = useAsyncData('data', async () => {
  const [routeGroups, routes, spots, photos] = await Promise.all([
    $fetch<IAPIRouteGroup[]>('/api/routeGroups'),
    $fetch<IAPIRoute[]>('/api/routes'),
    $fetch<IAPISpot[]>('/api/spots'),
    $fetch<IAPIPhoto[]>('/api/photos'),
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

watch(status, (value) => {
  if (value !== 'success') {
    return
  }

  render()
})

watch(online, render)

onMounted(() => {
  map.value = L.map('map', { attributionControl: false }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM)

  map.value.createPane('markers').style.zIndex = '450'

  map.value!.on('click', (event) => {
    mapClickLatLng.value = map.value!.mouseEventToLatLng(event.originalEvent) as LatLngLiteral
  })

  contentLayer.value = L.layerGroup().addTo(map.value)

  initAuth()

  initCoordinatesPreview(map.value)

  initMapFocus(map.value)

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: 22,
  }).addTo(map.value)

  const googleSatelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  })

  L.control
    .layers({
      Карта: osmLayer,
      Спутник: googleSatelliteLayer,
    })
    .addTo(map.value!)
})

useHead({
  title: 'Azimuth',
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
    <div class="flex items-center justify-between bg-black px-2 py-2 text-xs text-gray-500">
      <div class="hidden lg:block">
        {{ mapClickLatLng }}
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="!online"
          class="rounded bg-red-900/40 px-2 py-0.5 text-red-300"
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
      <button
        class="cursor-pointer text-gray-400 hover:text-white"
        @click="handleManagementClick"
      >
        Управление
      </button>
    </div>
  </div>
</template>

<style lang="css">
@import 'tailwindcss';

@import 'leaflet/dist/leaflet.css';

:root {
  --emoji-marker-size: 32px;
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
