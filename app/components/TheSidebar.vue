<script lang="ts" setup>
import type { LatLngLiteral } from 'leaflet'

const props = defineProps<{
  routeGroups: IAPIRouteGroup[]
  routes: IAPIRoute[]
  spots: IAPISpot[]
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
  selectedRoute,
  openRouteGroup,
  openRoute,
  openWaypoints,
  openWaypoint,
  openSpot,
  syncRouteGroups,
  syncRoutes,
  syncSpots,
} = useSidebar()

watch(() => props.routeGroups, syncRouteGroups)

watch(() => props.routes, syncRoutes)

watch(() => props.spots, syncSpots)
</script>

<template>
  <div class="absolute top-0 right-0 bottom-0 z-[1000] flex w-80 flex-col bg-gray-900 text-white shadow-2xl">
    <SidebarHome
      v-if="view === 'home'"
      :route-groups="routeGroups"
      :routes="routes"
      :spots="spots"
      @open-route-group="openRouteGroup"
      @open-route="openRoute"
      @open-spot="openSpot"
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
  </div>
</template>
