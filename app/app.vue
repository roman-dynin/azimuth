<script lang="ts" setup>
import type { LatLng, Map as LeafletMap } from 'leaflet'

import L from 'leaflet'

const { data, status } = useAsyncData(
  'data',
  async () => {
    const [
      routeGroups,
      routes,
      spots,
    ] = await Promise.all([
      $fetch<IAPIRouteGroup[]>('/api/routeGroups'),
      $fetch<IAPIRoute[]>('/api/routes'),
      $fetch<IAPISpot[]>('/api/spots'),
    ])

    return {
      routeGroups,
      routes,
      spots,
    }
  },
)

const routeGroupProxies = shallowRef<Record<number, RouteGroupProxy>>()

const map = shallowRef<LeafletMap>()

const mapClickLatLng = shallowRef<LatLng>()

watch(status, (value) => {
  if (value !== 'success') {
    return
  }

  if (!data.value) {
    return
  }

  if (!map.value) {
    return
  }

  routeGroupProxies.value = getRouteGroupProxies(data.value.routeGroups)

  renderRoutes(map.value, routeGroupProxies.value, data.value.routes)

  renderRouteGroups(map.value, routeGroupProxies.value)

  renderSpots(map.value, data.value.spots)
})

onMounted(() => {
  map.value = L.map('map', { attributionControl: false })

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map.value)

  const googleSatelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  })

  L.control.layers({
    // eslint-disable-next-line style/quote-props
    'Карта': osmLayer,
    // eslint-disable-next-line style/quote-props
    'Спутник': googleSatelliteLayer,
  }).addTo(map.value!)

  map.value!.on('click', (event) => {
    mapClickLatLng.value = map.value!.mouseEventToLatLng(event.originalEvent)
  })
})

useHead({
  title: 'Azimuth',
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="grow">
      <div id="map" class="h-full" />
    </div>
    <div class="flex justify-between px-2 py-2 bg-black text-gray-500 text-xs">
      <div class="hidden lg:block">
        {{ mapClickLatLng }}
      </div>
      <div>
        <span class="hidden lg:block">Сделано с любовью!</span> 🐙 <a href="https://github.com/roman-dynin/azimuth" target="_blank">@roman-dynin</a>
      </div>
    </div>
  </div>
</template>

<style lang="css">
@import "tailwindcss";

@import "leaflet/dist/leaflet.css";

:root {
  --emoji-marker-size: 32px;
}

.marker--emoji {
  font-size: calc(var(--emoji-marker-size) * 0.5);
  line-height:    var(--emoji-marker-size);
  text-align: center;

  background: #ffffff;
  border-radius: 50%;

  width:  var(--emoji-marker-size) !important;
  height: var(--emoji-marker-size) !important;
}
</style>
