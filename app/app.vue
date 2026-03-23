<script lang="ts" setup>
import type { LatLngTuple } from 'leaflet'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

const { data } = await useFetch('/api/waypoints')

const waypoints = computed(() => data.value || [])

const startPoint: LatLngTuple = [53.2409518, 34.4762879]

onMounted(() => {
  const map = L.map('map')

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  const coordinates = [startPoint, ...waypoints.value.map(waypoint => waypoint.lat_lng)]

  const polyline = L.polyline(coordinates, {
    color: 'green',
    weight: 2,
  }).addTo(map)

  waypoints.value.forEach((waypoint) => {
    L.circleMarker(waypoint.lat_lng, {
      color: 'red',
      fillOpacity: 0.5,
      radius: 2,
    })
      .bindPopup(`Точка #${waypoint.id}<br>Курс: ${waypoint.azimuth}°`)
      .addTo(map)
  })

  map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
})
</script>

<template>
  <div id="map" />
</template>

<style>
#map {
  height: 640px;
}
</style>
