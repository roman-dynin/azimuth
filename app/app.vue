<script lang="ts" setup>
import type { EnrichedRoute } from '~~/types/api'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

const { data } = await useFetch<EnrichedRoute[]>('/api/routes')

const routes = computed(() => data.value || [])

const getRandomColor = () => Math.floor(Math.random() * 254)

onMounted(() => {
  const map = L.map('map', {
    attributionControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  routes.value.forEach((route, routeIndex) => {
    const coordinates = [route.latLng, ...route.waypoints.map(waypoint => waypoint.latLng)]

    const color = `rgb(${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()})`

    const polyline = L.polyline(coordinates, {
      color,
      weight: 2,
    })
      .bindTooltip(route.title)
      .addTo(map)

    if (routeIndex === 0) {
      map.fitBounds(polyline.getBounds(), { maxZoom: 18 })
    }

    route.waypoints.forEach((waypoint, waypointIndex) => {
      L.circleMarker(waypoint.latLng, {
        color,
        fillOpacity: 0.5,
        radius: 4,
      })
        .bindPopup(`Точка #${waypointIndex + 1}<br>Курс: ${waypoint.azimuth}°<br>Время: ~ ${Math.round(waypoint.seconds / 60)} мин.`)
        .addTo(map)
    })
  })
})

useHead({
  title: 'Керамзитка',
})
</script>

<template>
  <div id="map" />
</template>

<style>
#map{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
