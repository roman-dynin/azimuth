type SidebarState =
  | { view: 'home' }
  | { view: 'routeGroup'; routeGroup: IAPIRouteGroup | null }
  | { view: 'route'; route: IAPIRoute | null }
  | { view: 'waypoints'; route: IAPIRoute }
  | { view: 'waypoint'; route: IAPIRoute; waypoint: IAPIWaypoint }
  | { view: 'spot'; spot: IAPISpot | null }

const show = ref(false)

const state = ref<SidebarState>({ view: 'home' })

export function useSidebar() {
  const { focusOn } = useMapFocus()

  const view = computed(() => state.value.view)

  const editingRouteGroup = computed(() => (state.value.view === 'routeGroup' ? state.value.routeGroup : null))

  const editingRoute = computed(() => (state.value.view === 'route' ? state.value.route : null))

  const editingWaypoint = computed(() => (state.value.view === 'waypoint' ? state.value.waypoint : null))

  const editingSpot = computed(() => (state.value.view === 'spot' ? state.value.spot : null))

  const selectedRoute = computed(() =>
    state.value.view === 'waypoints' || state.value.view === 'waypoint' ? state.value.route : null,
  )

  function open() {
    show.value = true
  }

  function close() {
    show.value = false

    state.value = { view: 'home' }
  }

  function back() {
    const s = state.value

    if (s.view === 'waypoint') {
      state.value = { view: 'waypoints', route: s.route }

      return
    }

    state.value = { view: 'home' }
  }

  function openRouteGroup(routeGroup: IAPIRouteGroup | null) {
    state.value = { view: 'routeGroup', routeGroup }
  }

  function openRoute(route: IAPIRoute | null) {
    state.value = { view: 'route', route }

    if (route) focusOn(route.anchorLat, route.anchorLng)
  }

  function openWaypoints(route: IAPIRoute) {
    state.value = { view: 'waypoints', route }

    focusOn(route.anchorLat, route.anchorLng)
  }

  function openWaypoint(waypoint: IAPIWaypoint) {
    const s = state.value

    if (s.view !== 'waypoints') {
      return
    }

    state.value = { view: 'waypoint', route: s.route, waypoint }

    focusOn(waypoint.lat, waypoint.lng)
  }

  function openSpot(spot: IAPISpot | null) {
    state.value = { view: 'spot', spot }

    if (spot) focusOn(spot.lat, spot.lng)
  }

  function syncRouteGroups(routeGroups: IAPIRouteGroup[]) {
    const s = state.value

    if (s.view === 'routeGroup' && s.routeGroup) {
      const fresh = routeGroups.find((routeGroup) => routeGroup.id === s.routeGroup!.id)

      if (fresh) state.value = { ...s, routeGroup: fresh }
    }
  }

  function syncRoutes(routes: IAPIRoute[]) {
    const s = state.value

    if (s.view === 'route' && s.route) {
      const fresh = routes.find((route) => route.id === s.route!.id)

      if (fresh) state.value = { ...s, route: fresh }
    }

    if (s.view === 'waypoints') {
      const fresh = routes.find((route) => route.id === s.route.id)

      if (fresh) state.value = { ...s, route: fresh }
    }

    if (s.view === 'waypoint') {
      const fresh = routes.find((route) => route.id === s.route.id)

      if (fresh) state.value = { ...s, route: fresh }
    }
  }

  function syncSpots(spots: IAPISpot[]) {
    const s = state.value

    if (s.view === 'spot' && s.spot) {
      const fresh = spots.find((spot) => spot.id === s.spot!.id)

      if (fresh) state.value = { ...s, spot: fresh }
    }
  }

  return {
    show,
    view,
    editingRouteGroup,
    editingRoute,
    editingWaypoint,
    editingSpot,
    selectedRoute,
    open,
    close,
    back,
    openRouteGroup,
    openRoute,
    openWaypoints,
    openWaypoint,
    openSpot,
    syncRouteGroups,
    syncRoutes,
    syncSpots,
  }
}
