<script lang="ts" setup>
import type { LatLng, LatLngTuple } from 'leaflet'

import L from 'leaflet'

const { data: routeGroups } = await useFetch<IAPIRouteGroup[]>('/api/routeGroups')

const routeGroupWrappers = getRouteGroupWrappers(routeGroups.value!)

const { data: routes } = await useFetch<IAPIRoute[]>('/api/routes')

const { data: spots } = await useFetch<IAPISpot[]>('/api/spots')

const clickLatLng = ref<LatLng | null>(null)

onMounted(() => {
  const map = L.map('map', { attributionControl: false })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

  routes.value?.forEach((route, routeIndex) => {
    const routeGroupWrapper = route.routeGroupId ? routeGroupWrappers[route.routeGroupId] : undefined

    const coordinates = [[route.anchorLat, route.anchorLng], ...route.waypoints.map(waypoint => [waypoint.lat, waypoint.lng])] as LatLngTuple[]

    const color = getRouteColor(routeGroupWrapper?.value, route)

    const weight = getRouteWeight(routeGroupWrapper?.value, route)

    const polyline = L.polyline(coordinates, {
      color,
      weight,
      dashArray: route.guideline ? undefined : [10, 10],
    })

    const help = getRouteTooltip(route)

    if (help) {
      if (route.routeGroupId) {
        polyline.bindPopup(help)
      }
      else {
        polyline.bindTooltip(help)
      }
    }

    if (route.routeGroupId) {
      routeGroupWrappers[route.routeGroupId]?.featureGroup.addLayer(polyline)
    }
    else {
      polyline.addTo(map)
    }

    route.waypoints.forEach((waypoint) => {
      const marker = L.circleMarker([waypoint.lat, waypoint.lng], { ...getWaypointMarkerOptions(color, waypoint) })

      const help = getWaypointTooltip(waypoint)

      if (help) {
        marker.bindTooltip(help)
      }

      marker.addTo(map)
    })

    if (routeIndex === 0) {
      map.fitBounds(polyline.getBounds())
    }
  })

  Object.values(routeGroupWrappers).forEach(routeGroupWrapper => routeGroupWrapper.featureGroup.addTo(map))

  spots.value?.forEach((spot) => {
    const marker = new L.Marker([spot.lat, spot.lng], {
      icon: new L.DivIcon({
        className: 'marker--emoji',
        html: spot.emoji,
      }),
    })

    const help = getSpotTooltip(spot)

    if (help) {
      marker.bindTooltip(help)
    }

    marker.addTo(map)
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
        Сделано с любовью!; 🐙 <a href="https://github.com/roman-dynin/azimuth" target="_blank">@roman-dynin</a>
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
