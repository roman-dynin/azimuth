import L from 'leaflet'

export function getRouteGroupProxies(routeGroups: IAPIRouteGroup[]): Record<number, RouteGroupProxy> {
  const routeGroupProxies: Record<number, RouteGroupProxy> = {}

  routeGroups.forEach((routeGroup) => {
    const featureGroup = new L.FeatureGroup()

    // Класс, а не setStyle: сброс не должен знать исходный цвет
    const setHover = (on: boolean) =>
      featureGroup.eachLayer((layer) => (layer as L.Path).getElement()?.classList.toggle('route--hover', on))

    featureGroup.on('mouseover', () => setHover(true))

    featureGroup.on('mouseout', () => setHover(false))

    const tooltip = getRouteGroupTooltip(routeGroup)

    if (tooltip) {
      featureGroup.bindTooltip(tooltip, { permanent: true, className: 'route-label' })
    }

    routeGroupProxies[routeGroup.id] = {
      value: routeGroup,
      featureGroup,
    }
  })

  return routeGroupProxies
}
