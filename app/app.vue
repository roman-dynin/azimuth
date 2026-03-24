<script lang="ts" setup>
import type { LatLng, LatLngTuple } from 'leaflet'

import L from 'leaflet'

function getWaypointHelp(waypoint: IAPIWaypoint): string {
  const parts: string[] = []

  parts.push(`Точка #${waypoint.id}`)

  if (waypoint.azimuth) {
    parts.push(`Азимут: ${waypoint.azimuth}&deg;`)
  }

  if (waypoint.seconds) {
    parts.push(`Время движения от пред. точки: &asymp; ${Math.round(waypoint.seconds / 60)} мин.`)
  }

  return parts.join('<br>')
}

const { data: routeGroups } = await useFetch('/api/routeGroups')

const routeGroupWrappers: Record<number, RouteGroupWrapper> = {}

routeGroups.value?.forEach((routeGroup) => {
  const featureGroup = new L.FeatureGroup()

  featureGroup.on('mouseover', (event) => {
    event.target.setStyle({ color: UI_ROUTE_HIGHLIGHT_COLOR })
  })

  featureGroup.on('mouseout', (event) => {
    event.target.setStyle({ color: routeGroup.color || getRandomColor() })
  })

  if (routeGroup.title) {
    featureGroup.bindTooltip(routeGroup.title)
  }

  routeGroupWrappers[routeGroup.id] = {
    value: routeGroup,
    featureGroup,
  }
})

const { data: routes } = await useFetch<IAPIRoute[]>('/api/routes')

const { data: spots } = await useFetch('/api/spots')

const clickLatLng = ref<LatLng | null>(null)

onMounted(() => {
  const map = L.map('map', { attributionControl: false })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

  routes.value?.forEach((route, routeIndex) => {
    const coordinates = [[route.anchorLat, route.anchorLng], ...route.waypoints.map(waypoint => [waypoint.lat, waypoint.lng])] as LatLngTuple[]

    let color = getRandomColor()

    if (route.routeGroupId) {
      color = routeGroupWrappers[route.routeGroupId]?.value.color || color
    }

    const polyline = L.polyline(coordinates, {
      color,
      weight: route.isGuideline ? UI_ROUTE_WEIGHT + 1 : UI_ROUTE_WEIGHT,
      dashArray: route.isGuideline ? undefined : [10, 10],
    })

    if (route.title) {
      if (route.routeGroupId) {
        polyline.bindPopup(route.title)
      }
      else {
        polyline.bindTooltip(route.title)
      }
    }

    if (route.routeGroupId) {
      routeGroupWrappers[route.routeGroupId]?.featureGroup.addLayer(polyline)
    }
    else {
      polyline.addTo(map)
    }

    route.waypoints.forEach((waypoint) => {
      const marker = L.circleMarker([waypoint.lat, waypoint.lng], {
        color,
        weight: 1,
        fillOpacity: 0.1,
        radius: 7,
      })

      const help = getWaypointHelp(waypoint)

      if (help) {
        marker.bindTooltip(help)
      }

      marker.addTo(map)
    })

    if (routeIndex === 0) {
      map.fitBounds(polyline.getBounds())
    }
  })

  Object.values(routeGroupWrappers).forEach((routeGroupWrapper) => {
    routeGroupWrapper.featureGroup.addTo(map)
  })

  spots.value?.forEach((spot) => {
    const marker = new L.Marker([spot.lat, spot.lng], {
      icon: new L.DivIcon({
        className: 'marker--emoji',
        html: spot.emoji,
      }),
    })

    if (spot.title) {
      marker.bindTooltip(spot.title)
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
