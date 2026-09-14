export function getRouteColor(routeGroup: IAPIRouteGroup | undefined, route: IAPIRoute): string {
  if (routeGroup?.color) {
    return routeGroup.color
  }

  if (route.color) {
    return route.color
  }

  // Золотой угол: соседние id получают далёкие оттенки
  return `hsl(${(route.id * 137.508) % 360}, 70%, 45%)`
}
