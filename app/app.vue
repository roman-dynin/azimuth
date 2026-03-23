<script lang="ts" setup>
import type { EnrichedRoute } from '~~/types/api'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

const { data: routes } = await useFetch<EnrichedRoute[]>('/api/routes')

const { data: spots } = await useFetch('/api/spots')

const getRandomColor = () => Math.floor(Math.random() * 254)

onMounted(() => {
  const map = L.map('map', {
    attributionControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  routes.value!.forEach((route, routeIndex) => {
    const coordinates = [route.latLng, ...route.waypoints.map(waypoint => waypoint.latLng)]

    const color = `rgb(${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()})`

    const polyline = L.polyline(coordinates, {
      color,
      weight: route.guideline ? 2 : 1,
      dashArray: route.guideline ? undefined : [10, 10],
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
        .bindPopup(`Точка #${waypointIndex + 1}<br>Курс: ${waypoint.azimuth}°<br>Время: ~ ${Math.round(waypoint.seconds / 60)} мин.<br>${waypoint.latLng}`)
        .addTo(map)
    })
  })

  spots.value!.forEach((spot) => {
    new L.Marker([spot.lat, spot.lng], {
      icon: new L.DivIcon({
        className: 'emoji-marker',
        html: spot.emoji,
      }),
    })
      .bindTooltip(spot.title)
      .addTo(map)
  })

  map.on('click', (event) => {
    const latlng = map.mouseEventToLatLng(event.originalEvent)

    // eslint-disable-next-line no-console
    console.log(latlng)
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
:root {
  --emoji-marker-size: 20px;
}

#map{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.emoji-marker {
  font-size: var(--emoji-marker-size);

  line-height: var(--emoji-marker-size);

  background: #fff;

  border-radius: 50%;

  width:  var(--emoji-marker-size) !important;
  height: var(--emoji-marker-size) !important;

  padding: 10px;
}
</style>
