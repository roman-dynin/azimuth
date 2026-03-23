<script lang="ts" setup>
import type { LatLng } from 'leaflet'

import type { EnrichedRoute } from '~~/types/api'

import L from 'leaflet'

const { data: routes } = await useFetch<EnrichedRoute[]>('/api/routes')

const { data: spots } = await useFetch('/api/spots')

const clickLatLng = ref<LatLng | null>(null)

const getRandomColor = () => Math.floor(Math.random() * 254)

onMounted(() => {
  const map = L.map('map', {
    attributionControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map)

  routes.value!.forEach((route, routeIndex) => {
    const latlngs = [route.latLng, ...route.waypoints.map(waypoint => waypoint.latLng)]

    const color = `rgb(${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()})`

    const polyline = L.polyline(latlngs, {
      color,
      weight: route.guideline ? 3 : 2,
      dashArray: route.guideline ? undefined : [10, 10],
    })
      .bindTooltip(route.title)
      .addTo(map)

    route.waypoints.forEach((waypoint, waypointIndex) => {
      L.circleMarker(waypoint.latLng, {
        color,
        weight: 1,
        fillOpacity: 0.1,
        radius: 7,
      })
        .bindTooltip(`Точка #${waypointIndex + 1}<br>Курс: ${waypoint.azimuth}°<br>Время: ~ ${Math.round(waypoint.seconds / 60)} мин.`)
        .addTo(map)
    })

    if (routeIndex === 0) {
      map.fitBounds(polyline.getBounds())
    }
  })

  spots.value!.forEach((spot) => {
    new L.Marker([spot.lat, spot.lng], {
      icon: new L.DivIcon({
        className: 'marker--emoji',
        html: spot.emoji,
      }),
    })
      .bindTooltip(spot.title)
      .addTo(map)
  })

  map.on('click', (event) => {
    clickLatLng.value = map.mouseEventToLatLng(event.originalEvent)
  })
})

useHead({
  title: 'Керамзитка',
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="grow">
      <div id="map" class="h-full" />
    </div>
    <div class="flex justify-between px-2 py-2 bg-black text-gray-500 text-xs">
      <div>
        {{ clickLatLng }}
      </div>
      <div>
        🐙 <a href="https://github.com/roman-dynin/azimuth" target="_blank">@roman-dynin</a>
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
