export function getRouteWeight(routeGroup: IAPIRouteGroup | undefined, route: IAPIRoute): number {
  if (routeGroup?.weight) {
    return routeGroup.weight
  }

  if (route.weight) {
    return route.weight
  }

  if (route.guideline) {
    return 3
  }

  return 2
}
