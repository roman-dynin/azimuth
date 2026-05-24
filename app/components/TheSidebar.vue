<script lang="ts" setup>
import type { LatLngLiteral } from 'leaflet'

const props = defineProps<{
  routeGroups: IAPIRouteGroup[]
  routes: IAPIRoute[]
  spots: IAPISpot[]
  photos: IAPIPhoto[]
  mapClickLatLng?: LatLngLiteral
}>()

const emit = defineEmits<{
  refresh: []
  togglePicking: [value: boolean]
}>()

const {
  view,
  editingRouteGroup,
  editingRoute,
  editingWaypoint,
  editingSpot,
  editingPhoto,
  selectedRoute,
  openRouteGroup,
  openRoute,
  openWaypoints,
  openWaypoint,
  openSpot,
  openPhoto,
  syncRouteGroups,
  syncRoutes,
  syncSpots,
  syncPhotos,
} = useSidebar()

watch(() => props.routeGroups, syncRouteGroups)

watch(() => props.routes, syncRoutes)

watch(() => props.spots, syncSpots)

watch(() => props.photos, syncPhotos)
</script>

<template>
  <div class="absolute top-0 right-0 bottom-0 z-[1000] flex w-full flex-col bg-white text-gray-900 shadow-2xl sm:w-80 dark:bg-gray-900 dark:text-white">
    <SidebarHome
      v-if="view === 'home'"
      :route-groups="routeGroups"
      :routes="routes"
      :spots="spots"
      :photos="photos"
      @open-route-group="openRouteGroup"
      @open-route="openRoute"
      @open-spot="openSpot"
      @open-photo="openPhoto"
      @open-waypoints="openWaypoints"
    />

    <FormRouteGroup
      v-else-if="view === 'routeGroup'"
      :route-group="editingRouteGroup"
      @refresh="emit('refresh')"
    />

    <FormRoute
      v-else-if="view === 'route'"
      :route="editingRoute"
      :route-groups="routeGroups"
      :map-click-lat-lng="mapClickLatLng"
      @refresh="emit('refresh')"
      @toggle-picking="emit('togglePicking', $event)"
    />

    <SidebarWaypointsList
      v-else-if="view === 'waypoints' && selectedRoute"
      :route="selectedRoute"
      @refresh="emit('refresh')"
      @edit-waypoint="openWaypoint"
    />

    <FormWaypoint
      v-else-if="view === 'waypoint' && editingWaypoint"
      :waypoint="editingWaypoint"
      @refresh="emit('refresh')"
    />

    <FormSpot
      v-else-if="view === 'spot'"
      :spot="editingSpot"
      :map-click-lat-lng="mapClickLatLng"
      @refresh="emit('refresh')"
      @toggle-picking="emit('togglePicking', $event)"
    />

    <FormPhoto
      v-else-if="view === 'photo'"
      :photo="editingPhoto"
      :map-click-lat-lng="mapClickLatLng"
      @refresh="emit('refresh')"
      @toggle-picking="emit('togglePicking', $event)"
    />
  </div>
</template>
