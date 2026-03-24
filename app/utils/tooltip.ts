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

  parts.push(`Точка #${waypoint.id}`)

  if (waypoint.title) {
    parts.push(waypoint.title)
  }

  if (waypoint.description) {
    parts.push(waypoint.description)
  }

  if (waypoint.azimuth) {
    parts.push(`Азимут: ${waypoint.azimuth}&deg;`)
  }

  if (waypoint.seconds) {
    parts.push(`Время движения от пред. точки: &asymp; ${Math.round(waypoint.seconds / 60)} мин.`)
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

  return parts.join('<br>')
}
