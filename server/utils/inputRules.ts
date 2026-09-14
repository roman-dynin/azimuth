// Zod проверяет поля по отдельности, а buildRoutes рассчитывает на их сочетание
export function assertWaypointInput(waypoint: {
  targetWaypointId?: number | null
  azimuth?: number | null
  distance?: number | null
  seconds?: number | null
}): void {
  if (waypoint.targetWaypointId) return

  if (waypoint.azimuth == null || (waypoint.distance == null && waypoint.seconds == null)) {
    throw createError({ statusCode: 422, message: 'Укажите целевую точку либо азимут и дистанцию или время' })
  }
}

export function assertRouteInput(route: {
  anchorWaypointId?: number | null
  anchorLat?: number | null
  anchorLng?: number | null
}): void {
  if (route.anchorWaypointId) return

  if (route.anchorLat == null || route.anchorLng == null) {
    throw createError({ statusCode: 422, message: 'Укажите якорную точку либо координаты якоря' })
  }
}
