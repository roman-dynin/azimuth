export default defineEventHandler(async () => {
  const routes: IAPIRoute[] = []

  const handledRouteIds = new Set<number>()

  const waypointsLatLng: Record<number, [number, number]> = {}

  const rawRoutes = await prisma.route.findMany({
    orderBy: {
      id: 'asc',
    },
  })

  while (handledRouteIds.size < rawRoutes.length) {
    for (const route of rawRoutes) {
      if (handledRouteIds.has(route.id)) {
        continue
      }

      let anchorLat: number

      let anchorLng: number

      if (route.anchorWaypointId) {
        const waypointLatLng = waypointsLatLng[route.anchorWaypointId]

        if (!waypointLatLng) {
          continue
        }

        [anchorLat, anchorLng] = waypointLatLng
      }
      else {
        anchorLat = route.anchorLat!

        anchorLng = route.anchorLng!
      }

      const routeAnchorLat = anchorLat

      const routeAnchorLng = anchorLng

      const rawWaypoints = await prisma.waypoint.findMany({
        where: {
          routeId: route.id,
        },
        orderBy: {
          id: 'asc',
        },
      })

      let prorogueRoute = false

      const waypoints: IAPIWaypoint[] = []

      for (const waypoint of rawWaypoints) {
        let latLng: [number, number] | undefined

        if (waypoint.targetWaypointId) {
          latLng = waypointsLatLng[waypoint.targetWaypointId]

          if (!latLng) {
            prorogueRoute = true

            break
          }

          [anchorLat, anchorLng] = latLng

          // TODO: Расчёт направления и времени
        }
        else {
          const distance = waypoint.seconds! * DIVER_SPEED_MULTIPLIER

          const radians = waypoint.azimuth! * (Math.PI / 180)

          const latOffset = distance * Math.cos(radians) / METERS_PER_DEGREE

          const lngOffset = distance * Math.sin(radians) / (METERS_PER_DEGREE * Math.cos(anchorLat * (Math.PI / 180)))

          anchorLat += latOffset

          anchorLng += lngOffset

          latLng = [anchorLat, anchorLng]

          waypointsLatLng[waypoint.id] = latLng
        }

        waypoints.push({
          id: waypoint.id,
          title: waypoint.title,
          description: waypoint.description,
          isNotable: waypoint.isNotable,
          azimuth: waypoint.azimuth,
          seconds: waypoint.seconds,
          lat: anchorLat,
          lng: anchorLng,
        })
      }

      if (prorogueRoute) {
        continue
      }

      routes.push({
        id: route.id,
        routeGroupId: route.routeGroupId,
        title: route.title,
        description: route.description,
        isGuideline: route.isGuideline,
        anchorLat: routeAnchorLat,
        anchorLng: routeAnchorLng,
        waypoints,
      })

      handledRouteIds.add(route.id)
    }
  }

  return routes
})
