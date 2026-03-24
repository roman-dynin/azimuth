import L from 'leaflet'

export function getRouteGroupWrappers(routeGroups: IAPIRouteGroup[]): Record<number, RouteGroupWrapper> {
  const routeGroupWrappers: Record<number, RouteGroupWrapper> = {}

  routeGroups.forEach((routeGroup) => {
    const featureGroup = new L.FeatureGroup()

    featureGroup.on('mouseover', (event) => {
      event.target.setStyle({ color: 'rgba(0, 255, 0, 0.75)' })
    })

    featureGroup.on('mouseout', (event) => {
      event.target.setStyle({ color: routeGroup.color || getRandomRGB() })
    })

    const help = getRouteGroupTooltip(routeGroup)

    if (help) {
      featureGroup.bindTooltip(help)
    }

    routeGroupWrappers[routeGroup.id] = {
      value: routeGroup,
      featureGroup,
    }
  })

  return routeGroupWrappers
}
