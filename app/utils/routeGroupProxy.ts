import L from 'leaflet'

export function getRouteGroupProxies(routeGroups: IAPIRouteGroup[]): Record<number, RouteGroupProxy> {
  const routeGroupProxies: Record<number, RouteGroupProxy> = {}

  routeGroups.forEach((routeGroup) => {
    const featureGroup = new L.FeatureGroup()

    featureGroup.on('mouseover', (event) => {
      event.target.setStyle({ color: 'rgba(0, 255, 0, 0.75)' })
    })

    featureGroup.on('mouseout', (event) => {
      event.target.setStyle({ color: routeGroup.color || getRandomRGBA() })
    })

    const tooltip = getRouteGroupTooltip(routeGroup)

    if (tooltip) {
      featureGroup.bindTooltip(tooltip, { permanent: true })
    }

    routeGroupProxies[routeGroup.id] = {
      value: routeGroup,
      featureGroup,
    }
  })

  return routeGroupProxies
}
