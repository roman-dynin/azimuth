export function getRouteGroupTooltip(routeGroup: IAPIRouteGroup): string {
  const parts: string[] = []

  if (routeGroup.title) {
    parts.push(routeGroup.title)
  }

  if (routeGroup.description) {
    parts.push(routeGroup.description)
  }

  return parts.join('<br>')
}

export function getRouteTooltip(route: IAPIRoute): string {
  const parts: string[] = []

  if (route.title) {
    parts.push(route.title)
  }

  if (route.description) {
    parts.push(route.description)
  }

  return parts.join('<br>')
}

export function getWaypointTooltip(waypoint: IAPIWaypoint): string {
  const parts: string[] = []

  parts.push(`<span style="color: #d1d5db; font-size: 9px">ID: ${waypoint.id}</span>`)

  if (waypoint.title) {
    parts.push(waypoint.title)
  }

  if (waypoint.description) {
    parts.push(waypoint.description)
  }

  if (waypoint.azimuth !== null) {
    const reverseAzimuth = (waypoint.azimuth + 180) % 360

    parts.push(`Азимут: &#8599; ${waypoint.azimuth}&deg; &#8601; ${reverseAzimuth}&deg;`)
  }

  if (waypoint.seconds !== null) {
    const minutes = Math.round(waypoint.seconds / 60)

    if (minutes > 0) {
      parts.push(`Время движения от пред. точки: &asymp; ${minutes} мин.`)
    }

    parts.push(`Расстояние от пред. точки: &asymp; ${Math.round(waypoint.distance!)} м.`)
  }

  if (waypoint.depth !== null) {
    parts.push(`Глубина: ${waypoint.depth} м.`)
  }

  return parts.join('<br>')
}

export function getSpotTooltip(spot: IAPISpot): string {
  const parts: string[] = []

  if (spot.title) {
    parts.push(spot.title)
  }

  if (spot.description) {
    parts.push(spot.description)
  }

  if (spot.depth !== null) {
    parts.push(`Глубина: ${spot.depth} м.`)
  }

  return parts.join('<br>')
}
