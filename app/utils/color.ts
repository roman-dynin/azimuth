export const getRandomColorValue = () => Math.floor(Math.random() * 254)

export const getRandomRGB = () => `rgba(${getRandomColorValue()}, ${getRandomColorValue()}, ${getRandomColorValue()}, 0.75)`

export function getRouteColor(routeGroup: IAPIRouteGroup | undefined, route: IAPIRoute): string {
  if (routeGroup?.color) {
    return routeGroup.color
  }

  if (route.color) {
    return route.color
  }

  return getRandomRGB()
}
