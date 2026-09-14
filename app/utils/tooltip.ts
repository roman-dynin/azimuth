const HTML_SPECIAL = /[&<>"']/g

// Подставляется в HTML тултипов и иконок, а GET публичный
export function escapeHtml(value: string): string {
  return value.replace(HTML_SPECIAL, (char) => `&#${char.charCodeAt(0)};`)
}

export function getRouteGroupTooltip(routeGroup: IAPIRouteGroup): string {
  const parts: string[] = []

  if (routeGroup.title) {
    parts.push(escapeHtml(routeGroup.title))
  }

  if (routeGroup.description) {
    parts.push(escapeHtml(routeGroup.description))
  }

  return parts.join('<br>')
}

export function getRouteTooltip(route: IAPIRoute): string {
  const parts: string[] = []

  if (route.title) {
    parts.push(escapeHtml(route.title))
  }

  if (route.description) {
    parts.push(escapeHtml(route.description))
  }

  return parts.join('<br>')
}

export function getWaypointTooltip(waypoint: IAPIWaypoint): string {
  const parts: string[] = []

  parts.push(`<span style="color: #d1d5db; font-size: 9px">ID: ${waypoint.id}</span>`)

  if (waypoint.title) {
    parts.push(escapeHtml(waypoint.title))
  }

  if (waypoint.description) {
    parts.push(escapeHtml(waypoint.description))
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

  parts.push(`<span style="color: #d1d5db; font-size: 9px">ID: ${spot.id}</span>`)

  if (spot.title) {
    parts.push(escapeHtml(spot.title))
  }

  if (spot.description) {
    parts.push(escapeHtml(spot.description))
  }

  if (spot.depth !== null) {
    parts.push(`Глубина: ${spot.depth} м.`)
  }

  return parts.join('<br>')
}
