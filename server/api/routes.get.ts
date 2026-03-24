export default defineEventHandler(async () => {
  const routes: IAPIRoute[] = []

  const rawRoutes = await prisma.route.findMany({ orderBy: { id: 'asc' } })

  const handledRouteIds = new Set<number>()

  const waypointsLatLng: Record<number, [number, number]> = {}

  while (handledRouteIds.size < rawRoutes.length) {
    for (const route of rawRoutes) {
      if (handledRouteIds.has(route.id)) {
        continue
      }

      let previousLat: number

      let previousLng: number

      if (route.anchorWaypointId) {
        const waypointLatLng = waypointsLatLng[route.anchorWaypointId]

        if (!waypointLatLng) {
          continue
        }

        [previousLat, previousLng] = waypointLatLng
      }
      else {
        previousLat = route.anchorLat!

        previousLng = route.anchorLng!
      }

      const anchorLat = previousLat

      const anchorLng = previousLng

      const waypoints: IAPIWaypoint[] = []

      const rawWaypoints = await prisma.waypoint.findMany({
        where: {
          routeId: route.id,
        },
        orderBy: {
          id: 'asc',
        },
      })

      let prorogue = false

      for (const waypoint of rawWaypoints) {
        let latLng: [number, number] | undefined

        if (waypoint.targetWaypointId) {
          latLng = waypointsLatLng[waypoint.targetWaypointId]

          if (!latLng) {
            prorogue = true

            break
          }

          [previousLat, previousLng] = latLng

          // TODO: Расчёт azimuth и seconds
        }
        else {
          const distance = waypoint.seconds! * DIVER_SPEED_MULTIPLIER

          const radians = waypoint.azimuth! * (Math.PI / 180)

          const latOffset = distance * Math.cos(radians) / METERS_PER_DEGREE

          const lngOffset = distance * Math.sin(radians) / (METERS_PER_DEGREE * Math.cos(previousLat * (Math.PI / 180)))

          previousLat += latOffset

          previousLng += lngOffset

          latLng = [previousLat, previousLng]

          waypointsLatLng[waypoint.id] = latLng
        }

        waypoints.push({
          id: waypoint.id,
          poi: waypoint.poi,
          title: waypoint.title,
          description: waypoint.description,
          color: waypoint.color,
          azimuth: waypoint.azimuth,
          seconds: waypoint.seconds,
          lat: previousLat,
          lng: previousLng,
        })
      }

      if (prorogue) {
        continue
      }

      routes.push({
        id: route.id,
        routeGroupId: route.routeGroupId,
        guideline: route.guideline,
        title: route.title,
        description: route.description,
        color: route.color,
        weight: route.weight,
        anchorLat,
        anchorLng,
        waypoints,
      })

      handledRouteIds.add(route.id)
    }
  }

  return routes
})
