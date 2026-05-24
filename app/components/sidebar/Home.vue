<script lang="ts" setup>
defineProps<{
  routeGroups: IAPIRouteGroup[]
  routes: IAPIRoute[]
  spots: IAPISpot[]
  photos: IAPIPhoto[]
}>()

const emit = defineEmits<{
  openRouteGroup: [group: IAPIRouteGroup | null]
  openRoute: [route: IAPIRoute | null]
  openWaypoints: [route: IAPIRoute]
  openSpot: [spot: IAPISpot | null]
  openPhoto: [photo: IAPIPhoto | null]
}>()
</script>

<template>
  <SidebarHeader title="Управление" />

  <div class="flex-1 overflow-y-auto">
    <SidebarRouteGroupsList
      :route-groups="routeGroups"
      @open="emit('openRouteGroup', $event)"
    />

    <div class="border-t border-gray-800" />

    <SidebarRoutesList
      :routes="routes"
      @open="emit('openRoute', $event)"
      @open-waypoints="emit('openWaypoints', $event)"
    />

    <div class="border-t border-gray-800" />

    <SidebarSpotsList
      :spots="spots"
      @open="emit('openSpot', $event)"
    />

    <div class="border-t border-gray-800" />

    <SidebarPhotosList
      :photos="photos"
      @open="emit('openPhoto', $event)"
    />
  </div>
</template>
